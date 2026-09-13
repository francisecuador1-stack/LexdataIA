import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/badge_chip.dart';

// ---------------------------------------------------------------------------
// Domain model
// ---------------------------------------------------------------------------

enum EstadoModulo { noIniciado, enCurso, aprobado }

enum NivelModulo { basico, intermedio, avanzado }

class ModuloCapacitacion {
  const ModuloCapacitacion({
    required this.id,
    required this.titulo,
    required this.nivel,
    required this.categoria,
    required this.baseNormativa,
    required this.duracion,
    required this.estado,
    this.progreso = 0.0,
    this.puntaje,
    this.codigoCertificado,
    this.hashCertificado,
    this.descargado = false,
    this.ultimoContenidoVisto = 0,
  });

  final String id;
  final String titulo;
  final NivelModulo nivel;
  final String categoria;
  final String baseNormativa;
  final String duracion;
  final EstadoModulo estado;
  final double progreso;
  final int? puntaje;
  final String? codigoCertificado;
  final String? hashCertificado;
  final bool descargado;
  final int ultimoContenidoVisto;

  ModuloCapacitacion copyWith({
    EstadoModulo? estado,
    double? progreso,
    int? puntaje,
    String? codigoCertificado,
    String? hashCertificado,
    bool? descargado,
    int? ultimoContenidoVisto,
  }) {
    return ModuloCapacitacion(
      id: id,
      titulo: titulo,
      nivel: nivel,
      categoria: categoria,
      baseNormativa: baseNormativa,
      duracion: duracion,
      estado: estado ?? this.estado,
      progreso: progreso ?? this.progreso,
      puntaje: puntaje ?? this.puntaje,
      codigoCertificado: codigoCertificado ?? this.codigoCertificado,
      hashCertificado: hashCertificado ?? this.hashCertificado,
      descargado: descargado ?? this.descargado,
      ultimoContenidoVisto: ultimoContenidoVisto ?? this.ultimoContenidoVisto,
    );
  }
}

class PreguntaEvaluacion {
  const PreguntaEvaluacion({
    required this.enunciado,
    required this.opciones,
    required this.respuestaCorrecta,
  });

  final String enunciado;
  final List<String> opciones;
  final int respuestaCorrecta;
}

class ResultadoEvaluacion {
  const ResultadoEvaluacion({
    required this.moduloId,
    required this.puntaje,
    required this.aprobado,
    required this.respuestas,
    required this.timestamp,
    this.sincronizado = false,
    this.codigoCertificado,
    this.hashCertificado,
  });

  final String moduloId;
  final int puntaje;
  final bool aprobado;
  final List<int> respuestas;
  final DateTime timestamp;
  final bool sincronizado;
  final String? codigoCertificado;
  final String? hashCertificado;
}

// ---------------------------------------------------------------------------
// Mock data — 8 modules with varied states
// ---------------------------------------------------------------------------

