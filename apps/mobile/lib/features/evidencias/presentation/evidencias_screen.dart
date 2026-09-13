import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/badge_chip.dart';
import '../../../shared/widgets/hash_chip.dart';

// ---------------------------------------------------------------------------
// F-07 — Evidencias desde dispositivo
// INV-3: evidencias append-only, hash SHA-256, prev_hash, retención 5 años.
// ---------------------------------------------------------------------------

/// Tipos de formato de evidencia según catálogo SGPDP.
enum _TipoEvidencia {
  organigrama('Organigrama'),
  actaComite('Acta de Comité'),
  nombramiento('Nombramiento'),
  politica('Política'),
  planTrabajo('Plan de trabajo'),
  presupuesto('Presupuesto'),
  contrato('Contrato'),
  otro('Otro');

  const _TipoEvidencia(this.label);
  final String label;
}

/// Estado de una evidencia en la cola offline / subida.
enum _EstadoEvidencia {
  subida('Subida', AppColors.green600),
  enCola('En cola offline', AppColors.amber600),
  errorIntegridad('Error de integridad', AppColors.red500);

  const _EstadoEvidencia(this.label, this.color);
  final String label;
  final Color color;
}

/// Origen del archivo adjunto.
enum _OrigenArchivo { camara, galeria, archivo }

// ---------------------------------------------------------------------------
// Mock data — 3 evidencias subidas (INV-3 compliant)
// ---------------------------------------------------------------------------

class _EvidenciaMock {
  const _EvidenciaMock({
    required this.id,
    required this.nombre,
    required this.tipo,
    required this.hashSha256,
    required this.fecha,
    required this.estado,
    required this.controlAsociado,
    required this.areaResponsable,
    this.archivoNombre,
    this.comprimida = false,
  });

  final String id;
  final String nombre;
  final _TipoEvidencia tipo;
  final String hashSha256;
  final DateTime fecha;
  final _EstadoEvidencia estado;
  final String controlAsociado;
  final String areaResponsable;
  final String? archivoNombre;
  final bool comprimida;
}

