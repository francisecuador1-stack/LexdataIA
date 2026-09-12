import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/badge_chip.dart';
import '../../../shared/widgets/hash_chip.dart';

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

enum ApprovalType { documento, hallazgo, recomendacion, plan }

enum ApprovalUrgency { normal, alta, critica }

class ApprovalItem {
  const ApprovalItem({
    required this.id,
    required this.title,
    required this.type,
    required this.urgency,
    required this.source,
    required this.createdAt,
    required this.normRef,
    required this.summary,
    this.hashSha256,
  });

  final String id;
  final String title;
  final ApprovalType type;
  final ApprovalUrgency urgency;
  final String source;
  final DateTime createdAt;
  final String normRef;
  final String summary;
  final String? hashSha256;

  String get typeLabel => switch (type) {
        ApprovalType.documento => 'Documento',
        ApprovalType.hallazgo => 'Hallazgo',
        ApprovalType.recomendacion => 'Recomendación',
        ApprovalType.plan => 'Plan',
      };

  IconData get typeIcon => switch (type) {
        ApprovalType.documento => Icons.description_outlined,
        ApprovalType.hallazgo => Icons.search_outlined,
        ApprovalType.recomendacion => Icons.lightbulb_outline,
        ApprovalType.plan => Icons.checklist_outlined,
      };

  Color get urgencyColor => switch (urgency) {
        ApprovalUrgency.normal => AppColors.blue600,
        ApprovalUrgency.alta => AppColors.amber600,
        ApprovalUrgency.critica => AppColors.red500,
      };

  String get urgencyLabel => switch (urgency) {
        ApprovalUrgency.normal => 'Normal',
        ApprovalUrgency.alta => 'Alta',
        ApprovalUrgency.critica => 'Crítica',
      };

  String get ageText {
    final days = DateTime.now().difference(createdAt).inDays;
    if (days == 0) return 'Hoy';
    if (days == 1) return 'Hace 1 día';
    return 'Hace $days días';
  }
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

final _mockItems = [
  ApprovalItem(
    id: 'APR-001',
    title: 'DPA con proveedor de servicios cloud',
    type: ApprovalType.documento,
    urgency: ApprovalUrgency.alta,
    source: 'MARK AI',
    createdAt: DateTime.now().subtract(const Duration(days: 3)),
    normRef: 'Art. 38 LOPDP — Acuerdo de protección de datos',
    summary:
        'Acuerdo de protección de datos personales con CloudCorp S.A. como '
        'encargado del tratamiento. Incluye cláusulas de confidencialidad, '
        'medidas técnicas mínimas (cifrado AES-256, backups cifrados), '
        'procedimiento de notificación de brechas y derecho de auditoría.\n\n'
        'Generado por MARK AI a partir de la plantilla DPA v3.1 y adaptado '
        'al perfil de riesgo del tratamiento TRT-045.',
    hashSha256:
        'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
  ),
  ApprovalItem(
    id: 'APR-002',
    title: 'Política de privacidad v2.0',
    type: ApprovalType.documento,
    urgency: ApprovalUrgency.normal,
    source: 'DPO Analista',
    createdAt: DateTime.now().subtract(const Duration(days: 1)),
    normRef: 'Art. 12, 13 LOPDP — Deber de información al titular',
    summary:
        'Actualización de la política de privacidad corporativa. Incorpora '
        'nuevos tratamientos registrados en el RAT (capacitación online, '
        'facturación electrónica), actualiza las bases de legitimación y '
        'añade el canal de derechos ARCO vía formulario web.\n\n'
        'Revisada por el equipo jurídico el 2026-09-10.',
    hashSha256:
        'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
  ),
  ApprovalItem(
    id: 'APR-003',
    title: 'Hallazgo: Backups sin cifrado en reposo',
    type: ApprovalType.hallazgo,
    urgency: ApprovalUrgency.critica,
    source: 'Auditoría Q2-2026',
    createdAt: DateTime.now().subtract(const Duration(days: 5)),
    normRef: 'Art. 37 LOPDP — Medidas de seguridad; Ctrl. A.10.1 ISO 27001',
    summary:
        'Se identificó que los backups del servidor de base de datos de '
        'producción no cuentan con cifrado en reposo. El riesgo residual '
        'se califica como ALTO (zona roja en la matriz 5x5).\n\n'
        // RN-201: zona roja → EIPD obligatoria
        'Se requiere decisión del DPO: aprobar el plan de remediación '
        'propuesto (cifrado AES-256 + rotación de llaves) o solicitar '
        'acciones adicionales. La EIPD es obligatoria (RN-201).',
    hashSha256:
        'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
  ),
];

// ---------------------------------------------------------------------------
// State management
// ---------------------------------------------------------------------------

/// Simulates network connectivity for offline handling.
final _isOnlineProvider = StateProvider<bool>((ref) => true);

/// Selected items for batch operations.
final _selectedIdsProvider = StateProvider<Set<String>>((ref) => {});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/// F-06 — Bandeja unificada de aprobaciones y firma.
///
/// INV-5: MARK AI no puede aprobar ni firmar; solo propone.
/// INV-6: Cierre requiere verificación de eficacia + evidencia + DPO humano.
class AprobacionesScreen extends ConsumerStatefulWidget {
  const AprobacionesScreen({super.key});

