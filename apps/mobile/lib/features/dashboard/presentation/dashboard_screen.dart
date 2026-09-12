import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/kpi_card.dart';
import '../../../shared/widgets/badge_chip.dart';
import '../../../shared/widgets/radar_phva.dart';

/// Dashboard screen with mock data matching spec §2.1:
/// 2.7/5 maturity, 62% compliance, 3 hallazgos, 1 riesgo crítico.
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('LEXDATA IA', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            Text(
              'Sistema SGPDP · LOPDP Ecuador',
              style: TextStyle(fontSize: 11, color: AppColors.blue300),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Badge(
              label: Text('3', style: TextStyle(fontSize: 10)),
              child: Icon(Icons.notifications_outlined),
            ),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // TODO: refresh data from API
          await Future.delayed(const Duration(seconds: 1));
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Company selector
            Card(
              child: ListTile(
                leading: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.blue50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.business, color: AppColors.blue600),
                ),
                title: const Text('TechCorp Ecuador S.A.',
                    style: TextStyle(fontWeight: FontWeight.w600)),
                subtitle: const Text('Tecnología · Quito'),
                trailing: const Icon(Icons.unfold_more, color: AppColors.slate400),
                onTap: () {
                  // TODO: company selector bottom sheet
                },
              ),
            ),
            const SizedBox(height: 16),

            // "Requiere tu atención" section
            _SectionTitle('REQUIERE TU ATENCIÓN'),
            const SizedBox(height: 8),
            _UrgencyCard(
              icon: Icons.warning_amber,
              color: AppColors.red500,
              title: 'Incidente con plazo de 72h',
              subtitle: 'Brecha de seguridad — ~22h restantes',
              badge: 'URGENTE',
            ),
            const SizedBox(height: 8),
            _UrgencyCard(
              icon: Icons.task_alt,
              color: AppColors.amber600,
              title: '2 aprobaciones pendientes',
              subtitle: 'DPA con proveedor cloud + Política de privacidad',
              badge: 'PENDIENTE',
            ),
            const SizedBox(height: 8),
            _UrgencyCard(
              icon: Icons.smart_toy,
              color: AppColors.blue600,
              title: 'Propuesta de MARK AI',
              subtitle: 'Actualización de RAT — 5 tratamientos sin base legal',
              badge: 'PROPUESTA',
            ),
            const SizedBox(height: 24),

            // KPI cards — 2 per row
            _SectionTitle('ESTADO DEL SGPDP'),
            const SizedBox(height: 8),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              childAspectRatio: 1.5,
              children: const [
                KpiCard(
                  label: 'Estado SGPDP',
                  value: '2.7/5',
                  subtitle: 'Definido',
                  icon: Icons.shield_outlined,
                  color: AppColors.amber600,
                ),
                KpiCard(
                  label: 'Madurez Global',
                  value: '2.7',
                  subtitle: 'Definido',
                  icon: Icons.speed_outlined,
                  color: AppColors.blue600,
                ),
                KpiCard(
                  label: 'Cumplimiento Doc.',
                  value: '62%',
                  subtitle: 'Documentos aprobados',
                  icon: Icons.description_outlined,
                  color: AppColors.blue500,
                ),
                KpiCard(
                  label: 'Hallazgos Abiertos',
                  value: '3',
                  subtitle: '0 críticos',
                  icon: Icons.search_outlined,
                  color: AppColors.amber600,
                ),
                KpiCard(
                  label: 'Riesgos Críticos',
                  value: '1',
                  subtitle: '5 total',
                  icon: Icons.warning_outlined,
                  color: AppColors.red500,
                ),
                KpiCard(
                  label: 'Incidentes Activos',
                  value: '1',
                  subtitle: 'Reloj 72h activo',
                  icon: Icons.timer_outlined,
                  color: AppColors.red500,
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Maturity radar — fl_chart
            _SectionTitle('MADUREZ POR FASE PHVA'),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: SizedBox(
                  height: 260,
                  child: RadarPhva(
                    values: const [3.0, 2.5, 2.0, 3.0, 2.5, 2.7, 2.0],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Phase progress bars
            _SectionTitle('PROGRESO POR MÓDULO'),
            const SizedBox(height: 8),
            ..._buildPhaseProgress(),
            const SizedBox(height: 24),

            // Recent activity
            _SectionTitle('ACTIVIDAD RECIENTE'),
            const SizedBox(height: 8),
            Card(
              child: Column(
                children: [
                  _ActivityItem('Auditoría completada', 'Ciclo PHVA Q2 2026', '10 sep 2026'),
                  const Divider(height: 1),
                  _ActivityItem('Eficacia calificada', 'Control LOPDP 41', '09 sep 2026'),
                  const Divider(height: 1),
                  _ActivityItem('Hallazgo registrado', 'Backups sin cifrado', '08 sep 2026'),
                  const Divider(height: 1),
                  _ActivityItem('Control declarado', 'Cifrado AES-256', '07 sep 2026'),
                  const Divider(height: 1),
                  _ActivityItem('Evidencia cargada', 'Acta de Comité', '06 sep 2026'),
                ],
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildPhaseProgress() {
    const phases = [
      ('F1 · Normas', 3.0, 'Definido'),
      ('F2 · Amenazas', 2.5, 'Repetible'),
      ('F3 · Implementación', 2.0, 'Repetible'),
      ('F4 · Definición', 3.0, 'Definido'),
      ('F5 · Supervisión', 2.5, 'Repetible'),
      ('F6 · Auditoría', 2.7, 'Definido'),
      ('F7 · Mejora', 2.0, 'Repetible'),
    ];

    return [
      for (final (label, value, level) in phases)
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(label,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          )),
                      Text('$value/5 · $level',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.slate500,
                          )),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: value / 5,
                    backgroundColor: AppColors.slate200,
                    color: value >= 3
                        ? AppColors.green600
                        : value >= 2
                            ? AppColors.amber500
                            : AppColors.red500,
                    minHeight: 6,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ],
              ),
            ),
          ),
        ),
    ];
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.5,
        color: AppColors.slate600,
      ),
    );
  }
}

class _UrgencyCard extends StatelessWidget {
  const _UrgencyCard({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.badge,
  });

  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final String badge;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color, size: 22),
        ),
        title: Text(title,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
        trailing: BadgeChip(label: badge, color: color),
      ),
    );
  }
}

class _ActivityItem extends StatelessWidget {
  const _ActivityItem(this.type, this.detail, this.date);

  final String type;
  final String detail;
  final String date;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      dense: true,
      leading: const Icon(Icons.event_note, size: 20, color: AppColors.blue600),
      title: Text(type, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
      subtitle: Text(detail, style: const TextStyle(fontSize: 12)),
      trailing: Text(date, style: const TextStyle(fontSize: 11, color: AppColors.slate400)),
    );
  }
}
