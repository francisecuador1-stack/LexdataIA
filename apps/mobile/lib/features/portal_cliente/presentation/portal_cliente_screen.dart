import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/kpi_card.dart';

/// Placeholder for client portal home.
class PortalClienteScreen extends StatelessWidget {
  const PortalClienteScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Portal del Cliente', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            Text('TechCorp Ecuador S.A.',
                style: TextStyle(fontSize: 11, color: AppColors.blue300)),
          ],
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 1.5,
            children: const [
              KpiCard(
                label: 'Diagnóstico PIMS',
                value: '45%',
                subtitle: 'En progreso',
                icon: Icons.assessment_outlined,
              ),
              KpiCard(
                label: 'Capacitaciones',
                value: '1/8',
                subtitle: 'Módulos completados',
                icon: Icons.school_outlined,
              ),
              KpiCard(
                label: 'Documentos',
                value: '12',
                subtitle: 'Documentos compartidos',
                icon: Icons.folder_outlined,
              ),
              KpiCard(
                label: 'Evidencias',
                value: '5',
                subtitle: 'Cargadas',
                icon: Icons.upload_file_outlined,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
