import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/badge_chip.dart';
import '../../../shared/widgets/hash_chip.dart';

// ---------------------------------------------------------------------------
// Mock data — INV-9: Art. 41 LOPDP, reloj 72h desde fecha_deteccion
// ---------------------------------------------------------------------------

enum _IncidenteEstado { activo, investigacion, notificado, cerrado, vencido }

enum _IncidenteTipo {
  brechaSeguridad,
  accesoNoAutorizado,
  perdidaDatos,
  ransomware,
  filtracion,
}

class _IncidenteMock {
  const _IncidenteMock({
    required this.codigo,
    required this.tipo,
    required this.tipoLabel,
    required this.estado,
    required this.estadoLabel,
    required this.descripcion,
    required this.fechaDeteccion,
    required this.fechaMaxReporte,
    required this.tratamientoAfectado,
    required this.activoAfectado,
    this.hashEvidencia,
    this.notificadoSPDP = false,
    this.comunicadoTitulares = false,
  });

  final String codigo;
  final _IncidenteTipo tipo;
  final String tipoLabel;
  final _IncidenteEstado estado;
  final String estadoLabel;
  final String descripcion;
  final DateTime fechaDeteccion;
  final DateTime fechaMaxReporte;
  final String tratamientoAfectado;
  final String activoAfectado;
  final String? hashEvidencia;
  final bool notificadoSPDP;
  final bool comunicadoTitulares;
}

// Detected ~50h ago => ~22h remaining (red zone)
final _now = DateTime.now();
final List<_IncidenteMock> _mockIncidentes = [
  _IncidenteMock(
    codigo: 'INC-001',
    tipo: _IncidenteTipo.brechaSeguridad,
    tipoLabel: 'Brecha de seguridad',
    estado: _IncidenteEstado.activo,
    estadoLabel: 'Activo',
    descripcion:
        'Acceso no autorizado al servidor de base de datos del módulo de nómina. '
        'Se detectaron consultas masivas a la tabla de datos personales de empleados '
        'desde una IP externa no reconocida.',
    fechaDeteccion: _now.subtract(const Duration(hours: 50)),
    fechaMaxReporte: _now.add(const Duration(hours: 22)),
    tratamientoAfectado: 'T-003 Gestión de nómina',
    activoAfectado: 'SRV-DB-NOMINA-01',
    hashEvidencia:
        'a1b2c3d4e5f6789012345678abcdef0123456789abcdef0123456789abcdef01',
  ),
  _IncidenteMock(
    codigo: 'INC-002',
    tipo: _IncidenteTipo.accesoNoAutorizado,
    tipoLabel: 'Acceso no autorizado',
    estado: _IncidenteEstado.investigacion,
    estadoLabel: 'En investigación',
    descripcion:
        'Intento de acceso a expedientes de pacientes desde terminal de recepción '
        'fuera de horario laboral.',
    fechaDeteccion: _now.subtract(const Duration(hours: 16)),
    fechaMaxReporte: _now.add(const Duration(hours: 56)),
    tratamientoAfectado: 'T-007 Gestión de pacientes',
    activoAfectado: 'WS-RECEP-03',
  ),
  _IncidenteMock(
    codigo: 'INC-003',
    tipo: _IncidenteTipo.perdidaDatos,
    tipoLabel: 'Pérdida de datos',
    estado: _IncidenteEstado.notificado,
    estadoLabel: 'Notificado SPDP',
    descripcion:
        'Pérdida de disco externo con respaldos de datos de clientes del área comercial.',
    fechaDeteccion: _now.subtract(const Duration(hours: 96)),
    fechaMaxReporte: _now.subtract(const Duration(hours: 24)),
    tratamientoAfectado: 'T-001 Gestión comercial',
    activoAfectado: 'HDD-EXT-BKP-05',
    hashEvidencia:
        'ff00aa11bb22cc33dd44ee55ff6677889900aabb11cc22dd33ee44ff5566778899',
    notificadoSPDP: true,
    comunicadoTitulares: true,
  ),
  _IncidenteMock(
    codigo: 'INC-004',
    tipo: _IncidenteTipo.filtracion,
    tipoLabel: 'Filtración de datos',
    estado: _IncidenteEstado.vencido,
    estadoLabel: 'Plazo vencido',
    descripcion:
        'Envío masivo de correo electrónico con archivo adjunto que contenía '
        'datos personales de 340 titulares sin cifrar.',
    fechaDeteccion: _now.subtract(const Duration(hours: 120)),
    fechaMaxReporte: _now.subtract(const Duration(hours: 48)),
    tratamientoAfectado: 'T-012 Marketing directo',
    activoAfectado: 'SRV-MAIL-01',
    hashEvidencia:
        '1234abcd5678ef90abcdef1234567890abcdef1234567890abcdef1234567890',
  ),
];