final List<ModuloCapacitacion> _mockModulos = [
  const ModuloCapacitacion(
    id: 'CAP-001',
    titulo: 'Fundamentos de la LOPDP',
    nivel: NivelModulo.basico,
    categoria: 'Normativa',
    baseNormativa: 'LOPDP Arts. 1-10',
    duracion: '2h',
    estado: EstadoModulo.aprobado,
    progreso: 1.0,
    puntaje: 92,
    codigoCertificado: 'CERT-CAP001-20260815',
    hashCertificado: 'a3f7c2d1e5b9...',
    descargado: true,
    ultimoContenidoVisto: 12,
  ),
  const ModuloCapacitacion(
    id: 'CAP-002',
    titulo: 'Derechos ARCO-PS del Titular',
    nivel: NivelModulo.intermedio,
    categoria: 'Derechos',
    baseNormativa: 'LOPDP Arts. 17-24',
    duracion: '1.5h',
    estado: EstadoModulo.enCurso,
    progreso: 0.65,
    descargado: true,
    ultimoContenidoVisto: 7,
  ),
  const ModuloCapacitacion(
    id: 'CAP-003',
    titulo: 'Gestión de Incidentes y Notificación 72h',
    nivel: NivelModulo.avanzado,
    categoria: 'Seguridad',
    baseNormativa: 'LOPDP Art. 41, Reglamento SPDP',
    duracion: '2.5h',
    estado: EstadoModulo.aprobado,
    progreso: 1.0,
    puntaje: 85,
    codigoCertificado: 'CERT-CAP003-20260820',
    hashCertificado: 'b8e4f1a2c6d3...',
    descargado: true,
    ultimoContenidoVisto: 15,
  ),
  const ModuloCapacitacion(
    id: 'CAP-004',
    titulo: 'Evaluación de Impacto (EIPD)',
    nivel: NivelModulo.avanzado,
    categoria: 'Riesgo',
    baseNormativa: 'LOPDP Art. 28, RGLOPDP Arts. 36-40',
    duracion: '3h',
    estado: EstadoModulo.enCurso,
    progreso: 0.3,
    descargado: false,
    ultimoContenidoVisto: 3,
  ),
  const ModuloCapacitacion(
    id: 'CAP-005',
    titulo: 'Consentimiento y Bases de Legitimación',
    nivel: NivelModulo.basico,
    categoria: 'Normativa',
    baseNormativa: 'LOPDP Arts. 7-8',
    duracion: '1h',
    estado: EstadoModulo.noIniciado,
    descargado: false,
  ),
  const ModuloCapacitacion(
    id: 'CAP-006',
    titulo: 'Registro de Actividades de Tratamiento (RAT)',
    nivel: NivelModulo.intermedio,
    categoria: 'Gestión',
    baseNormativa: 'LOPDP Art. 47, RGLOPDP Art. 24',
    duracion: '2h',
    estado: EstadoModulo.noIniciado,
    descargado: false,
  ),
  const ModuloCapacitacion(
    id: 'CAP-007',
    titulo: 'Transferencias Internacionales de Datos',
    nivel: NivelModulo.avanzado,
    categoria: 'Normativa',
    baseNormativa: 'LOPDP Arts. 38-40',
    duracion: '2h',
    estado: EstadoModulo.aprobado,
    progreso: 1.0,
    puntaje: 70,
    codigoCertificado: 'CERT-CAP007-20260901',
    hashCertificado: 'c9d2e3f4a7b1...',
    descargado: true,
    ultimoContenidoVisto: 10,
  ),
  const ModuloCapacitacion(
    id: 'CAP-008',
    titulo: 'Seguridad de la Información y Medidas Técnicas',
    nivel: NivelModulo.intermedio,
    categoria: 'Seguridad',
    baseNormativa: 'LOPDP Art. 37, RGLOPDP Arts. 44-49',
    duracion: '2.5h',
    estado: EstadoModulo.noIniciado,
    descargado: false,
  ),
];

List<PreguntaEvaluacion> _mockPreguntas(String moduloId) {
  // Returns 10 mock questions per module
  return List.generate(10, (i) {
    return PreguntaEvaluacion(
      enunciado: 'Pregunta ${i + 1}: ¿Cuál de las siguientes afirmaciones '
          'es correcta respecto al módulo $moduloId?',
      opciones: [
        'Opción A — Respuesta incorrecta de ejemplo',
        'Opción B — Respuesta correcta de ejemplo',
        'Opción C — Respuesta incorrecta de ejemplo',
        'Opción D — Respuesta incorrecta de ejemplo',
      ],
      respuestaCorrecta: 1,
    );
  });
}

// ---------------------------------------------------------------------------
// Riverpod providers
// ---------------------------------------------------------------------------

final modulosProvider =
    StateNotifierProvider<ModulosNotifier, List<ModuloCapacitacion>>((ref) {
  return ModulosNotifier();
});

class ModulosNotifier extends StateNotifier<List<ModuloCapacitacion>> {
  ModulosNotifier() : super(_mockModulos);

  // RN-10: INV-10 — Certificado solo si puntaje >= 70
  void completarEvaluacion(String moduloId, int puntaje) {
    state = [
      for (final m in state)
        if (m.id == moduloId)
          m.copyWith(
            estado: EstadoModulo.aprobado,
            progreso: 1.0,
            puntaje: puntaje,
            codigoCertificado: puntaje >= 70
                ? 'CERT-${moduloId.replaceAll('-', '')}-${DateTime.now().millisecondsSinceEpoch}'
                : null,
            hashCertificado: puntaje >= 70
                ? 'sha256:${moduloId.hashCode.toRadixString(16)}${DateTime.now().millisecondsSinceEpoch.toRadixString(16)}'
                : null,
          )
        else
          m,
    ];
  }