final _mockEvidencias = <_EvidenciaMock>[
  _EvidenciaMock(
    id: 'EV-001',
    nombre: 'Organigrama del área de TI',
    tipo: _TipoEvidencia.organigrama,
    hashSha256:
        'a3f7c1d2e4b6a8f0c2d4e6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6',
    fecha: DateTime(2026, 9, 10, 14, 32),
    estado: _EstadoEvidencia.subida,
    controlAsociado: 'F1-D1 Estructura organizacional',
    areaResponsable: 'Tecnología de la Información',
    archivoNombre: 'organigrama_ti_2026.pdf',
  ),
  _EvidenciaMock(
    id: 'EV-002',
    nombre: 'Acta de designación del DPO',
    tipo: _TipoEvidencia.nombramiento,
    hashSha256:
        'b5e9d3f1a7c5b3d1e9f7a5c3b1d9e7f5a3c1b9d7e5f3a1c9b7d5e3f1a9c7b5d3',
    fecha: DateTime(2026, 9, 8, 9, 15),
    estado: _EstadoEvidencia.subida,
    controlAsociado: 'F1-D2 Designación del DPO',
    areaResponsable: 'Dirección General',
    archivoNombre: 'acta_dpo_designacion.pdf',
  ),
  _EvidenciaMock(
    id: 'EV-003',
    nombre: 'Política de protección de datos personales',
    tipo: _TipoEvidencia.politica,
    hashSha256:
        'c7f1e5d3b9a7c5e3d1b9f7a5c3e1d9b7f5a3c1e9d7b5f3a1c9e7d5b3f1a9c7e5',
    fecha: DateTime(2026, 9, 5, 16, 45),
    estado: _EstadoEvidencia.subida,
    controlAsociado: 'F2-C3 Políticas de tratamiento',
    areaResponsable: 'Cumplimiento',
    archivoNombre: 'politica_pdp_v2.pdf',
  ),
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class EvidenciasScreen extends ConsumerStatefulWidget {
  const EvidenciasScreen({super.key});

  @override
  ConsumerState<EvidenciasScreen> createState() => _EvidenciasScreenState();
}

class _EvidenciasScreenState extends ConsumerState<EvidenciasScreen> {
  final List<_EvidenciaMock> _evidencias = List.of(_mockEvidencias);
  int _offlineCount = 0;

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  void _showAddEvidencia() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _AddEvidenciaSheet(
        onSaved: (ev) {
          setState(() => _evidencias.insert(0, ev));
          if (ev.estado == _EstadoEvidencia.enCola) {
            setState(() => _offlineCount++);
          }
        },
      ),
    );
  }

  // -----------------------------------------------------------------------
  // Build
  // -----------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        title: const Text('Evidencias'),
        actions: [
          if (_offlineCount > 0)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Chip(
                avatar: const Icon(Icons.cloud_off, size: 16,
                    color: AppColors.amber600),
                label: Text('$_offlineCount en cola',
                    style: const TextStyle(fontSize: 12)),
                backgroundColor: AppColors.amber500.withValues(alpha: 0.15),
                side: BorderSide.none,
              ),
            ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            tooltip: 'Filtrar',
            onPressed: () {},
          ),
        ],
      ),
      body: _evidencias.isEmpty
          ? const _EmptyBody()
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
              itemCount: _evidencias.length + 1, // +1 for header
              itemBuilder: (context, index) {
                if (index == 0) return _buildHeader();
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _EvidenciaCard(evidencia: _evidencias[index - 1]),
                );
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddEvidencia,
        backgroundColor: AppColors.blue600,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_a_photo),
        label: const Text('Cargar evidencia'),
      ),
    );
  }

  Widget _buildHeader() {
    final subidas = _evidencias
        .where((e) => e.estado == _EstadoEvidencia.subida)
        .length;
    final enCola = _evidencias
        .where((e) => e.estado == _EstadoEvidencia.enCola)
        .length;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section label
          const Text(
            'BÓVEDA DE EVIDENCIAS',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.0,
              color: AppColors.slate600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Archivos con hash SHA-256 calculado en dispositivo. '
            'Append-only — las evidencias no se editan ni se borran (INV-3).',
            style: TextStyle(
              fontSize: 12,
              color: AppColors.slate500,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          // Summary chips
          Row(
            children: [
              _SummaryPill(
                icon: Icons.verified,
                label: '$subidas subidas',
                color: AppColors.green600,
              ),
              const SizedBox(width: 8),
              if (enCola > 0) ...[
                _SummaryPill(
                  icon: Icons.cloud_off,
                  label: '$enCola en cola',
                  color: AppColors.amber600,
                ),
                const SizedBox(width: 8),
              ],
              _SummaryPill(
                icon: Icons.storage,
                label: '${_evidencias.length} total',
                color: AppColors.blue600,
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Divider(color: AppColors.slate200),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

class _EmptyBody extends StatelessWidget {
  const _EmptyBody();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.upload_file_outlined, size: 64,
                color: AppColors.slate400),
            const SizedBox(height: 16),
            const Text(
              'No hay evidencias registradas',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.slate700,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Capture desde la cámara, galería o suba un archivo.\n'
              'El hash SHA-256 se calcula antes de la subida.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: AppColors.slate500),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Summary pill
// ---------------------------------------------------------------------------

class _SummaryPill extends StatelessWidget {
  const _SummaryPill({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(label,
              style: TextStyle(
                  fontSize: 11, fontWeight: FontWeight.w600, color: color)),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Evidence card
// ---------------------------------------------------------------------------

class _EvidenciaCard extends StatelessWidget {
  const _EvidenciaCard({required this.evidencia});

  final _EvidenciaMock evidencia;

  String _formatDate(DateTime dt) {
    final d = dt.day.toString().padLeft(2, '0');
    final m = dt.month.toString().padLeft(2, '0');
    final h = dt.hour.toString().padLeft(2, '0');
    final min = dt.minute.toString().padLeft(2, '0');
    return '$d/$m/${dt.year} $h:$min';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.slate200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 0),
            child: Row(
              children: [
                // Type icon
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.blue50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    _iconForTipo(evidencia.tipo),
                    size: 20,
                    color: AppColors.blue600,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        evidencia.nombre,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.slate700,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        evidencia.tipo.label,
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.slate500,
                        ),
                      ),
                    ],
                  ),
                ),
                BadgeChip(
                  label: evidencia.estado.label,
                  color: evidencia.estado.color,
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Hash row — INV-3
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: HashChip(hash: evidencia.hashSha256),
          ),
          const SizedBox(height: 10),

          // Integrity error banner
          if (evidencia.estado == _EstadoEvidencia.errorIntegridad)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 14),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.red500.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: AppColors.red500.withValues(alpha: 0.3),
                ),
              ),
              child: const Row(
                children: [
                  Icon(Icons.error_outline, size: 16, color: AppColors.red500),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Hash del servidor no coincide con el hash local. '
                      'El archivo pudo alterarse en tránsito.',
                      style: TextStyle(fontSize: 11, color: AppColors.red500),
                    ),
                  ),
                ],
              ),
            ),

          // Metadata rows
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 8, 14, 12),
            child: Column(
              children: [
                _MetaRow(
                  icon: Icons.link,
                  label: 'Control',
                  value: evidencia.controlAsociado,
                ),
                const SizedBox(height: 4),
                _MetaRow(
                  icon: Icons.business,
                  label: 'Área',
                  value: evidencia.areaResponsable,
                ),
                const SizedBox(height: 4),
                _MetaRow(
                  icon: Icons.calendar_today,
                  label: 'Fecha',
                  value: _formatDate(evidencia.fecha),
                ),
                if (evidencia.archivoNombre != null) ...[
                  const SizedBox(height: 4),
                  _MetaRow(
                    icon: Icons.attach_file,
                    label: 'Archivo',
                    value: evidencia.archivoNombre!,
                  ),
                ],
                if (evidencia.comprimida) ...[
                  const SizedBox(height: 4),
                  const _MetaRow(
                    icon: Icons.compress,
                    label: 'Nota',
                    value: 'Imagen comprimida antes del cálculo del hash',
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _iconForTipo(_TipoEvidencia tipo) {
    return switch (tipo) {
      _TipoEvidencia.organigrama => Icons.account_tree,
      _TipoEvidencia.actaComite => Icons.groups,
      _TipoEvidencia.nombramiento => Icons.person_pin,
      _TipoEvidencia.politica => Icons.policy,
      _TipoEvidencia.planTrabajo => Icons.checklist,
      _TipoEvidencia.presupuesto => Icons.attach_money,
      _TipoEvidencia.contrato => Icons.handshake,
      _TipoEvidencia.otro => Icons.description,
    };
  }
}

// ---------------------------------------------------------------------------
// Metadata row
// ---------------------------------------------------------------------------

class _MetaRow extends StatelessWidget {
  const _MetaRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 14, color: AppColors.slate400),
        const SizedBox(width: 6),
        SizedBox(
          width: 54,
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.slate400,
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
    );
  }
}

// ---------------------------------------------------------------------------
// Add evidence bottom sheet
// ---------------------------------------------------------------------------

class _AddEvidenciaSheet extends StatefulWidget {
  const _AddEvidenciaSheet({required this.onSaved});

  final ValueChanged<_EvidenciaMock> onSaved;

  @override
  State<_AddEvidenciaSheet> createState() => _AddEvidenciaSheetState();
}

class _AddEvidenciaSheetState extends State<_AddEvidenciaSheet> {
  final _nombreCtrl = TextEditingController();
  final _controlCtrl = TextEditingController();
  final _areaCtrl = TextEditingController();
  _TipoEvidencia _tipo = _TipoEvidencia.otro;

  // Simulated attachment state
  final List<_AttachmentInfo> _adjuntos = [];
  bool _comprimirImagenes = false;
  bool _isOffline = false; // togglable for demo

  // Simulated hash from device
  String? _hashCalculado;
  bool _calculandoHash = false;

  // Upload simulation
  bool _subiendo = false;
  double _progreso = 0;

  @override
  void dispose() {
    _nombreCtrl.dispose();
    _controlCtrl.dispose();
    _areaCtrl.dispose();
    super.dispose();
  }

  void _addAdjunto(_OrigenArchivo origen) {
    // Simulate picking a file
    final mockName = switch (origen) {
      _OrigenArchivo.camara => 'foto_${DateTime.now().millisecondsSinceEpoch}.jpg',
      _OrigenArchivo.galeria => 'imagen_seleccionada.png',
      _OrigenArchivo.archivo => 'documento.pdf',
    };

    setState(() {
      _adjuntos.add(_AttachmentInfo(
        nombre: mockName,
        origen: origen,
        tamano: '2.4 MB',
      ));
      _hashCalculado = null; // needs recalculation
    });
  }

  Future<void> _calcularHash() async {
    if (_adjuntos.isEmpty) return;
    setState(() => _calculandoHash = true);

    // Simulate streaming SHA-256 calculation without loading entire file
    await Future.delayed(const Duration(milliseconds: 1200));

    setState(() {
      _calculandoHash = false;
      _hashCalculado =
          'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4';
    });
  }

  Future<void> _guardar() async {
    if (_nombreCtrl.text.isEmpty || _adjuntos.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Ingrese un nombre y al menos un archivo adjunto'),
          backgroundColor: AppColors.red500,
        ),
      );
      return;
    }

    if (_hashCalculado == null) {
      await _calcularHash();
    }

    if (_isOffline) {
      // Enqueue in drift offline queue
      final ev = _EvidenciaMock(
        id: 'EV-${DateTime.now().millisecondsSinceEpoch}',
        nombre: _nombreCtrl.text,
        tipo: _tipo,
        hashSha256: _hashCalculado!,
        fecha: DateTime.now(),
        estado: _EstadoEvidencia.enCola,
        controlAsociado: _controlCtrl.text.isEmpty
            ? 'Sin control asociado'
            : _controlCtrl.text,
        areaResponsable:
            _areaCtrl.text.isEmpty ? 'Sin asignar' : _areaCtrl.text,
        archivoNombre: _adjuntos.first.nombre,
        comprimida: _comprimirImagenes,
      );
      widget.onSaved(ev);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Evidencia guardada en cola offline (Drift). '
              'Se subirá cuando haya conexión.',
            ),
            backgroundColor: AppColors.amber600,
          ),
        );
      }
      return;
    }

    // Simulate resumable upload with progress
    setState(() {
      _subiendo = true;
      _progreso = 0;
    });

    for (var i = 1; i <= 10; i++) {
      await Future.delayed(const Duration(milliseconds: 200));
      if (!mounted) return;
      setState(() => _progreso = i / 10);
    }

    // Simulate server hash comparison
    // In production: server recalculates hash and returns it for comparison
    const serverHash =
        'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4';
    final hashMatch = serverHash == _hashCalculado;

    final ev = _EvidenciaMock(
      id: 'EV-${DateTime.now().millisecondsSinceEpoch}',
      nombre: _nombreCtrl.text,
      tipo: _tipo,
      hashSha256: _hashCalculado!,
      fecha: DateTime.now(),
      estado:
          hashMatch ? _EstadoEvidencia.subida : _EstadoEvidencia.errorIntegridad,
      controlAsociado: _controlCtrl.text.isEmpty
          ? 'Sin control asociado'
          : _controlCtrl.text,
      areaResponsable:
          _areaCtrl.text.isEmpty ? 'Sin asignar' : _areaCtrl.text,
      archivoNombre: _adjuntos.first.nombre,
      comprimida: _comprimirImagenes,
    );

    widget.onSaved(ev);

    if (mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            hashMatch
                ? 'Evidencia subida exitosamente. Hash verificado.'
                : 'Error de integridad: el hash del servidor no coincide.',
          ),
          backgroundColor: hashMatch ? AppColors.green600 : AppColors.red500,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.92,
      ),
      decoration: const BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            margin: const EdgeInsets.only(top: 10),
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.slate200,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          // Title bar
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: Row(
              children: [
                const Icon(Icons.upload_file, color: AppColors.blue600),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Cargar evidencia',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.slate700,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(color: AppColors.slate200),

          // Scrollable form body
          Flexible(
            child: ListView(
              padding: EdgeInsets.fromLTRB(20, 8, 20, 16 + bottomInset),
              shrinkWrap: true,
              children: [
                // --- Section: Información ---
                const _SectionLabel('INFORMACIÓN DE LA EVIDENCIA'),
                const SizedBox(height: 10),

                // Nombre
                _buildTextField(
                  controller: _nombreCtrl,
                  label: 'Nombre de la evidencia *',
                  hint: 'Ej: Organigrama del área de TI',
                ),
                const SizedBox(height: 12),

                // Tipo
                _buildDropdown(),
                const SizedBox(height: 12),

                // Control asociado
                _buildTextField(
                  controller: _controlCtrl,
                  label: 'Control o dimensión asociada',
                  hint: 'Ej: F1-D1 Estructura organizacional',
                ),
                const SizedBox(height: 12),

                // Área responsable
                _buildTextField(
                  controller: _areaCtrl,
                  label: 'Área responsable',
                  hint: 'Ej: Tecnología de la Información',
                ),
                const SizedBox(height: 20),

                // --- Section: Archivos adjuntos ---
                const _SectionLabel('ARCHIVOS ADJUNTOS'),
                const SizedBox(height: 10),

                // Attachment source buttons
                Row(
                  children: [
                    _SourceButton(
                      icon: Icons.camera_alt,
                      label: 'Cámara',
                      onTap: () => _addAdjunto(_OrigenArchivo.camara),
                    ),
                    const SizedBox(width: 8),
                    _SourceButton(
                      icon: Icons.photo_library,
                      label: 'Galería',
                      onTap: () => _addAdjunto(_OrigenArchivo.galeria),
                    ),
                    const SizedBox(width: 8),
                    _SourceButton(
                      icon: Icons.attach_file,
                      label: 'Archivo',
                      onTap: () => _addAdjunto(_OrigenArchivo.archivo),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Attachment list
                if (_adjuntos.isNotEmpty) ...[
                  ..._adjuntos.asMap().entries.map((entry) {
                    final i = entry.key;
                    final adj = entry.value;
                    return Container(
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
                            _iconForOrigen(adj.origen),
                            size: 18,
                            color: AppColors.blue600,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  adj.nombre,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: AppColors.slate700,
                                  ),
                                ),
                                Text(
                                  adj.tamano,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppColors.slate400,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          InkWell(
                            onTap: () =>
                                setState(() => _adjuntos.removeAt(i)),
                            child: const Icon(Icons.close,
                                size: 18, color: AppColors.slate400),
                          ),
                        ],
                      ),
                    );
                  }),
                ],

                const SizedBox(height: 12),

                // Image compression toggle
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.bg,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.compress, size: 18,
                          color: AppColors.slate500),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Comprimir imágenes',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: AppColors.slate700,
                              ),
                            ),
                            Text(
                              'Se aplica ANTES del cálculo del hash',
                              style: TextStyle(
                                fontSize: 11,
                                color: AppColors.slate400,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Switch(
                        value: _comprimirImagenes,
                        activeThumbColor: AppColors.blue600,
                        onChanged: (v) {
                          setState(() {
                            _comprimirImagenes = v;
                            _hashCalculado = null; // invalidate
                          });
                          if (v) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Las imágenes se comprimirán antes de '
                                  'calcular el hash SHA-256.',
                                ),
                                duration: Duration(seconds: 3),
                              ),
                            );
                          }
                        },
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // --- Section: Hash ---
                const _SectionLabel('INTEGRIDAD SHA-256'),
                const SizedBox(height: 10),

                // Hash calculation
                if (_calculandoHash)
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.blue50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.slate200),
                    ),
                    child: const Row(
                      children: [
                        SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor:
                                AlwaysStoppedAnimation(AppColors.blue600),
                          ),
                        ),
                        SizedBox(width: 12),
                        Text(
                          'Calculando hash SHA-256 (streaming)...',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.slate600,
                          ),
                        ),
                      ],
                    ),
                  )
                else if (_hashCalculado != null)
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.green600.withValues(alpha: 0.06),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.green600.withValues(alpha: 0.2),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.verified, size: 16,
                                color: AppColors.green600),
                            SizedBox(width: 6),
                            Text(
                              'Hash calculado en dispositivo',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.green600,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        HashChip(hash: _hashCalculado!),
                        const SizedBox(height: 6),
                        const Text(
                          'El servidor recalculará el hash al recibir el '
                          'archivo y se comparará con este valor.',
                          style: TextStyle(
                              fontSize: 11, color: AppColors.slate400),
                        ),
                      ],
                    ),
                  )
                else
                  OutlinedButton.icon(
                    onPressed: _adjuntos.isNotEmpty ? _calcularHash : null,
                    icon: const Icon(Icons.fingerprint, size: 18),
                    label: const Text('Calcular hash SHA-256'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.blue600,
                      side: const BorderSide(color: AppColors.slate200),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                    ),
                  ),

                const SizedBox(height: 16),

                // --- Offline toggle (demo) ---
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: _isOffline
                        ? AppColors.amber500.withValues(alpha: 0.08)
                        : AppColors.bg,
                    borderRadius: BorderRadius.circular(8),
                    border: _isOffline
                        ? Border.all(
                            color: AppColors.amber500.withValues(alpha: 0.3))
                        : null,
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _isOffline ? Icons.cloud_off : Icons.cloud_done,
                        size: 18,
                        color: _isOffline
                            ? AppColors.amber600
                            : AppColors.green600,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _isOffline
                                  ? 'Modo sin conexión'
                                  : 'Conexión disponible',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: _isOffline
                                    ? AppColors.amber600
                                    : AppColors.green600,
                              ),
                            ),
                            Text(
                              _isOffline
                                  ? 'Se guardará en cola Drift; se sube al reconectar'
                                  : 'Subida reanudable con verificación de hash',
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.slate400,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Switch(
                        value: _isOffline,
                        activeThumbColor: AppColors.amber600,
                        onChanged: (v) => setState(() => _isOffline = v),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Upload progress (when uploading)
                if (_subiendo) ...[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: _progreso,
                      minHeight: 8,
                      backgroundColor:
                          AppColors.slate200.withValues(alpha: 0.5),
                      valueColor:
                          const AlwaysStoppedAnimation(AppColors.blue600),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Subiendo... ${(_progreso * 100).toInt()}% — subida reanudable',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.blue600,
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Save button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _subiendo ? null : _guardar,
                    icon: Icon(
                      _isOffline ? Icons.save : Icons.cloud_upload,
                      size: 18,
                    ),
                    label: Text(
                      _isOffline
                          ? 'Guardar en cola offline'
                          : 'Subir evidencia',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _isOffline
                          ? AppColors.amber600
                          : AppColors.blue600,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
  }) {
    return TextField(
      controller: controller,
      style: const TextStyle(fontSize: 14, color: AppColors.slate700),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        labelStyle:
            const TextStyle(fontSize: 13, color: AppColors.slate500),
        hintStyle:
            const TextStyle(fontSize: 13, color: AppColors.slate400),
        filled: true,
        fillColor: AppColors.bg,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.slate200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.slate200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide:
              const BorderSide(color: AppColors.blue600, width: 1.5),
        ),
      ),
    );
  }

  Widget _buildDropdown() {
    return DropdownButtonFormField<_TipoEvidencia>(
      initialValue: _tipo,
      onChanged: (v) => setState(() => _tipo = v ?? _TipoEvidencia.otro),
      style: const TextStyle(fontSize: 14, color: AppColors.slate700),
      decoration: InputDecoration(
        labelText: 'Tipo / formato *',
        labelStyle:
            const TextStyle(fontSize: 13, color: AppColors.slate500),
        filled: true,
        fillColor: AppColors.bg,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.slate200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.slate200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide:
              const BorderSide(color: AppColors.blue600, width: 1.5),
        ),
      ),
      items: _TipoEvidencia.values
          .map((t) => DropdownMenuItem(value: t, child: Text(t.label)))
          .toList(),
    );
  }

  IconData _iconForOrigen(_OrigenArchivo origen) {
    return switch (origen) {
      _OrigenArchivo.camara => Icons.camera_alt,
      _OrigenArchivo.galeria => Icons.photo_library,
      _OrigenArchivo.archivo => Icons.attach_file,
    };
  }
}

// ---------------------------------------------------------------------------
// Source button (camera / gallery / file)
// ---------------------------------------------------------------------------

class _SourceButton extends StatelessWidget {
  const _SourceButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: AppColors.blue50,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.slate200),
          ),
          child: Column(
            children: [
              Icon(icon, size: 24, color: AppColors.blue600),
              const SizedBox(height: 4),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: AppColors.slate600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Section label
// ---------------------------------------------------------------------------

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 1.0,
        color: AppColors.slate600,
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Attachment info model
// ---------------------------------------------------------------------------

class _AttachmentInfo {
  const _AttachmentInfo({
    required this.nombre,
    required this.origen,
    required this.tamano,
  });

  final String nombre;
  final _OrigenArchivo origen;
  final String tamano;
}