// ---------------------------------------------------------------------------
// Simulated user role provider
// ---------------------------------------------------------------------------
final _userRoleProvider = Provider<String>((ref) => 'DPO_HUMANO');

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

/// F-05 — Gestión de Incidentes y Reloj 72h (Art. 41 LOPDP).
///
/// INV-9: Incidente de seguridad => reloj de 72h desde `fecha_deteccion`
/// para notificar a la SPDP. El estado del reloj se calcula en servidor
/// (campo `fecha_max_reporte`); la app solo formatea y muestra.
class IncidentesScreen extends ConsumerStatefulWidget {
  const IncidentesScreen({this.incidenteId, super.key});

  final String? incidenteId;

  @override
  ConsumerState<IncidentesScreen> createState() => _IncidentesScreenState();
}

class _IncidentesScreenState extends ConsumerState<IncidentesScreen> {
  String _filtroEstado = 'Todos';

  @override
  void initState() {
    super.initState();
    // If deep-linked to a specific incident, open its detail after build
    if (widget.incidenteId != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final match = _mockIncidentes
            .where((i) => i.codigo == widget.incidenteId)
            .toList();
        if (match.isNotEmpty) {
          _showDetalleIncidente(context, match.first);
        }
      });
    }
  }

  List<_IncidenteMock> get _filteredIncidentes {
    if (_filtroEstado == 'Todos') return _mockIncidentes;
    return _mockIncidentes
        .where((i) => i.estadoLabel == _filtroEstado)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        title: const Text('Incidentes'),
        backgroundColor: AppColors.navy900,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            tooltip: 'Filtrar',
            onPressed: _showFilterSheet,
          ),
        ],
      ),
      body: Column(
        children: [
          // Summary bar
          _buildSummaryBar(),
          // Filter chips
          _buildFilterChips(),
          // List
          Expanded(
            child: _filteredIncidentes.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.shield_outlined,
                            size: 48, color: AppColors.slate400),
                        const SizedBox(height: 12),
                        Text(
                          'No hay incidentes con este filtro',
                          style: TextStyle(
                            color: AppColors.slate500,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 100),
                    itemCount: _filteredIncidentes.length,
                    itemBuilder: (context, index) {
                      final inc = _filteredIncidentes[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _IncidenteCard(
                          incidente: inc,
                          onTap: () =>
                              _showDetalleIncidente(context, inc),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showRegistroForm(context),
        backgroundColor: AppColors.blue600,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Registrar incidente'),
      ),
    );
  }

  Widget _buildSummaryBar() {
    final activos =
        _mockIncidentes.where((i) => i.estado == _IncidenteEstado.activo).length;
    final urgentes = _mockIncidentes.where((i) {
      final remaining = i.fechaMaxReporte.difference(_now);
      return remaining.inHours < 24 &&
          remaining.inHours >= 0 &&
          i.estado != _IncidenteEstado.notificado &&
          i.estado != _IncidenteEstado.cerrado;
    }).length;
    final vencidos = _mockIncidentes
        .where((i) =>
            i.estado == _IncidenteEstado.vencido ||
            (i.fechaMaxReporte.isBefore(_now) &&
                i.estado != _IncidenteEstado.notificado &&
                i.estado != _IncidenteEstado.cerrado))
        .length;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color: AppColors.card,
      child: Row(
        children: [
          _SummaryPill(
            label: 'Activos',
            count: activos,
            color: AppColors.blue600,
          ),
          const SizedBox(width: 12),
          _SummaryPill(
            label: 'Urgentes (<24h)',
            count: urgentes,
            color: AppColors.red500,
          ),
          const SizedBox(width: 12),
          _SummaryPill(
            label: 'Vencidos',
            count: vencidos,
            color: const Color(0xFF991B1B), // dark red
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    final filters = [
      'Todos',
      'Activo',
      'En investigación',
      'Notificado SPDP',
      'Plazo vencido',
    ];
    return Container(
      height: 48,
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: filters.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final f = filters[index];
          final selected = _filtroEstado == f;
          return ChoiceChip(
            label: Text(f, style: const TextStyle(fontSize: 12)),
            selected: selected,
            selectedColor: AppColors.blue600,
            labelStyle: TextStyle(
              color: selected ? Colors.white : AppColors.slate600,
              fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
            ),
            backgroundColor: AppColors.card,
            side: BorderSide(
              color: selected ? AppColors.blue600 : AppColors.slate200,
            ),
            onSelected: (_) => setState(() => _filtroEstado = f),
          );
        },
      ),
    );
  }

  void _showFilterSheet() {
    // Quick filter — already handled by chips, but kept as action
    // for future advanced filters (date range, type, etc.)
  }

  // -------------------------------------------------------------------------
  // Detail bottom sheet
  // -------------------------------------------------------------------------
  void _showDetalleIncidente(BuildContext context, _IncidenteMock inc) {
    final userRole = ref.read(_userRoleProvider);
    final isDPO = userRole == 'DPO_HUMANO';
    final remaining = inc.fechaMaxReporte.difference(DateTime.now());
    final urgencyInfo = _getUrgencyInfo(remaining, inc.estado);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        expand: false,
        builder: (_, scrollController) => SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
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

              // Header
              Row(
                children: [
                  BadgeChip(label: inc.codigo, color: AppColors.blue600),
                  const SizedBox(width: 8),
                  BadgeChip(
                    label: inc.estadoLabel,
                    color: _estadoColor(inc.estado),
                  ),
                  const Spacer(),
                  _CountdownBadge(
                    remaining: remaining,
                    estado: inc.estado,
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Title
              Text(
                inc.tipoLabel,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.slate700,
                ),
              ),
              const SizedBox(height: 16),

              // Countdown detail card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: urgencyInfo.bgColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: urgencyInfo.color.withValues(alpha: 0.3),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.timer, color: urgencyInfo.color, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          'RELOJ 72 HORAS — ART. 41 LOPDP',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.5,
                            color: urgencyInfo.color,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _DetailRow(
                      label: 'Fecha detección',
                      value: _formatDateTime(inc.fechaDeteccion),
                    ),
                    const SizedBox(height: 6),
                    _DetailRow(
                      label: 'Plazo máximo reporte',
                      value: _formatDateTime(inc.fechaMaxReporte),
                    ),
                    const SizedBox(height: 6),
                    _DetailRow(
                      label: 'Tiempo restante',
                      value: urgencyInfo.label,
                      valueColor: urgencyInfo.color,
                      bold: true,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Section: Description
              _sectionTitle('DESCRIPCIÓN'),
              const SizedBox(height: 8),
              Text(
                inc.descripcion,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.slate700,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 20),

              // Section: Affected
              _sectionTitle('TRATAMIENTO Y ACTIVO AFECTADO'),
              const SizedBox(height: 8),
              _DetailRow(
                label: 'Tratamiento',
                value: inc.tratamientoAfectado,
              ),
              const SizedBox(height: 6),
              _DetailRow(
                label: 'Activo',
                value: inc.activoAfectado,
              ),
              const SizedBox(height: 20),

              // Section: Evidence
              if (inc.hashEvidencia != null) ...[
                _sectionTitle('EVIDENCIA'),
                const SizedBox(height: 8),
                HashChip(hash: inc.hashEvidencia!),
                const SizedBox(height: 20),
              ],

              // Section: Notification status
              _sectionTitle('ESTADO DE NOTIFICACIONES'),
              const SizedBox(height: 8),
              _NotificationStatusRow(
                label: 'Notificado a SPDP',
                done: inc.notificadoSPDP,
              ),
              const SizedBox(height: 6),
              _NotificationStatusRow(
                label: 'Comunicado a titulares',
                done: inc.comunicadoTitulares,
              ),
              const SizedBox(height: 24),

              // Actions
              if (inc.estado != _IncidenteEstado.cerrado) ...[
                _sectionTitle('ACCIONES'),
                const SizedBox(height: 12),

                // Notify SPDP button
                if (!inc.notificadoSPDP) ...[
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: isDPO
                          ? () => _confirmNotificarSPDP(ctx, inc)
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.red500,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor:
                            AppColors.slate200,
                        disabledForegroundColor:
                            AppColors.slate400,
                        padding: const EdgeInsets.symmetric(
                            vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      icon: const Icon(Icons.send, size: 18),
                      label: Text(
                        isDPO
                            ? 'Notificar a SPDP'
                            : 'Solo DPO puede notificar',
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  if (!isDPO)
                    Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(
                        'La notificación a la SPDP es un acto legalmente '
                        'consecuente que requiere rol DPO_HUMANO.',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppColors.slate500,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ),
                  const SizedBox(height: 10),
                ],

                // Communicate to data subjects
                if (!inc.comunicadoTitulares)
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: isDPO
                          ? () => _confirmComunicarTitulares(ctx, inc)
                          : null,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.blue600,
                        side: BorderSide(
                          color: isDPO
                              ? AppColors.blue600
                              : AppColors.slate200,
                        ),
                        padding: const EdgeInsets.symmetric(
                            vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      icon: const Icon(Icons.people_outline,
                          size: 18),
                      label: Text(
                        isDPO
                            ? 'Comunicar a titulares afectados'
                            : 'Solo DPO puede comunicar',
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Confirmation dialogs (INV-5, INV-9: legally consequential acts)
  // -------------------------------------------------------------------------

  void _confirmNotificarSPDP(BuildContext ctx, _IncidenteMock inc) {
    showDialog(
      context: ctx,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Row(
          children: [
            Icon(Icons.warning_amber_rounded,
                color: AppColors.red500, size: 24),
            const SizedBox(width: 8),
            const Expanded(
              child: Text(
                'Confirmar notificación a SPDP',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Esta acción es legalmente consecuente. Se registrará ante la '
              'Superintendencia de Protección de Datos Personales:',
              style: TextStyle(fontSize: 13, height: 1.5),
            ),
            const SizedBox(height: 16),
            _ConfirmationDetail(label: 'Código', value: inc.codigo),
            _ConfirmationDetail(label: 'Tipo', value: inc.tipoLabel),
            _ConfirmationDetail(
              label: 'Detección',
              value: _formatDateTime(inc.fechaDeteccion),
            ),
            _ConfirmationDetail(
              label: 'Tratamiento',
              value: inc.tratamientoAfectado,
            ),
            _ConfirmationDetail(
              label: 'Activo',
              value: inc.activoAfectado,
            ),
            if (inc.hashEvidencia != null)
              _ConfirmationDetail(
                label: 'Hash evidencia',
                value: '${inc.hashEvidencia!.substring(0, 16)}...',
              ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.red500.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Art. 41 LOPDP: El responsable del tratamiento deberá notificar '
                'la vulneración de seguridad a la SPDP dentro de las 72 horas '
                'siguientes a su detección.',
                style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogCtx);
              Navigator.pop(ctx); // close detail sheet
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text(
                    'Notificación a SPDP registrada. '
                    'Se generó constancia con hash.',
                  ),
                  backgroundColor: AppColors.green600,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.red500,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Confirmar notificación'),
          ),
        ],
      ),
    );
  }

  void _confirmComunicarTitulares(BuildContext ctx, _IncidenteMock inc) {
    showDialog(
      context: ctx,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Row(
          children: [
            Icon(Icons.people, color: AppColors.blue600, size: 24),
            const SizedBox(width: 8),
            const Expanded(
              child: Text(
                'Confirmar comunicación a titulares',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Se comunicará a los titulares de datos personales afectados '
              'por este incidente. Esta acción es legalmente consecuente y '
              'quedará registrada en la bitácora de auditoría.',
              style: TextStyle(fontSize: 13, height: 1.5),
            ),
            const SizedBox(height: 12),
            _ConfirmationDetail(label: 'Incidente', value: inc.codigo),
            _ConfirmationDetail(
              label: 'Tratamiento',
              value: inc.tratamientoAfectado,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(dialogCtx);
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text(
                    'Comunicación a titulares registrada.',
                  ),
                  backgroundColor: AppColors.green600,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.blue600,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Confirmar comunicación'),
          ),
        ],
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Registration form
  // -------------------------------------------------------------------------
  void _showRegistroForm(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const _RegistroIncidenteForm(),
    );
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  Widget _sectionTitle(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.8,
        color: AppColors.slate600,
      ),
    );
  }
}

// ===========================================================================
// Incident card
// ===========================================================================

class _IncidenteCard extends StatelessWidget {
  const _IncidenteCard({
    required this.incidente,
    required this.onTap,
  });

  final _IncidenteMock incidente;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final remaining =
        incidente.fechaMaxReporte.difference(DateTime.now());
    final urgency = _getUrgencyInfo(remaining, incidente.estado);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.slate200),
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top row: code, status, countdown
                  Row(
                    children: [
                      BadgeChip(
                          label: incidente.codigo,
                          color: AppColors.blue600),
                      const SizedBox(width: 8),
                      BadgeChip(
                        label: incidente.estadoLabel,
                        color: _estadoColor(incidente.estado),
                      ),
                      const Spacer(),
                      _CountdownBadge(
                        remaining: remaining,
                        estado: incidente.estado,
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Type
                  Text(
                    incidente.tipoLabel,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppColors.slate700,
                    ),
                  ),
                  const SizedBox(height: 6),

                  // Description preview
                  Text(
                    incidente.descripcion,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.slate500,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Affected treatment and asset
                  Row(
                    children: [
                      Icon(Icons.account_tree_outlined,
                          size: 14, color: AppColors.slate400),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          incidente.tratamientoAfectado,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.slate500,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Icon(Icons.dns_outlined,
                          size: 14, color: AppColors.slate400),
                      const SizedBox(width: 4),
                      Text(
                        incidente.activoAfectado,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.slate500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Bottom bar: notification status
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: urgency.bgColor,
                borderRadius: const BorderRadius.vertical(
                    bottom: Radius.circular(12)),
              ),
              child: Row(
                children: [
                  _MiniStatus(
                    icon: Icons.send,
                    label: 'SPDP',
                    done: incidente.notificadoSPDP,
                  ),
                  const SizedBox(width: 16),
                  _MiniStatus(
                    icon: Icons.people_outline,
                    label: 'Titulares',
                    done: incidente.comunicadoTitulares,
                  ),
                  const Spacer(),
                  Text(
                    _formatDate(incidente.fechaDeteccion),
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.slate500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ===========================================================================
// Countdown badge
// ===========================================================================

class _CountdownBadge extends StatelessWidget {
  const _CountdownBadge({
    required this.remaining,
    required this.estado,
  });

  final Duration remaining;
  final _IncidenteEstado estado;

  @override
  Widget build(BuildContext context) {
    final info = _getUrgencyInfo(remaining, estado);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: info.color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: info.color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(info.icon, size: 14, color: info.color),
          const SizedBox(width: 4),
          Text(
            info.shortLabel,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: info.color,
            ),
          ),
        ],
      ),
    );
  }
}

// ===========================================================================
// Registration form
// ===========================================================================

class _RegistroIncidenteForm extends StatefulWidget {
  const _RegistroIncidenteForm();

  @override
  State<_RegistroIncidenteForm> createState() =>
      _RegistroIncidenteFormState();
}

class _RegistroIncidenteFormState extends State<_RegistroIncidenteForm> {
  final _formKey = GlobalKey<FormState>();
  String _tipoSeleccionado = 'Brecha de seguridad';
  DateTime _fechaDeteccion = DateTime.now();
  TimeOfDay _horaDeteccion = TimeOfDay.now();
  final _descripcionController = TextEditingController();
  final _tratamientoController = TextEditingController();
  final _activoController = TextEditingController();
  final List<_AdjuntoMock> _adjuntos = [];

  final _tipos = [
    'Brecha de seguridad',
    'Acceso no autorizado',
    'Pérdida de datos',
    'Ransomware',
    'Filtración de datos',
    'Otro',
  ];

  @override
  void dispose() {
    _descripcionController.dispose();
    _tratamientoController.dispose();
    _activoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      expand: false,
      builder: (_, scrollController) => Form(
        key: _formKey,
        child: SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 32),
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

              // Title
              const Text(
                'Registrar incidente de seguridad',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.slate700,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Art. 41 LOPDP — El reloj de 72 horas para notificar a la SPDP '
                'comienza desde la fecha y hora de detección.',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.slate500,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 24),

              // Tipo
              _formLabel('TIPO DE INCIDENTE'),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _tipoSeleccionado,
                decoration: _inputDecoration(),
                items: _tipos
                    .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                    .toList(),
                onChanged: (v) =>
                    setState(() => _tipoSeleccionado = v ?? _tipoSeleccionado),
                validator: (v) =>
                    v == null ? 'Seleccione un tipo' : null,
              ),
              const SizedBox(height: 16),

              // Descripcion
              _formLabel('DESCRIPCIÓN DEL INCIDENTE'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descripcionController,
                maxLines: 4,
                decoration: _inputDecoration(
                  hint: 'Describa qué ocurrió, cómo se detectó y '
                      'el alcance estimado...',
                ),
                validator: (v) => (v == null || v.trim().length < 10)
                    ? 'Mínimo 10 caracteres'
                    : null,
              ),
              const SizedBox(height: 16),

              // Fecha y hora de detección
              _formLabel('FECHA Y HORA DE DETECCIÓN'),
              const SizedBox(height: 6),

              // Warning
              Container(
                padding: const EdgeInsets.all(10),
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  color: AppColors.amber500.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: AppColors.amber600.withValues(alpha: 0.3),
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.warning_amber_rounded,
                        size: 16, color: AppColors.amber600),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'El reloj de 72 horas inicia desde este momento. '
                        'Ingrese la fecha y hora real de detección, no la '
                        'fecha de registro.',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppColors.amber600,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: _pickFecha,
                      child: InputDecorator(
                        decoration: _inputDecoration(label: 'Fecha'),
                        child: Text(
                          _formatDate(_fechaDeteccion),
                          style: const TextStyle(fontSize: 14),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: InkWell(
                      onTap: _pickHora,
                      child: InputDecorator(
                        decoration: _inputDecoration(label: 'Hora'),
                        child: Text(
                          _horaDeteccion.format(context),
                          style: const TextStyle(fontSize: 14),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Tratamiento afectado
              _formLabel('TRATAMIENTO AFECTADO'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _tratamientoController,
                decoration: _inputDecoration(
                  hint: 'Ej: T-003 Gestión de nómina',
                ),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Campo requerido'
                    : null,
              ),
              const SizedBox(height: 16),

              // Activo afectado
              _formLabel('ACTIVO AFECTADO'),
              const SizedBox(height: 6),
              TextFormField(
                controller: _activoController,
                decoration: _inputDecoration(
                  hint: 'Ej: SRV-DB-NOMINA-01',
                ),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Campo requerido'
                    : null,
              ),
              const SizedBox(height: 20),

              // Adjuntos
              _formLabel('ADJUNTOS (EVIDENCIAS)'),
              const SizedBox(height: 6),
              const Text(
                'Los archivos se firman con SHA-256 en el dispositivo '
                'antes de enviarse al servidor.',
                style: TextStyle(
                  fontSize: 11,
                  color: AppColors.slate500,
                  fontStyle: FontStyle.italic,
                ),
              ),
              const SizedBox(height: 8),

              // Attachment list
              if (_adjuntos.isNotEmpty) ...[
                ..._adjuntos.map(
                  (a) => Container(
                    margin: const EdgeInsets.only(bottom: 6),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.blue50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.slate200,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          a.esImagen
                              ? Icons.image_outlined
                              : Icons.attach_file,
                          size: 16,
                          color: AppColors.blue600,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment:
                                CrossAxisAlignment.start,
                            children: [
                              Text(
                                a.nombre,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              Text(
                                'SHA-256: ${a.hash.substring(0, 16)}...',
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontFamily: 'monospace',
                                  color: AppColors.slate500,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: Icon(Icons.close,
                              size: 16, color: AppColors.slate400),
                          onPressed: () =>
                              setState(() => _adjuntos.remove(a)),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 8),
              ],

              // Add attachment buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _addFromCamera,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.blue600,
                        side:
                            const BorderSide(color: AppColors.slate200),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      icon: const Icon(Icons.camera_alt_outlined,
                          size: 18),
                      label: const Text('Cámara',
                          style: TextStyle(fontSize: 13)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _addFromFiles,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.blue600,
                        side:
                            const BorderSide(color: AppColors.slate200),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      icon: const Icon(Icons.folder_outlined,
                          size: 18),
                      label: const Text('Archivos',
                          style: TextStyle(fontSize: 13)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),

              // Submit
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _submitForm,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.blue600,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text(
                    'Registrar incidente',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  'El registro genera un hash SHA-256 y queda en la bitácora de auditoría.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 11,
                    color: AppColors.slate500,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _formLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.8,
        color: AppColors.slate600,
      ),
    );
  }

  InputDecoration _inputDecoration({String? hint, String? label}) {
    return InputDecoration(
      hintText: hint,
      labelText: label,
      hintStyle: const TextStyle(fontSize: 13, color: AppColors.slate400),
      labelStyle: const TextStyle(fontSize: 13, color: AppColors.slate500),
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.slate200),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.slate200),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide:
            const BorderSide(color: AppColors.blue600, width: 1.5),
      ),
      filled: true,
      fillColor: AppColors.card,
    );
  }

  Future<void> _pickFecha() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _fechaDeteccion,
      firstDate: DateTime.now().subtract(const Duration(days: 7)),
      lastDate: DateTime.now(),
      locale: const Locale('es'),
    );
    if (picked != null) {
      setState(() => _fechaDeteccion = picked);
    }
  }

  Future<void> _pickHora() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _horaDeteccion,
    );
    if (picked != null) {
      setState(() => _horaDeteccion = picked);
    }
  }

  void _addFromCamera() {
    // Mock: simulate camera capture with device-side SHA-256 hash
    setState(() {
      _adjuntos.add(_AdjuntoMock(
        nombre: 'foto_evidencia_${_adjuntos.length + 1}.jpg',
        hash:
            'c4ca4238a0b923820dcc509a6f75849bc81e728d9d4c2f636f067f89cc14862c',
        esImagen: true,
      ));
    });
  }

  void _addFromFiles() {
    // Mock: simulate file picker with device-side SHA-256 hash
    setState(() {
      _adjuntos.add(_AdjuntoMock(
        nombre: 'log_acceso_${_adjuntos.length + 1}.pdf',
        hash:
            'e99a18c428cb38d5f260853678922e03abd834764a79f92e2159b2c4dc3b0e5f',
        esImagen: false,
      ));
    });
  }

  void _submitForm() {
    if (_formKey.currentState?.validate() ?? false) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Incidente registrado. El reloj de 72h ha iniciado.',
          ),
          backgroundColor: AppColors.green600,
        ),
      );
    }
  }
}

class _AdjuntoMock {
  const _AdjuntoMock({
    required this.nombre,
    required this.hash,
    required this.esImagen,
  });

  final String nombre;
  final String hash;
  final bool esImagen;
}

// ===========================================================================
// Supporting widgets
// ===========================================================================

class _SummaryPill extends StatelessWidget {
  const _SummaryPill({
    required this.label,
    required this.count,
    required this.color,
  });

  final String label;
  final int count;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '$count',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniStatus extends StatelessWidget {
  const _MiniStatus({
    required this.icon,
    required this.label,
    required this.done,
  });

  final IconData icon;
  final String label;
  final bool done;

  @override
  Widget build(BuildContext context) {
    final color = done ? AppColors.green600 : AppColors.slate400;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          done ? Icons.check_circle : Icons.radio_button_unchecked,
          size: 14,
          color: color,
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: color,
          ),
        ),
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.label,
    required this.value,
    this.valueColor,
    this.bold = false,
  });

  final String label;
  final String value;
  final Color? valueColor;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 140,
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.slate500,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
              color: valueColor ?? AppColors.slate700,
            ),
          ),
        ),
      ],
    );
  }
}

class _NotificationStatusRow extends StatelessWidget {
  const _NotificationStatusRow({
    required this.label,
    required this.done,
  });

  final String label;
  final bool done;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          done ? Icons.check_circle : Icons.radio_button_unchecked,
          size: 18,
          color: done ? AppColors.green600 : AppColors.slate400,
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            color: done ? AppColors.green600 : AppColors.slate500,
            fontWeight: done ? FontWeight.w600 : FontWeight.w400,
          ),
        ),
        if (done) ...[
          const Spacer(),
          BadgeChip(label: 'Completado', color: AppColors.green600),
        ],
      ],
    );
  }
}

class _ConfirmationDetail extends StatelessWidget {
  const _ConfirmationDetail({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.slate600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.slate700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ===========================================================================
// Urgency calculation helpers
// ===========================================================================

class _UrgencyInfo {
  const _UrgencyInfo({
    required this.color,
    required this.bgColor,
    required this.icon,
    required this.shortLabel,
    required this.label,
  });

  final Color color;
  final Color bgColor;
  final IconData icon;
  final String shortLabel;
  final String label;
}

_UrgencyInfo _getUrgencyInfo(Duration remaining, _IncidenteEstado estado) {
  // Already notified — show in blue (resolved)
  if (estado == _IncidenteEstado.notificado ||
      estado == _IncidenteEstado.cerrado) {
    return _UrgencyInfo(
      color: AppColors.blue600,
      bgColor: AppColors.blue50,
      icon: Icons.check_circle_outline,
      shortLabel: 'Notificado',
      label: 'Notificado a la SPDP',
    );
  }

  // Expired
  if (remaining.isNegative) {
    final overdue = remaining.abs();
    final hours = overdue.inHours;
    return _UrgencyInfo(
      color: const Color(0xFF991B1B), // dark red
      bgColor: const Color(0xFFFEF2F2),
      icon: Icons.error,
      shortLabel: 'VENCIDO -${hours}h',
      label: 'Plazo vencido hace $hours horas',
    );
  }

  final hours = remaining.inHours;
  final minutes = remaining.inMinutes % 60;

  // > 48h: green
  if (hours >= 48) {
    return _UrgencyInfo(
      color: AppColors.green600,
      bgColor: const Color(0xFFF0FDF4),
      icon: Icons.timer,
      shortLabel: '${hours}h ${minutes}m',
      label: '$hours horas $minutes minutos restantes',
    );
  }

  // 24-48h: amber
  if (hours >= 24) {
    return _UrgencyInfo(
      color: AppColors.amber600,
      bgColor: const Color(0xFFFFFBEB),
      icon: Icons.timer,
      shortLabel: '${hours}h ${minutes}m',
      label: '$hours horas $minutes minutos restantes',
    );
  }

  // < 24h: red
  return _UrgencyInfo(
    color: AppColors.red500,
    bgColor: const Color(0xFFFEF2F2),
    icon: Icons.timer,
    shortLabel: '${hours}h ${minutes}m',
    label: '$hours horas $minutes minutos restantes',
  );
}

Color _estadoColor(_IncidenteEstado estado) {
  return switch (estado) {
    _IncidenteEstado.activo => AppColors.red500,
    _IncidenteEstado.investigacion => AppColors.amber600,
    _IncidenteEstado.notificado => AppColors.blue600,
    _IncidenteEstado.cerrado => AppColors.green600,
    _IncidenteEstado.vencido => const Color(0xFF991B1B),
  };
}

// ===========================================================================
// Formatting helpers
// ===========================================================================

String _formatDateTime(DateTime dt) {
  return '${dt.day.toString().padLeft(2, '0')}/'
      '${dt.month.toString().padLeft(2, '0')}/'
      '${dt.year} '
      '${dt.hour.toString().padLeft(2, '0')}:'
      '${dt.minute.toString().padLeft(2, '0')}';
}

String _formatDate(DateTime dt) {
  return '${dt.day.toString().padLeft(2, '0')}/'
      '${dt.month.toString().padLeft(2, '0')}/'
      '${dt.year}';
}
