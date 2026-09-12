import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hashJson } from '../common/hash-chain';
import { randomUUID } from 'crypto';

@Injectable()
export class CapacitacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async listCursos() {
    const data = await this.prisma.curso.findMany({
      where: { activo: true },
      orderBy: { codigo: 'asc' },
    });
    return { data, total: data.length };
  }

  async findCurso(id: string) {
    const curso = await this.prisma.curso.findUnique({
      where: { id },
      include: { preguntas: { orderBy: { orden: 'asc' } } },
    });
    if (!curso) throw new NotFoundException('Curso no encontrado');
    return curso;
  }

  /** RN-801: Certificate only if puntaje >= 70 */
  async evaluar(tenantId: string, cursoId: string, respuestas: number[], personaNombre: string) {
    const curso = await this.prisma.curso.findUnique({
      where: { id: cursoId },
      include: { preguntas: { orderBy: { orden: 'asc' } } },
    });
    if (!curso) throw new NotFoundException('Curso no encontrado');

    // Calculate score
    let correctas = 0;
    for (let i = 0; i < curso.preguntas.length; i++) {
      const pregunta = curso.preguntas[i]!;
      if (respuestas[i] === pregunta.correcta) correctas++;
    }
    const puntaje = Math.round((correctas / curso.preguntas.length) * 100);
    const aprobado = puntaje >= 70;

    // Count previous attempts
    const intentos = await this.prisma.evaluacion.count({
      where: { tenantId, cursoId, personaNombre },
    });

    const evaluacion = await this.prisma.evaluacion.create({
      data: {
        tenantId, cursoId, personaNombre,
        puntaje, aprobado,
        intento: intentos + 1,
      },
    });

    // RN-801: Emit certificate if approved
    let certificado = null;
    if (aprobado) {
      const codigo = `CERT-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`;
      const hash = hashJson({ evaluacionId: evaluacion.id, puntaje, cursoId, personaNombre, fecha: evaluacion.fecha.toISOString() });

      certificado = await this.prisma.certificado.create({
        data: {
          tenantId, evaluacionId: evaluacion.id,
          codigo, hashSha256: hash,
        },
      });
    }

    return { evaluacion, certificado, puntaje, aprobado };
  }

  async listEvaluaciones(tenantId: string, cursoId?: string) {
    const where: any = { tenantId };
    if (cursoId) where.cursoId = cursoId;

    const data = await this.prisma.evaluacion.findMany({
      where,
      include: { curso: { select: { titulo: true, codigo: true } }, certificado: true },
      orderBy: { fecha: 'desc' },
    });
    return { data, total: data.length };
  }

  async getCertificado(id: string) {
    const cert = await this.prisma.certificado.findUnique({
      where: { id },
      include: { evaluacion: { include: { curso: true } } },
    });
    if (!cert) throw new NotFoundException('Certificado no encontrado');
    return cert;
  }

  /** Central: KPIs for training dashboard */
  async getCentral(tenantId: string) {
    const evaluaciones = await this.prisma.evaluacion.findMany({ where: { tenantId } });
    const aprobadas = evaluaciones.filter(e => e.aprobado).length;
    const puntajes = evaluaciones.map(e => e.puntaje);
    const promedio = puntajes.length > 0 ? Math.round(puntajes.reduce((a, b) => a + b, 0) / puntajes.length) : 0;

    const cursos = await this.prisma.curso.findMany({ where: { activo: true } });
    const avancePorModulo = await Promise.all(
      cursos.map(async (c) => {
        const evals = evaluaciones.filter(e => e.cursoId === c.id);
        const aprob = evals.filter(e => e.aprobado).length;
        return { cursoId: c.id, titulo: c.titulo, aprobados: aprob, total: evals.length, porcentaje: evals.length > 0 ? Math.round((aprob / evals.length) * 100) : 0 };
      }),
    );

    return {
      evaluacionesCompletadas: evaluaciones.length,
      tasaAprobacion: evaluaciones.length > 0 ? Math.round((aprobadas / evaluaciones.length) * 100) : 0,
      puntajePromedio: promedio,
      personasSinCapacitar: 0, // TODO: derive from tenant users
      avancePorModulo,
    };
  }
}