  @override
  ConsumerState<AprobacionesScreen> createState() => _AprobacionesScreenState();
}

class _AprobacionesScreenState extends ConsumerState<AprobacionesScreen> {
  // Group items by type for sectioned list.
  Map<ApprovalType, List<ApprovalItem>> get _grouped {
    final map = <ApprovalType, List<ApprovalItem>>{};
    for (final item in _mockItems) {
      map.putIfAbsent(item.type, () => []).add(item);
    }
    return map;
  }

  // -----------------------------------------------------------------------
  // Build
  // -----------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final selectedIds = ref.watch(_selectedIdsProvider);
    final isOnline = ref.watch(_isOnlineProvider);

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        title: const Text('Aprobaciones'),
        backgroundColor: AppColors.navy900,
        foregroundColor: Colors.white,
        actions: [
          // Offline toggle (for demo/testing)
          IconButton(
            icon: Icon(
              isOnline ? Icons.wifi : Icons.wifi_off,
              color: isOnline ? AppColors.green600 : AppColors.red500,
            ),
            tooltip: isOnline ? 'En línea' : 'Sin conexión',
            onPressed: () {
              ref.read(_isOnlineProvider.notifier).state = !isOnline;
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Offline banner
          if (!isOnline) _buildOfflineBanner(),
          // Content
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              children: [
                // Batch selection header
                if (selectedIds.isNotEmpty) _buildSelectionHeader(selectedIds),
                // Grouped sections
                for (final entry in _grouped.entries) ...[
                  _buildSectionHeader(entry.key, entry.value.length),
                  for (final item in entry.value)
                    _ApprovalCard(
                      item: item,
                      selected: selectedIds.contains(item.id),
                      onTap: () => _showDetail(item),
                      onLongPress: () => _toggleSelection(item.id),
                      onSelect: () => _toggleSelection(item.id),
                    ),
                  const SizedBox(height: 16),
                ],
              ],
            ),
          ),
        ],
      ),
      // Batch sign FAB
      floatingActionButton: selectedIds.isNotEmpty
          ? FloatingActionButton.extended(
              onPressed: isOnline ? () => _startBatchSigning() : null,
              backgroundColor:
                  isOnline ? AppColors.blue600 : AppColors.slate400,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.draw_outlined),
              label: Text('Firmar (${selectedIds.length})'),
            )
          : null,
    );
  }

  // -----------------------------------------------------------------------
  // UI components
  // -----------------------------------------------------------------------

  Widget _buildOfflineBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: AppColors.amber500.withValues(alpha: 0.15),
      child: Row(
        children: [
          const Icon(Icons.wifi_off, size: 18, color: AppColors.amber600),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Sin conexión — Puede consultar elementos pendientes, pero la '
              'firma requiere conexión al servidor para generar el sello.',
              style: const TextStyle(fontSize: 12, color: AppColors.amber600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectionHeader(Set<String> selectedIds) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.blue600.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '${selectedIds.length} seleccionado${selectedIds.length > 1 ? 's' : ''}',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.blue600,
              ),
            ),
          ),
          const Spacer(),
          TextButton(
            onPressed: () =>
                ref.read(_selectedIdsProvider.notifier).state = {},
            child: const Text('Deseleccionar todo',
                style: TextStyle(fontSize: 12)),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(ApprovalType type, int count) {
    final label = switch (type) {
      ApprovalType.documento => 'DOCUMENTOS',
      ApprovalType.hallazgo => 'HALLAZGOS',
      ApprovalType.recomendacion => 'RECOMENDACIONES',
      ApprovalType.plan => 'PLANES',
    };
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, top: 4),
      child: Row(
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.8,
              color: AppColors.slate600,
            ),
          ),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
            decoration: BoxDecoration(
              color: AppColors.slate200,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              '$count',
              style: const TextStyle(fontSize: 10, color: AppColors.slate600),
            ),
          ),
        ],
      ),
    );
  }

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  void _toggleSelection(String id) {
    final current = Set<String>.from(ref.read(_selectedIdsProvider));
    if (current.contains(id)) {
      current.remove(id);
    } else {
      current.add(id);
    }
    ref.read(_selectedIdsProvider.notifier).state = current;
  }

  void _showDetail(ApprovalItem item) {
    final isOnline = ref.read(_isOnlineProvider);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _DetailSheet(
        item: item,
        isOnline: isOnline,
        onApprove: () {
          Navigator.of(context).pop();
          _startBatchSigning(singleItem: item);
        },
        onReject: () {
          Navigator.of(context).pop();
          _showRejectDialog(item);
        },
      ),
    );
  }

  void _showRejectDialog(ApprovalItem item) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Rechazar elemento'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              item.title,
              style: const TextStyle(
                  fontSize: 13, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            const Text(
              'Motivo del rechazo (obligatorio):',
              style: TextStyle(fontSize: 13, color: AppColors.slate600),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: controller,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Indique el motivo para devolver al analista o agente...',
                hintStyle: const TextStyle(fontSize: 13, color: AppColors.slate400),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: AppColors.slate200),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: AppColors.slate200),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () {
              if (controller.text.trim().isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content:
                        Text('Debe indicar un motivo para el rechazo.'),
                    backgroundColor: AppColors.red500,
                  ),
                );
                return;
              }
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                      '${item.id} rechazado. Devuelto a ${item.source}.'),
                  backgroundColor: AppColors.amber600,
                ),
              );
            },
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.red500,
            ),
            child: const Text('Rechazar'),
          ),
        ],
      ),
    );
  }

  void _startBatchSigning({ApprovalItem? singleItem}) {
    final isOnline = ref.read(_isOnlineProvider);
    if (!isOnline) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'La firma no puede completarse sin conexión al servidor. '
            'El sello criptográfico requiere verificación en línea.',
          ),
          backgroundColor: AppColors.red500,
          duration: Duration(seconds: 4),
        ),
      );
      return;
    }

    final items = singleItem != null
        ? [singleItem]
        : _mockItems
            .where((i) =>
                ref.read(_selectedIdsProvider).contains(i.id))
            .toList();

    if (items.isEmpty) return;

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => _SigningFlowScreen(
          items: items,
          onComplete: () {
            ref.read(_selectedIdsProvider.notifier).state = {};
            Navigator.of(context).pop();
          },
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Approval card
// ---------------------------------------------------------------------------

class _ApprovalCard extends StatelessWidget {
  const _ApprovalCard({
    required this.item,
    required this.selected,
    required this.onTap,
    required this.onLongPress,
    required this.onSelect,
  });

  final ApprovalItem item;
  final bool selected;
  final VoidCallback onTap;
  final VoidCallback onLongPress;
  final VoidCallback onSelect;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: selected
            ? AppColors.blue50
            : AppColors.card,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: onTap,
          onLongPress: onLongPress,
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: selected ? AppColors.blue500 : AppColors.slate200,
                width: selected ? 1.5 : 1,
              ),
            ),
            child: Row(
              children: [
                // Selection checkbox
                GestureDetector(
                  onTap: onSelect,
                  child: Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      color: selected ? AppColors.blue600 : Colors.transparent,
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(
                        color:
                            selected ? AppColors.blue600 : AppColors.slate400,
                      ),
                    ),
                    child: selected
                        ? const Icon(Icons.check,
                            size: 16, color: Colors.white)
                        : null,
                  ),
                ),
                const SizedBox(width: 12),
                // Type icon
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: item.urgencyColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child:
                      Icon(item.typeIcon, size: 20, color: item.urgencyColor),
                ),
                const SizedBox(width: 12),
                // Content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.title,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.slate700,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          BadgeChip(
                              label: item.typeLabel, color: AppColors.blue600),
                          const SizedBox(width: 6),
                          BadgeChip(
                            label: item.urgencyLabel,
                            color: item.urgencyColor,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            item.ageText,
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.slate400,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Origen: ${item.source}',
                        style: const TextStyle(
                            fontSize: 11, color: AppColors.slate500),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right,
                    size: 20, color: AppColors.slate400),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Detail bottom sheet
