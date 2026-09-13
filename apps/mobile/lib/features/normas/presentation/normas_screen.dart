import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

import '../../../shared/widgets/badge_chip.dart';
import '../../../shared/widgets/hash_chip.dart';
import '../../../shared/widgets/status_toggle.dart';

/// Normas screen with Nacional/Internacional tabs, search, favorites.
/// Data is mock — will be backed by drift cache in full implementation.
class NormasScreen extends StatefulWidget {
  const NormasScreen({super.key});

  @override
  State<NormasScreen> createState() => _NormasScreenState();
}

class _NormasScreenState extends State<NormasScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabCtrl;
  String _search = '';
  final _favorites = <String>{};
  String _scope = 'Nacional';

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  List<_NormaMock> get _filteredNormas {
    return _allNormas.where((n) {
      if (_scope == 'Nacional' && n.scope != 'Nacional') return false;
      if (_scope == 'Internacional' && n.scope != 'Internacional') return false;
      if (_search.isNotEmpty) {
        final q = _search.toLowerCase();
        return n.title.toLowerCase().contains(q) ||
            n.article.toLowerCase().contains(q) ||
            n.source.toLowerCase().contains(q);
      }
      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Normas'),
        bottom: TabBar(
          controller: _tabCtrl,
          indicatorColor: AppColors.blue300,
          labelColor: Colors.white,
          unselectedLabelColor: AppColors.slate400,
          tabs: const [
            Tab(text: 'Biblioteca (28N · 8I)'),
            Tab(text: 'Matriz (18)'),
            Tab(text: 'Principios (13)'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabCtrl,
        children: [
          _buildBiblioteca(),
          _buildMatriz(),
          _buildPrincipios(),
        ],
      ),
    );
  }

  Widget _buildBiblioteca() {
    final normas = _filteredNormas;
    return Column(
      children: [
        // Scope toggle + search
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Column(
            children: [
              StatusToggle(
                options: const ['Nacional', 'Internacional'],
                selected: _scope,
                onChanged: (v) => setState(() => _scope = v),
              ),
              const SizedBox(height: 8),
              TextField(
                onChanged: (v) => setState(() => _search = v),
                decoration: InputDecoration(
                  hintText: 'Búsqueda semántica…',
                  prefixIcon: const Icon(Icons.search, size: 20),
                  suffixIcon: _search.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, size: 18),
                          onPressed: () => setState(() => _search = ''),
                        )
                      : null,
                  isDense: true,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Text(
                    '${normas.length} normas · ${_favorites.length} favoritas',
                    style: const TextStyle(
                        fontSize: 12, color: AppColors.slate400),
                  ),
                ],
              ),
            ],
          ),
        ),
        // List
        Expanded(
          child: ListView.separated(
            itemCount: normas.length,
            separatorBuilder: (_, _) => const Divider(height: 1),
            itemBuilder: (_, i) {
              final n = normas[i];
              final isFav = _favorites.contains(n.id);
              return ListTile(
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.blue50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Center(
                    child: Text(
                      n.source,
                      style: const TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        color: AppColors.blue600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
                title: Text(n.title,
                    style: const TextStyle(
                        fontSize: 14, fontWeight: FontWeight.w500)),
                subtitle: Row(
                  children: [
                    Text(n.article,
                        style: const TextStyle(fontSize: 12)),
                    const SizedBox(width: 8),
                    const BadgeChip.vigente(),
                  ],
                ),
                trailing: IconButton(
                  icon: Icon(
                    isFav ? Icons.star : Icons.star_border,
                    color: isFav ? AppColors.amber500 : AppColors.slate400,
                    size: 20,
                  ),
                  onPressed: () {
                    setState(() {
                      if (isFav) {
                        _favorites.remove(n.id);
                      } else {
                        _favorites.add(n.id);
                      }
                    });
                  },
                ),
                onTap: () => _showNormaDetail(n),
              );
            },
          ),
        ),
        // Offline indicator
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          color: AppColors.blue50,
          child: Row(
            children: [
              const Icon(Icons.cloud_done, size: 14, color: AppColors.green600),
              const SizedBox(width: 6),
              Text(
                'Corpus v1.0 · Descargado para uso sin conexión',
                style: TextStyle(fontSize: 11, color: AppColors.slate500),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showNormaDetail(_NormaMock norma) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        expand: false,
        builder: (_, scrollCtrl) => ListView(
          controller: scrollCtrl,
          padding: const EdgeInsets.all(20),
          children: [
            // Header
            Row(
              children: [
                BadgeChip(label: norma.source, color: AppColors.blue600),
                const SizedBox(width: 6),
                BadgeChip(label: norma.article, color: AppColors.blue600),
                const SizedBox(width: 6),
                BadgeChip(label: norma.phase, color: AppColors.slate500),
                const Spacer(),
                const BadgeChip.vigente(),
              ],
            ),
            const SizedBox(height: 12),
            Text(norma.title,
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 4),
            Text(norma.category,
                style: const TextStyle(fontSize: 13, color: AppColors.slate500)),
            const SizedBox(height: 20),

            // Summary
            _DetailSection(
              title: 'RESUMEN EJECUTIVO',
              child: Text(norma.summary,
                  style: const TextStyle(fontSize: 14, height: 1.5)),
            ),

            // Hash
            _DetailSection(
              title: 'HASH CRIPTOGRÁFICO — INTEGRIDAD NORMATIVA',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  HashChip(hash: norma.hash),
                  const SizedBox(height: 6),
                  const Text(
                    'Este hash garantiza que el contenido normativo es inalterable. '
                    'Cualquier modificación invalidaría el hash (RN-004).',
                    style: TextStyle(fontSize: 11, color: AppColors.slate400),
                  ),
                ],
              ),
            ),

            // Metadata
            _DetailSection(
              title: 'METADATOS DEL DOCUMENTO',
              child: Column(
                children: [
                  _MetaRow('ORGANISMO EMISOR', norma.issuer),
                  _MetaRow('TIPO DE NORMA', norma.normType),
                  _MetaRow('VERSIÓN', 'v1.0'),
                  _MetaRow('ALCANCE', norma.scope),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMatriz() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.blue50,
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Text(
            'RN-004 · Matriz Normativa — API Interna del Sistema. '
            'Esta matriz es la fuente de conocimiento única del SGPDP.',
            style: TextStyle(fontSize: 12, color: AppColors.blue600),
          ),
        ),
        const SizedBox(height: 12),
        for (final c in _mockControles)
          Card(
            child: ListTile(
              dense: true,
              title: Text(c.control,
                  style: const TextStyle(
                      fontSize: 13, fontWeight: FontWeight.w500)),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 4),
                  Text('Evidencia: ${c.evidence}',
                      style: const TextStyle(fontSize: 11)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      BadgeChip(label: c.source, color: AppColors.blue600),
                      const SizedBox(width: 6),
                      BadgeChip(label: c.phase, color: AppColors.slate500),
                    ],
                  ),
                ],
              ),
            ),
          ),
        const SizedBox(height: 8),
        Text(
          '18 de 18 controles · Matriz es de solo lectura para operadores',
          style: TextStyle(fontSize: 11, color: AppColors.slate400),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildPrincipios() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          '13 Principios Rectores · Art. 10 LOPDP + RGLOPDP — '
          'Obligatorios para todo tratamiento',
          style: TextStyle(fontSize: 13, color: AppColors.slate600),
        ),
        const SizedBox(height: 12),
        for (final p in _mockPrincipios)
          Card(
            child: ListTile(
              title: Text(p.name,
                  style: const TextStyle(
                      fontSize: 14, fontWeight: FontWeight.w500)),
              subtitle: Text(p.base,
                  style: const TextStyle(fontSize: 12)),
              trailing: BadgeChip(
                label: p.status,
                color: p.status == 'Verificado'
                    ? AppColors.green600
                    : p.status == 'Pendiente'
                        ? AppColors.amber500
                        : AppColors.red500,
              ),
            ),
          ),
      ],
    );
  }
}

class _DetailSection extends StatelessWidget {
  const _DetailSection({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
                color: AppColors.slate600,
              )),
          const SizedBox(height: 8),
          child,
        ],
      ),
    );
  }
}