  void toggleDescarga(String moduloId) {
    state = [
      for (final m in state)
        if (m.id == moduloId)
          m.copyWith(descargado: !m.descargado)
        else
          m,
    ];
  }

  void actualizarProgreso(String moduloId, double progreso) {
    state = [
      for (final m in state)
        if (m.id == moduloId)
          m.copyWith(
            progreso: progreso,
            estado: progreso > 0 ? EstadoModulo.enCurso : m.estado,
          )
        else
          m,
    ];
  }
}

final evaluacionActivaProvider =
    StateProvider<String?>((ref) => null);

final preguntasProvider =
    Provider.family<List<PreguntaEvaluacion>, String>((ref, moduloId) {
  return _mockPreguntas(moduloId);
});

// Tracks pending evaluations for idempotent sync
final _pendingSyncProvider =
    StateProvider<Map<String, ResultadoEvaluacion>>((ref) => {});

final conectadoProvider = StateProvider<bool>((ref) => true);

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

class CapacitacionesScreen extends ConsumerWidget {
  const CapacitacionesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final modulos = ref.watch(modulosProvider);
    final evaluacionActiva = ref.watch(evaluacionActivaProvider);

    if (evaluacionActiva != null) {
      return _EvaluacionFlow(moduloId: evaluacionActiva);
    }

    final aprobados = modulos.where((m) => m.estado == EstadoModulo.aprobado).length;
    final enCurso = modulos.where((m) => m.estado == EstadoModulo.enCurso).length;
    final pendientes = modulos.where((m) => m.estado == EstadoModulo.noIniciado).length;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: AppColors.navy900,
        foregroundColor: Colors.white,
        title: const Text('Capacitaciones'),
        actions: [
          // Connectivity indicator
          Consumer(builder: (context, ref, _) {
            final conectado = ref.watch(conectadoProvider);
            return IconButton(
              icon: Icon(
                conectado ? Icons.cloud_done : Icons.cloud_off,
                color: conectado ? AppColors.green600 : AppColors.amber500,
              ),
              tooltip: conectado ? 'Conectado' : 'Sin conexión',
              onPressed: () {
                ref.read(conectadoProvider.notifier).state = !conectado;
                if (!conectado) {
                  _sincronizarPendientes(context, ref);
                }
              },
            );
          }),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Summary header
          _ResumenCard(
            aprobados: aprobados,
            enCurso: enCurso,
            pendientes: pendientes,
            total: modulos.length,
          ),
          const SizedBox(height: 16),
          // Section label
          const Padding(
            padding: EdgeInsets.only(bottom: 8),
            child: Text(
              'CATÁLOGO DE MÓDULOS',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 1.0,
                color: AppColors.slate600,
              ),
            ),
          ),
          // Module list
          ...modulos.map((m) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _ModuloCard(modulo: m),
              )),
          const SizedBox(height: 24),
          // Push reminder section
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.blue50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.slate200),
            ),
            child: Row(
              children: [
                const Icon(Icons.notifications_active,
                    size: 20, color: AppColors.blue600),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Recordatorios del plan anual',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.slate700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '$pendientes módulo(s) pendiente(s) en tu plan.',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.slate500,
                        ),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: true,
                  activeThumbColor: AppColors.blue600,
                  onChanged: (_) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content:
                            Text('Recordatorios push activados para módulos pendientes.'),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _sincronizarPendientes(BuildContext context, WidgetRef ref) {
    final pending = ref.read(_pendingSyncProvider);
    if (pending.isEmpty) return;

    // Idempotent sync: each evaluation is registered only once
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
            'Sincronizando ${pending.length} evaluación(es) pendiente(s)...'),
        backgroundColor: AppColors.blue600,
      ),
    );

    // Clear pending after sync
    ref.read(_pendingSyncProvider.notifier).state = {};
  }
}

// ---------------------------------------------------------------------------
// Resumen card
// ---------------------------------------------------------------------------

class _ResumenCard extends StatelessWidget {
  const _ResumenCard({
    required this.aprobados,
    required this.enCurso,
    required this.pendientes,
    required this.total,
  });

