import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getAnthropicClient, getModelConfig } from './anthropic.client';
import { CorpusRetriever, CitaNormativa } from './corpus-retriever';
import { SYSTEM_PROMPT } from './prompts/system';
import { TOOL_DEFINITIONS } from './tools/definitions';
import { executeToolCall } from './tools/executor';

interface ChatInput {
  conversacionId?: string;
  mensaje: string;
  tenantId: string;
  userId: string;
  rol: string;
}

@Injectable()
export class AgenteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly retriever: CorpusRetriever,
  ) {}

  async chat(input: ChatInput) {
    // Check if agent is paused for this tenant
    // TODO: Check pause state in Redis/config

    // Get or create conversation
    let conversacionId = input.conversacionId;
    if (!conversacionId) {
      const conv = await this.prisma.agenteConversacion.create({
        data: { tenantId: input.tenantId, usuarioId: input.userId },
      });
      conversacionId = conv.id;
    }

    // Save user message
    await this.prisma.agenteMensaje.create({
      data: {
        conversacionId,
        rol: 'USER',
        contenido: input.mensaje,
      },
    });

    // Get conversation history
    const history = await this.prisma.agenteMensaje.findMany({
      where: { conversacionId },
      orderBy: { createdAt: 'asc' },
      take: 20, // last 20 messages for context
    });

    // Retrieve relevant corpus chunks for RAG context
    const chunks = await this.retriever.buscar(input.mensaje);
    const ragContext = chunks.length > 0
      ? `\n\n--- CONTEXTO NORMATIVO (corpus verificado) ---\n${chunks.map(c =>
          `[${c.cita.identificador}] ${c.cita.titulo} (${c.cita.fuente}, hash: ${c.cita.hash})\n${c.contenido}`
        ).join('\n\n')}\n--- FIN CONTEXTO ---`
      : '';

    // Build messages for Anthropic
    const messages = history.map(m => ({
      role: m.rol === 'USER' ? 'user' as const : 'assistant' as const,
      content: m.contenido,
    }));

    // Call Anthropic API
    const config = getModelConfig();
    const client = getAnthropicClient();

    try {
      const response = await client.messages.create({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        system: SYSTEM_PROMPT + ragContext,
        messages,
        tools: TOOL_DEFINITIONS as any,
      });

      // Process tool calls if any
      const citas: CitaNormativa[] = [...chunks.map(c => c.cita)];
      let finalContent = '';
      const toolCalls: Array<{ name: string; input: unknown; output: unknown }> = [];

      for (const block of response.content) {
        if (block.type === 'text') {
          finalContent += block.text;
        } else if (block.type === 'tool_use') {
          const toolResult = await executeToolCall(
            block.name,
            block.input as Record<string, unknown>,
            { tenantId: input.tenantId, userId: input.userId, rol: input.rol },
            this.prisma,
          );
          toolCalls.push({ name: block.name, input: block.input, output: toolResult });
        }
      }

      // Save assistant message
      await this.prisma.agenteMensaje.create({
        data: {
          conversacionId,
          rol: 'ASSISTANT',
          contenido: finalContent,
          citas: citas.length > 0 ? citas as any : undefined,
          tokensIn: response.usage.input_tokens,
          tokensOut: response.usage.output_tokens,
        },
      });

      // Record activity for ticker
      await this.prisma.agenteActividad.create({
        data: {
          tenantId: input.tenantId,
          fase: 0, // general
          descripcion: `Respondiendo consulta: "${input.mensaje.slice(0, 80)}"`,
        },
      });

      return {
        conversacionId,
        respuesta: finalContent,
        citas,
        toolCalls,
        usage: { input: response.usage.input_tokens, output: response.usage.output_tokens },
      };
    } catch (error: any) {
      // Save error as system message
      await this.prisma.agenteMensaje.create({
        data: {
          conversacionId,
          rol: 'ASSISTANT',
          contenido: `Error al procesar la consulta: ${error.message ?? 'Error desconocido'}`,
        },
      });
      throw error;
    }
  }

  async listConversaciones(tenantId: string, userId: string) {
    return this.prisma.agenteConversacion.findMany({
      where: { tenantId, usuarioId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getConversacion(id: string, tenantId: string) {
    return this.prisma.agenteConversacion.findFirst({
      where: { id, tenantId },
      include: { mensajes: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async getActividad(tenantId: string) {
    const recientes = await this.prisma.agenteActividad.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Fallback to template messages from spec
    const plantillas = [
      { fase: 6, descripcion: 'Procesando hallazgos de auditoría para ciclo PHVA de mejora continua' },
      { fase: 2, descripcion: 'Analizando bases legales de tratamientos en el RAT actualizado' },
      { fase: 4, descripcion: 'Revisando cláusulas DPA con encargados de tratamiento externos' },
      { fase: 6, descripcion: 'Monitoreando registro de incidentes · Protocolo 72h SPDP activo' },
      { fase: 5, descripcion: 'Verificando plazos ARCO-PS · 15 días hábiles' },
      { fase: 2, descripcion: 'Revisando EIPD — verificando criterios de alto riesgo LOPDP Art. 39' },
    ];

    return recientes.length > 0
      ? recientes.map(a => ({ fase: a.fase, descripcion: a.descripcion, createdAt: a.createdAt }))
      : plantillas;
  }

  async getBandeja(tenantId: string) {
    const [hallazgosPropuestos, firmasPendientes, observaciones] = await Promise.all([
      this.prisma.hallazgo.count({ where: { tenantId, estado: 'ABIERTO' } }),
      this.prisma.solicitudFirma.count({ where: { tenantId, estado: 'PENDIENTE' } }),
      this.prisma.recomendacion.count({ where: { tenantId, estado: 'EMITIDA' } }),
    ]);

    return { hallazgosPropuestos, firmasPendientes, recomendacionesPendientes: observaciones };
  }

  async getMetricas(tenantId: string) {
    const total = await this.prisma.agenteMensaje.count({
      where: { conversacion: { tenantId }, rol: 'ASSISTANT' },
    });
    return { totalRespuestas: total, citasVerificadas: 0, propuestasEmitidas: 0 };
  }
}