class _MetaRow extends StatelessWidget {
  const _MetaRow(this.label, this.value);

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          SizedBox(
            width: 140,
            child: Text(label,
                style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.slate500)),
          ),
          Expanded(
            child: Text(value,
                style: const TextStyle(fontSize: 13)),
          ),
        ],
      ),
    );
  }
}

// Mock data
class _NormaMock {
  const _NormaMock({
    required this.id,
    required this.source,
    required this.article,
    required this.title,
    required this.category,
    required this.scope,
    required this.phase,
    this.summary = '',
    this.hash = '',
    this.issuer = '',
    this.normType = '',
  });

  final String id, source, article, title, category, scope, phase;
  final String summary, hash, issuer, normType;
}

const _allNormas = [
  _NormaMock(id: 'n1', source: 'LOPDP', article: 'Art. 7', title: 'Consentimiento del titular', category: 'Bases de Legitimación', scope: 'Nacional', phase: 'Planificar', summary: 'Regula las condiciones bajo las cuales el responsable del tratamiento debe obtener el consentimiento libre, específico, informado e inequívoco del titular.', hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', issuer: 'Asamblea Nacional del Ecuador', normType: 'Ley Orgánica'),
  _NormaMock(id: 'n2', source: 'LOPDP', article: 'Art. 9', title: 'Obligación legal o reglamentaria', category: 'Bases de Legitimación', scope: 'Nacional', phase: 'Planificar', summary: 'Establece que el tratamiento es lícito cuando es necesario para el cumplimiento de una obligación legal aplicable al responsable.', hash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', issuer: 'Asamblea Nacional del Ecuador', normType: 'Ley Orgánica'),
  _NormaMock(id: 'n3', source: 'LOPDP', article: 'Art. 10', title: 'Principios aplicables al tratamiento', category: 'Principios Rectores', scope: 'Nacional', phase: 'Planificar', summary: 'Define los 13 principios rectores que rigen todo tratamiento de datos personales.', hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4', issuer: 'Asamblea Nacional del Ecuador', normType: 'Ley Orgánica'),
  _NormaMock(id: 'n4', source: 'LOPDP', article: 'Art. 37', title: 'Registro de actividades de tratamiento', category: 'Obligaciones del Responsable', scope: 'Nacional', phase: 'Hacer', summary: 'Obliga a mantener un RAT actualizado con todas las actividades de tratamiento.', hash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5', issuer: 'Asamblea Nacional del Ecuador', normType: 'Ley Orgánica'),
  _NormaMock(id: 'n5', source: 'LOPDP', article: 'Art. 39', title: 'EIPD', category: 'Evaluación de Impacto', scope: 'Nacional', phase: 'Planificar', summary: 'Establece la obligación de realizar una Evaluación de Impacto en la Protección de Datos cuando un tratamiento pueda entrañar un alto riesgo.', hash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6', issuer: 'Asamblea Nacional del Ecuador', normType: 'Ley Orgánica'),
  _NormaMock(id: 'n6', source: 'LOPDP', article: 'Art. 41', title: 'Notificación de brechas de seguridad', category: 'Seguridad', scope: 'Nacional', phase: 'Hacer', summary: 'Establece la obligación de notificar a la SPDP en un plazo máximo de 72 horas desde la detección de una vulneración de seguridad.', hash: 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7', issuer: 'Asamblea Nacional del Ecuador', normType: 'Ley Orgánica'),
  _NormaMock(id: 'n7', source: 'LOPDP', article: 'Art. 42', title: 'Funciones del DPO', category: 'Gobernanza', scope: 'Nacional', phase: 'Planificar', summary: 'Define las funciones y responsabilidades del Delegado de Protección de Datos.', hash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8', issuer: 'Asamblea Nacional del Ecuador', normType: 'Ley Orgánica'),
  _NormaMock(id: 'n8', source: 'ISO', article: '27001 §6.1', title: 'Gestión de riesgos de seguridad', category: 'Gestión de Riesgos', scope: 'Internacional', phase: 'Planificar', summary: 'Establece los requisitos para identificar, analizar y evaluar los riesgos de seguridad de la información.', hash: 'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9', issuer: 'ISO', normType: 'Estándar Internacional'),
  _NormaMock(id: 'n9', source: 'ISO', article: '27701 §5.2', title: 'Política de privacidad', category: 'Gobernanza', scope: 'Internacional', phase: 'Planificar', summary: 'Requisitos para establecer, implementar y mantener una política de privacidad.', hash: 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0', issuer: 'ISO', normType: 'Estándar Internacional'),
];

class _ControlMock {
  const _ControlMock(this.source, this.control, this.evidence, this.phase);
  final String source, control, evidence, phase;
}

const _mockControles = [
  _ControlMock('LOPDP 7', 'Formulario de consentimiento informado', 'Registro de consentimientos firmados o electrónicos', 'Planificar'),
  _ControlMock('LOPDP 10', 'Auditoría de principios por tratamiento', 'Acta de auditoría con checklist', 'Verificar'),
  _ControlMock('LOPDP 39', 'Evaluación de impacto documentada', 'Informe EIPD con firma del DPO', 'Planificar'),
  _ControlMock('LOPDP 41', 'Protocolo de notificación 72h a SPDP', 'Protocolo documentado y capacitación', 'Hacer'),
  _ControlMock('LOPDP 42', 'DPO designado y notificado a la SPDP', 'Comunicación a la SPDP + nombramiento', 'Planificar'),
  _ControlMock('NIST PR.DS-1', 'Cifrado de datos en reposo (AES-256)', 'Configuración verificada por auditoría técnica', 'Hacer'),
];

class _PrincipioMock {
  const _PrincipioMock(this.name, this.base, this.status);
  final String name, base, status;
}

const _mockPrincipios = [
  _PrincipioMock('Juridicidad', 'Art. 10 LOPDP', 'Verificado'),
  _PrincipioMock('Transparencia', 'Art. 10, 13 LOPDP', 'Verificado'),
  _PrincipioMock('Finalidad', 'Art. 10 LOPDP', 'Pendiente'),
  _PrincipioMock('Minimización', 'Art. 10 LOPDP', 'No Verificado'),
  _PrincipioMock('Confidencialidad', 'Art. 10 LOPDP', 'Verificado'),
  _PrincipioMock('Seguridad', 'Art. 10, 30 LOPDP', 'Pendiente'),
  _PrincipioMock('Proporcionalidad', 'Art. 10 LOPDP', 'No Verificado'),
  _PrincipioMock('Lealtad', 'Art. 10 LOPDP', 'Pendiente'),
  _PrincipioMock('Exactitud y Calidad', 'Art. 10 LOPDP / Art. 9 RGLOPDP', 'Pendiente'),
  _PrincipioMock('Limitación del Almacenamiento', 'Art. 10 LOPDP / Art. 11 RGLOPDP', 'No Verificado'),
  _PrincipioMock('Responsabilidad Proactiva', 'Art. 10 LOPDP / Art. 12 RGLOPDP', 'Pendiente'),
  _PrincipioMock('No Discriminación', 'Art. 66 CRE / Art. 10 RGLOPDP', 'No Verificado'),
  _PrincipioMock('Libre Circulación Controlada', 'Art. 54 LOPDP / Art. 13 RGLOPDP', 'No Verificado'),
];