// ---------------------------------------------------------------------------

class _DetailSheet extends StatelessWidget {
  const _DetailSheet({
    required this.item,
    required this.isOnline,
    required this.onApprove,
    required this.onReject,
  });

  final ApprovalItem item;
  final bool isOnline;
  final VoidCallback onApprove;
  final VoidCallback onReject;

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (_, controller) => Container(
        decoration: const BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Handle
            Padding(
              padding: const EdgeInsets.only(top: 12, bottom: 8),
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.slate200,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            // Scrollable content
            Expanded(
              child: ListView(
                controller: controller,
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
                children: [
                  // Header
                  Row(
                    children: [
                      BadgeChip(
                          label: item.typeLabel, color: AppColors.blue600),
                      const SizedBox(width: 8),
                      BadgeChip(
                        label: item.urgencyLabel,
                        color: item.urgencyColor,
                      ),
                      const Spacer(),
                      Text(item.id,
                          style: const TextStyle(
                            fontSize: 12,
                            fontFamily: 'monospace',
                            color: AppColors.slate500,
                          )),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    item.title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.slate700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.person_outline,
                          size: 14, color: AppColors.slate400),
                      const SizedBox(width: 4),
                      Text(
                        'Origen: ${item.source}',
                        style: const TextStyle(
                            fontSize: 12, color: AppColors.slate500),
                      ),
                      const SizedBox(width: 16),
                      Icon(Icons.schedule,
                          size: 14, color: AppColors.slate400),
                      const SizedBox(width: 4),
                      Text(
                        item.ageText,
                        style: const TextStyle(
                            fontSize: 12, color: AppColors.slate500),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Document content
                  _sectionLabel('CONTENIDO'),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.bg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.slate200),
                    ),
                    child: Text(
                      item.summary,
                      style: const TextStyle(
                        fontSize: 13,
                        height: 1.6,
                        color: AppColors.slate700,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Fundamento normativo
                  _sectionLabel('FUNDAMENTO NORMATIVO'),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.blue50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: AppColors.blue300.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.gavel,
                            size: 18, color: AppColors.blue600),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            item.normRef,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: AppColors.blue900,
                              height: 1.4,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Hash
                  if (item.hashSha256 != null) ...[
                    _sectionLabel('HASH DEL DOCUMENTO'),
                    const SizedBox(height: 8),
                    HashChip(hash: item.hashSha256!),
                    const SizedBox(height: 20),
                  ],

                  // Offline warning
                  if (!isOnline)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: AppColors.amber500.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: AppColors.amber500.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.wifi_off,
                              size: 18, color: AppColors.amber600),
                          const SizedBox(width: 10),
                          const Expanded(
                            child: Text(
                              'Sin conexión al servidor. Puede revisar el '
                              'contenido, pero no es posible firmar ni aprobar '
                              'hasta que se restablezca la conexión. '
                              'El sello criptográfico se genera en el servidor.',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.amber600,
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Actions
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: onReject,
                          icon: const Icon(Icons.close, size: 18),
                          label: const Text('Rechazar'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.red500,
                            side: const BorderSide(color: AppColors.red500),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: FilledButton.icon(
                          onPressed: isOnline ? onApprove : null,
                          icon: const Icon(Icons.draw_outlined, size: 18),
                          label: Text(
                              isOnline ? 'Aprobar y firmar' : 'Sin conexión'),
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.blue600,
                            disabledBackgroundColor: AppColors.slate200,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionLabel(String text) {
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

// ---------------------------------------------------------------------------
// Signing flow (confirmation → PIN → result)
// ---------------------------------------------------------------------------

class _SigningFlowScreen extends StatefulWidget {
  const _SigningFlowScreen({
    required this.items,
    required this.onComplete,
  });

  final List<ApprovalItem> items;
  final VoidCallback onComplete;

  @override
  State<_SigningFlowScreen> createState() => _SigningFlowScreenState();
}

enum _SigningStep { confirmation, pin, result }

class _SigningFlowScreenState extends State<_SigningFlowScreen> {
  _SigningStep _step = _SigningStep.confirmation;
  bool _declarationAccepted = false;
  final _pinController = TextEditingController();
  String? _resultHash;

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        title: Text(_stepTitle),
        backgroundColor: AppColors.navy900,
        foregroundColor: Colors.white,
        leading: _step == _SigningStep.result
            ? null
            : IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.of(context).pop(),
              ),
      ),
      body: switch (_step) {
        _SigningStep.confirmation => _buildConfirmation(),
        _SigningStep.pin => _buildPinEntry(),
        _SigningStep.result => _buildResult(),
      },
    );
  }

  String get _stepTitle => switch (_step) {
        _SigningStep.confirmation => 'Confirmar firma',
        _SigningStep.pin => 'PIN de firma',
        _SigningStep.result => 'Firma completada',
      };

  // -----------------------------------------------------------------------
  // Step 1: Confirmation
  // -----------------------------------------------------------------------

  Widget _buildConfirmation() {
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              // Title
              const Text(
                'Documentos a firmar',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.slate700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${widget.items.length} elemento${widget.items.length > 1 ? 's' : ''} seleccionado${widget.items.length > 1 ? 's' : ''}',
                style: const TextStyle(
                    fontSize: 13, color: AppColors.slate500),
              ),
              const SizedBox(height: 16),

              // Item list
              for (final item in widget.items) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.slate200),
                  ),
                  child: Row(
                    children: [
                      Icon(item.typeIcon,
                          size: 20, color: AppColors.blue600),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.title,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.slate700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${item.typeLabel} · ${item.id}',
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.slate500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      BadgeChip(
                          label: item.urgencyLabel,
                          color: item.urgencyColor),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
              ],

              const SizedBox(height: 20),

              // Sworn declaration
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.blue50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                      color: AppColors.blue300.withValues(alpha: 0.4)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'DECLARACIÓN JURADA',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.8,
                        color: AppColors.blue900,
                      ),
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'Declaro bajo juramento que he revisado el contenido '
                      'íntegro de los documentos listados arriba, que los '
                      'apruebo en mi calidad de Delegado de Protección de '
                      'Datos Personales (DPO) conforme a la Ley Orgánica de '
                      'Protección de Datos Personales del Ecuador (LOPDP), y '
                      'que autorizo la generación del sello criptográfico de '
                      'firma. Comprendo que este acto tiene consecuencias '
                      'legales y que la firma quedará registrada de forma '
                      'inalterable en la bitácora de auditoría del SGPDP.',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.slate700,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 14),
                    InkWell(
                      onTap: () => setState(() {
                        _declarationAccepted = !_declarationAccepted;
                      }),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(
                            width: 22,
                            height: 22,
                            child: Checkbox(
                              value: _declarationAccepted,
                              onChanged: (v) => setState(() {
                                _declarationAccepted = v ?? false;
                              }),
                              activeColor: AppColors.blue600,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(4)),
                            ),
                          ),
                          const SizedBox(width: 10),
                          const Expanded(
                            child: Text(
                              'He leído y acepto la declaración jurada. '
                              'Confirmo que actúo en mi calidad de DPO '
                              'certificado ante la SPDP.',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: AppColors.slate700,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        // Footer
        Container(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          decoration: const BoxDecoration(
            color: AppColors.card,
            border: Border(top: BorderSide(color: AppColors.slate200)),
          ),
          child: SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _declarationAccepted
                  ? () => setState(() => _step = _SigningStep.pin)
                  : null,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.blue600,
                disabledBackgroundColor: AppColors.slate200,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Continuar a firma',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
            ),
          ),
        ),
      ],
    );
  }

  // -----------------------------------------------------------------------
  // Step 2: PIN entry
  // -----------------------------------------------------------------------

  Widget _buildPinEntry() {
    return Column(
      children: [
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.blue600.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.lock_outline,
                      size: 32, color: AppColors.blue600),
                ),
                const SizedBox(height: 20),
                const Text(
                  'Ingrese su PIN de firma',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.slate700,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'PIN de 6 dígitos para ${widget.items.length} '
                  'elemento${widget.items.length > 1 ? 's' : ''}',
                  style: const TextStyle(
                      fontSize: 13, color: AppColors.slate500),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: 200,
                  child: TextField(
                    controller: _pinController,
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    obscureText: true,
                    maxLength: 6,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 12,
                      color: AppColors.slate700,
                    ),
                    decoration: InputDecoration(
                      counterText: '',
                      hintText: '------',
                      hintStyle: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 12,
                        color: AppColors.slate200,
                      ),
                      enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(
                            color: AppColors.slate200, width: 2),
                      ),
                      focusedBorder: const UnderlineInputBorder(
                        borderSide:
                            BorderSide(color: AppColors.blue600, width: 2),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                // Biometric option
                TextButton.icon(
                  onPressed: _completeSigning,
                  icon: const Icon(Icons.fingerprint, size: 20),
                  label: const Text('Usar biometría en su lugar'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.blue600,
                  ),
                ),
              ],
            ),
          ),
        ),
        // Footer
        Container(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          decoration: const BoxDecoration(
            color: AppColors.card,
            border: Border(top: BorderSide(color: AppColors.slate200)),
          ),
          child: SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () {
                if (_pinController.text.length == 6) {
                  _completeSigning();
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Ingrese un PIN de 6 dígitos.'),
                      backgroundColor: AppColors.amber600,
                    ),
                  );
                }
              },
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.blue600,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Firmar',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
            ),
          ),
        ),
      ],
    );
  }

  void _completeSigning() {
    // Simulate hash generation (in production this comes from the server)
    setState(() {
      _resultHash =
          'f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8';
      _step = _SigningStep.result;
    });
  }

  // -----------------------------------------------------------------------
  // Step 3: Result
  // -----------------------------------------------------------------------

  Widget _buildResult() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const Spacer(),
          // Success icon
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.green600.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle_outline,
                size: 48, color: AppColors.green600),
          ),
          const SizedBox(height: 20),
          const Text(
            'Firma completada',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: AppColors.slate700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${widget.items.length} elemento${widget.items.length > 1 ? 's' : ''} '
            'firmado${widget.items.length > 1 ? 's' : ''} exitosamente.',
            style: const TextStyle(fontSize: 14, color: AppColors.slate500),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),

          // Signed items
          for (final item in widget.items) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.green600.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                    color: AppColors.green600.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle,
                      size: 18, color: AppColors.green600),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      item.title,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: AppColors.slate700,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 6),
          ],

          const SizedBox(height: 20),

          // Signature hash
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.bg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.slate200),
            ),
            child: Column(
              children: [
                const Text(
                  'HASH DE FIRMA',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.8,
                    color: AppColors.slate600,
                  ),
                ),
                const SizedBox(height: 8),
                if (_resultHash != null) HashChip(hash: _resultHash!),
                const SizedBox(height: 8),
                const Text(
                  'Este hash queda registrado en la bitácora de auditoría '
                  'del SGPDP y puede ser verificado ante la SPDP.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 11,
                    color: AppColors.slate500,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),

          const Spacer(),

          // Done button
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: widget.onComplete,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.blue600,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Volver a la bandeja',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }
}