  final int aprobados;
  final int enCurso;
  final int pendientes;
  final int total;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.slate200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'PROGRESO DEL PLAN ANUAL',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.0,
              color: AppColors.slate600,
            ),
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: total > 0 ? aprobados / total : 0,
              backgroundColor: AppColors.slate200,
              color: AppColors.green600,
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _StatChip(
                  label: 'Aprobados', value: '$aprobados', color: AppColors.green600),
              const SizedBox(width: 12),
              _StatChip(
                  label: 'En curso', value: '$enCurso', color: AppColors.amber600),
              const SizedBox(width: 12),
              _StatChip(
                  label: 'Pendientes', value: '$pendientes', color: AppColors.slate400),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Text(value,
                style: TextStyle(
                    fontSize: 20, fontWeight: FontWeight.w700, color: color)),
            const SizedBox(height: 2),
            Text(label,
                style: const TextStyle(fontSize: 10, color: AppColors.slate500)),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Module card
// ---------------------------------------------------------------------------

class _ModuloCard extends ConsumerWidget {
  const _ModuloCard({required this.modulo});

  final ModuloCapacitacion modulo;

  String get _nivelLabel => switch (modulo.nivel) {
        NivelModulo.basico => 'Básico',
        NivelModulo.intermedio => 'Intermedio',
        NivelModulo.avanzado => 'Avanzado',
      };

  String get _estadoLabel => switch (modulo.estado) {
        EstadoModulo.noIniciado => 'No iniciado',
        EstadoModulo.enCurso => 'En curso',
        EstadoModulo.aprobado => 'Aprobado',
      };

  Color get _estadoColor => switch (modulo.estado) {
        EstadoModulo.aprobado => AppColors.green600,
        EstadoModulo.enCurso => AppColors.amber600,
        EstadoModulo.noIniciado => AppColors.slate400,
      };

  Color get _nivelColor => switch (modulo.nivel) {
        NivelModulo.basico => AppColors.blue500,
        NivelModulo.intermedio => AppColors.amber600,
        NivelModulo.avanzado => AppColors.red500,
      };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.slate200),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => _onTap(context, ref),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top row: badges + duration
                Row(
                  children: [
                    BadgeChip(label: modulo.categoria, color: AppColors.blue600),
                    const SizedBox(width: 6),
                    BadgeChip(label: _nivelLabel, color: _nivelColor),
                    const Spacer(),
                    Icon(
                      modulo.descargado
                          ? Icons.download_done
                          : Icons.cloud_download_outlined,
                      size: 16,
                      color: modulo.descargado
                          ? AppColors.green600
                          : AppColors.slate400,
                    ),
                    const SizedBox(width: 6),
                    Text(modulo.duracion,
                        style: const TextStyle(
                            fontSize: 12, color: AppColors.slate400)),
                  ],
                ),
                const SizedBox(height: 10),
                // Title
                Text(modulo.titulo,
                    style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppColors.slate700)),
                const SizedBox(height: 4),
                // Normative base
                Text(modulo.baseNormativa,
                    style: const TextStyle(
                        fontSize: 11, color: AppColors.slate500)),
                const SizedBox(height: 10),
                // Status row
                Row(
                  children: [
                    BadgeChip(label: _estadoLabel, color: _estadoColor),
                    if (modulo.puntaje != null) ...[
                      const SizedBox(width: 8),
                      Text('${modulo.puntaje}%',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: modulo.puntaje! >= 70
                                ? AppColors.green600
                                : AppColors.red500,
                          )),
                    ],
                    const Spacer(),
                    if (modulo.estado == EstadoModulo.aprobado &&
                        modulo.codigoCertificado != null)
                      const Icon(Icons.verified,
                          size: 18, color: AppColors.green600),
                  ],
                ),
                // Progress bar for in-progress modules
                if (modulo.estado == EstadoModulo.enCurso) ...[
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(2),
                          child: LinearProgressIndicator(
                            value: modulo.progreso,
                            backgroundColor: AppColors.slate200,
                            color: AppColors.blue600,
                            minHeight: 4,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text('${(modulo.progreso * 100).toInt()}%',
                          style: const TextStyle(
                              fontSize: 11, color: AppColors.slate500)),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _onTap(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _ModuloDetailSheet(modulo: modulo),
    );
  }
}

// ---------------------------------------------------------------------------
// Module detail bottom sheet
// ---------------------------------------------------------------------------

class _ModuloDetailSheet extends ConsumerWidget {
  const _ModuloDetailSheet({required this.modulo});

  final ModuloCapacitacion modulo;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DraggableScrollableSheet(
      initialChildSize: 0.65,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) {
        return SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.slate200,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(modulo.titulo,
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.slate700)),
              const SizedBox(height: 8),
              // Info rows
              _InfoRow(icon: Icons.category, label: modulo.categoria),
              _InfoRow(icon: Icons.school, label: switch (modulo.nivel) {
                NivelModulo.basico => 'Básico',
                NivelModulo.intermedio => 'Intermedio',
                NivelModulo.avanzado => 'Avanzado',
              }),
              _InfoRow(icon: Icons.gavel, label: modulo.baseNormativa),
              _InfoRow(icon: Icons.timer, label: 'Duración: ${modulo.duracion}'),
              _InfoRow(
                icon: modulo.descargado ? Icons.download_done : Icons.cloud_download,
                label: modulo.descargado
                    ? 'Contenido descargado (disponible offline)'
                    : 'Requiere descarga para uso offline',
              ),
              if (modulo.estado == EstadoModulo.enCurso)
                _InfoRow(
                  icon: Icons.bookmark,
                  label:
                      'Último contenido visto: sección ${modulo.ultimoContenidoVisto}',
                ),
              const SizedBox(height: 20),
              // Actions
              if (!modulo.descargado)
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () {
                      ref
                          .read(modulosProvider.notifier)
                          .toggleDescarga(modulo.id);
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text(
                                'Descargando contenido para consumo offline...')),
                      );
                    },
                    icon: const Icon(Icons.download, size: 18),
                    label: const Text('Descargar para offline'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.blue600,
                      side: const BorderSide(color: AppColors.blue600),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              if (modulo.descargado)
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () {
                      ref
                          .read(modulosProvider.notifier)
                          .toggleDescarga(modulo.id);
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Contenido offline eliminado.')),
                      );
                    },
                    icon: const Icon(Icons.delete_outline, size: 18),
                    label: const Text('Eliminar descarga'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.slate500,
                      side: const BorderSide(color: AppColors.slate200),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              const SizedBox(height: 10),
              if (modulo.estado == EstadoModulo.enCurso ||
                  modulo.estado == EstadoModulo.noIniciado)
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      if (modulo.estado == EstadoModulo.noIniciado) {
                        ref
                            .read(modulosProvider.notifier)
                            .actualizarProgreso(modulo.id, 0.1);
                      }
                      // Simulate content consumption then start evaluation
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(modulo.estado == EstadoModulo.enCurso
                              ? 'Retomando desde sección ${modulo.ultimoContenidoVisto}...'
                              : 'Iniciando módulo...'),
                          action: SnackBarAction(
                            label: 'Ir a evaluación',
                            textColor: Colors.white,
                            onPressed: () {
                              ref.read(evaluacionActivaProvider.notifier).state =
                                  modulo.id;
                            },
                          ),
                          backgroundColor: AppColors.blue600,
                          duration: const Duration(seconds: 5),
                        ),
                      );
                    },
                    icon: Icon(
                      modulo.estado == EstadoModulo.enCurso
                          ? Icons.play_arrow
                          : Icons.play_circle_outline,
                      size: 18,
                    ),
                    label: Text(modulo.estado == EstadoModulo.enCurso
                        ? 'Continuar módulo'
                        : 'Iniciar módulo'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.blue600,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              if (modulo.estado == EstadoModulo.aprobado &&
                  modulo.codigoCertificado != null) ...[
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      _mostrarCertificado(context, modulo);
                    },
                    icon: const Icon(Icons.verified, size: 18),
                    label: const Text('Ver certificado'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.green600,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  void _mostrarCertificado(BuildContext context, ModuloCapacitacion modulo) {
    showDialog(
      context: context,
      builder: (_) => _CertificadoDialog(modulo: modulo),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.slate400),
          const SizedBox(width: 8),
          Expanded(
            child: Text(label,
                style: const TextStyle(
                    fontSize: 13, color: AppColors.slate600)),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Evaluation flow — 10 questions, one per screen
// ---------------------------------------------------------------------------

class _EvaluacionFlow extends ConsumerStatefulWidget {
  const _EvaluacionFlow({required this.moduloId});

  final String moduloId;

  @override
  ConsumerState<_EvaluacionFlow> createState() => _EvaluacionFlowState();
}

class _EvaluacionFlowState extends ConsumerState<_EvaluacionFlow> {
  late final List<PreguntaEvaluacion> _preguntas;
  final List<int?> _respuestas = List.filled(10, null);
  int _preguntaActual = 0;
  bool _mostrandoResultado = false;
  int? _puntajeFinal;

  @override
  void initState() {
    super.initState();
    _preguntas = ref.read(preguntasProvider(widget.moduloId));
  }

  @override
  Widget build(BuildContext context) {
    if (_mostrandoResultado) {
      return _ResultadoScreen(
        moduloId: widget.moduloId,
        puntaje: _puntajeFinal!,
        onVolver: () {
          ref.read(evaluacionActivaProvider.notifier).state = null;
        },
      );
    }

    final pregunta = _preguntas[_preguntaActual];
    final respondida = _respuestas[_preguntaActual] != null;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) {
          _confirmarSalida(context);
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.bg,
        appBar: AppBar(
          backgroundColor: AppColors.navy900,
          foregroundColor: Colors.white,
          title: const Text('Evaluación'),
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => _confirmarSalida(context),
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Center(
                child: Text(
                  '${_preguntaActual + 1} / ${_preguntas.length}',
                  style: const TextStyle(
                      fontSize: 14, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
        body: Column(
          children: [
            // Progress bar
            LinearProgressIndicator(
              value: (_preguntaActual + 1) / _preguntas.length,
              backgroundColor: AppColors.slate200,
              color: AppColors.blue600,
              minHeight: 4,
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Question number chip
                    BadgeChip(
                      label: 'Pregunta ${_preguntaActual + 1}',
                      color: AppColors.blue600,
                    ),
                    const SizedBox(height: 14),
                    // Question text
                    Text(
                      pregunta.enunciado,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.slate700,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Options
                    ...List.generate(pregunta.opciones.length, (i) {
                      final seleccionada = _respuestas[_preguntaActual] == i;
                      final yaRespondida = _respuestas[_preguntaActual] != null;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(10),
                            onTap: yaRespondida
                                ? null
                                : () {
                                    setState(() {
                                      _respuestas[_preguntaActual] = i;
                                    });
                                  },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: seleccionada
                                    ? AppColors.blue600.withValues(alpha: 0.08)
                                    : AppColors.card,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: seleccionada
                                      ? AppColors.blue600
                                      : AppColors.slate200,
                                  width: seleccionada ? 2 : 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 28,
                                    height: 28,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: seleccionada
                                          ? AppColors.blue600
                                          : AppColors.slate200,
                                    ),
                                    child: Center(
                                      child: Text(
                                        String.fromCharCode(65 + i), // A, B, C, D
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color: seleccionada
                                              ? Colors.white
                                              : AppColors.slate500,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      pregunta.opciones[i],
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: seleccionada
                                            ? AppColors.blue600
                                            : AppColors.slate700,
                                        fontWeight: seleccionada
                                            ? FontWeight.w600
                                            : FontWeight.normal,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),
            // Bottom navigation
            Container(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
              decoration: const BoxDecoration(
                color: AppColors.card,
                border: Border(top: BorderSide(color: AppColors.slate200)),
              ),
              child: Row(
                children: [
                  // Back navigation blocked once answered
                  if (_preguntaActual > 0)
                    Opacity(
                      opacity: _respuestas[_preguntaActual - 1] != null
                          ? 0.4
                          : 1.0,
                      child: OutlinedButton(
                        onPressed: _respuestas[_preguntaActual - 1] != null
                            ? null
                            : () {
                                setState(() => _preguntaActual--);
                              },
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.slate600,
                          side: const BorderSide(color: AppColors.slate200),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text('Anterior'),
                      ),
                    ),
                  const Spacer(),
                  if (_preguntaActual < _preguntas.length - 1)
                    ElevatedButton(
                      onPressed: respondida
                          ? () => setState(() => _preguntaActual++)
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.blue600,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor: AppColors.slate200,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text('Siguiente'),
                    )
                  else
                    ElevatedButton(
                      onPressed: respondida ? _finalizarEvaluacion : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.green600,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor: AppColors.slate200,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8)),
                      ),
                      child: const Text('Finalizar'),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _finalizarEvaluacion() {
    int correctas = 0;
    for (int i = 0; i < _preguntas.length; i++) {
      if (_respuestas[i] == _preguntas[i].respuestaCorrecta) {
        correctas++;
      }
    }
    final puntaje = (correctas * 100 / _preguntas.length).round();

    // Register evaluation
    ref.read(modulosProvider.notifier).completarEvaluacion(
          widget.moduloId,
          puntaje,
        );

    // Track for idempotent sync
    final conectado = ref.read(conectadoProvider);
    if (!conectado) {
      final resultado = ResultadoEvaluacion(
        moduloId: widget.moduloId,
        puntaje: puntaje,
        aprobado: puntaje >= 70,
        respuestas: _respuestas.cast<int>(),
        timestamp: DateTime.now(),
        sincronizado: false,
        codigoCertificado: puntaje >= 70
            ? 'CERT-${widget.moduloId.replaceAll('-', '')}-${DateTime.now().millisecondsSinceEpoch}'
            : null,
      );
      ref.read(_pendingSyncProvider.notifier).update(
            (state) => {...state, widget.moduloId: resultado},
          );
    }

    setState(() {
      _puntajeFinal = puntaje;
      _mostrandoResultado = true;
    });
  }

  void _confirmarSalida(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Salir de la evaluación'),
        content: const Text(
          'Si sales, perderás el progreso de esta evaluación. '
          'Las respuestas marcadas no se guardarán.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Continuar evaluación'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ref.read(evaluacionActivaProvider.notifier).state = null;
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.red500),
            child: const Text('Salir'),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Result screen with certificate
// ---------------------------------------------------------------------------

class _ResultadoScreen extends ConsumerWidget {
  const _ResultadoScreen({
    required this.moduloId,
    required this.puntaje,
    required this.onVolver,
  });

  final String moduloId;
  final int puntaje;
  final VoidCallback onVolver;

  // INV-10: Certificado solo si puntaje >= 70
  bool get aprobado => puntaje >= 70;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final modulos = ref.watch(modulosProvider);
    final modulo = modulos.firstWhere((m) => m.id == moduloId);
    final conectado = ref.watch(conectadoProvider);

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: AppColors.navy900,
        foregroundColor: Colors.white,
        title: const Text('Resultado'),
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const SizedBox(height: 12),
            // Result icon
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: (aprobado ? AppColors.green600 : AppColors.red500)
                    .withValues(alpha: 0.12),
              ),
              child: Icon(
                aprobado ? Icons.emoji_events : Icons.sentiment_dissatisfied,
                size: 40,
                color: aprobado ? AppColors.green600 : AppColors.red500,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              aprobado ? 'Aprobado' : 'No aprobado',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: aprobado ? AppColors.green600 : AppColors.red500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '$puntaje%',
              style: const TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.w800,
                color: AppColors.slate700,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              aprobado
                  ? 'Has superado el umbral mínimo de 70%.'
                  : 'No alcanzaste el 70% requerido. Puedes volver a intentarlo.',
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontSize: 14, color: AppColors.slate500, height: 1.4),
            ),
            if (!conectado) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.amber500.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                      color: AppColors.amber500.withValues(alpha: 0.3)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.cloud_off, size: 16, color: AppColors.amber600),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Sin conexión. El resultado se enviará automáticamente al recuperar la conexión.',
                        style:
                            TextStyle(fontSize: 12, color: AppColors.amber600),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            // Certificate section — INV-10
            if (aprobado && modulo.codigoCertificado != null) ...[
              const SizedBox(height: 24),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.slate200),
                ),
                child: Column(
                  children: [
                    const Text(
                      'CERTIFICADO DE CAPACITACIÓN',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1.0,
                        color: AppColors.slate600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'SGPDP — LEXDATA IA',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppColors.slate400,
                      ),
                    ),
                    const SizedBox(height: 16),
                    // QR pointing to /verificar/:codigo
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.slate200),
                      ),
                      child: QrImageView(
                        data:
                            'https://app.lexdata.ec/verificar/${modulo.codigoCertificado}',
                        version: QrVersions.auto,
                        size: 160,
                        eyeStyle: const QrEyeStyle(
                          eyeShape: QrEyeShape.square,
                          color: AppColors.navy900,
                        ),
                        dataModuleStyle: const QrDataModuleStyle(
                          dataModuleShape: QrDataModuleShape.square,
                          color: AppColors.navy900,
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      modulo.titulo,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppColors.slate700,
                      ),
                    ),
                    const SizedBox(height: 10),
                    // Certificate code
                    _CertField(
                        label: 'Código', value: modulo.codigoCertificado!),
                    const SizedBox(height: 6),
                    _CertField(
                        label: 'Hash SHA-256',
                        value: modulo.hashCertificado ?? '—'),
                    const SizedBox(height: 6),
                    _CertField(label: 'Puntaje', value: '$puntaje%'),
                    const SizedBox(height: 6),
                    _CertField(
                      label: 'Verificación',
                      value:
                          'app.lexdata.ec/verificar/${modulo.codigoCertificado}',
                    ),
                    const SizedBox(height: 16),
                    // Actions
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content: Text(
                                        'Generando PDF del certificado...')),
                              );
                            },
                            icon: const Icon(Icons.picture_as_pdf, size: 16),
                            label: const Text('Guardar PDF'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.blue600,
                              side:
                                  const BorderSide(color: AppColors.blue600),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8)),
                              padding:
                                  const EdgeInsets.symmetric(vertical: 10),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content: Text(
                                        'Compartiendo certificado...')),
                              );
                            },
                            icon: const Icon(Icons.share, size: 16),
                            label: const Text('Compartir'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.green600,
                              side: const BorderSide(
                                  color: AppColors.green600),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8)),
                              padding:
                                  const EdgeInsets.symmetric(vertical: 10),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onVolver,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.blue600,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: const Text('Volver al catálogo'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CertField extends StatelessWidget {
  const _CertField({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 90,
          child: Text(label,
              style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppColors.slate500)),
        ),
        Expanded(
          child: Text(value,
              style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.slate700,
                  fontFamily: 'monospace')),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Certificate dialog (from module detail)
// ---------------------------------------------------------------------------

class _CertificadoDialog extends StatelessWidget {
  const _CertificadoDialog({required this.modulo});

  final ModuloCapacitacion modulo;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.verified, size: 36, color: AppColors.green600),
            const SizedBox(height: 8),
            const Text(
              'CERTIFICADO DE CAPACITACIÓN',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 1.0,
                color: AppColors.slate600,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'SGPDP — LEXDATA IA',
              style: TextStyle(fontSize: 10, color: AppColors.slate400),
            ),
            const SizedBox(height: 14),
            Text(
              modulo.titulo,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.slate700,
              ),
            ),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.slate200),
              ),
              child: QrImageView(
                data:
                    'https://app.lexdata.ec/verificar/${modulo.codigoCertificado}',
                version: QrVersions.auto,
                size: 140,
                eyeStyle: const QrEyeStyle(
                  eyeShape: QrEyeShape.square,
                  color: AppColors.navy900,
                ),
                dataModuleStyle: const QrDataModuleStyle(
                  dataModuleShape: QrDataModuleShape.square,
                  color: AppColors.navy900,
                ),
              ),
            ),
            const SizedBox(height: 12),
            _CertField(label: 'Código', value: modulo.codigoCertificado!),
            const SizedBox(height: 4),
            _CertField(
                label: 'Hash SHA-256',
                value: modulo.hashCertificado ?? '—'),
            const SizedBox(height: 4),
            _CertField(label: 'Puntaje', value: '${modulo.puntaje}%'),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Generando PDF del certificado...')),
                      );
                    },
                    icon: const Icon(Icons.picture_as_pdf, size: 16),
                    label: const Text('PDF'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.blue600,
                      side: const BorderSide(color: AppColors.blue600),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Compartiendo certificado...')),
                      );
                    },
                    icon: const Icon(Icons.share, size: 16),
                    label: const Text('Compartir'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.green600,
                      side: const BorderSide(color: AppColors.green600),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cerrar'),
            ),
          ],
        ),
      ),
    );
  }
}
