import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Radar chart for PHVA maturity: F1…F7, scale 0–5.
class RadarPhva extends StatelessWidget {
  const RadarPhva({
    required this.values,
    this.maxValue = 5.0,
    this.labels = const [
      'F1 Normas',
      'F2 Amenazas',
      'F3 Implement.',
      'F4 Definición',
      'F5 Supervisión',
      'F6 Auditoría',
      'F7 Mejora',
    ],
    super.key,
  });

  final List<double> values;
  final double maxValue;
  final List<String> labels;

  @override
  Widget build(BuildContext context) {
    return RadarChart(
      RadarChartData(
        dataSets: [
          RadarDataSet(
            dataEntries: values.map((v) => RadarEntry(value: v)).toList(),
            fillColor: AppColors.blue600.withValues(alpha: 0.2),
            borderColor: AppColors.blue600,
            borderWidth: 2,
            entryRadius: 3,
          ),
        ],
        radarBackgroundColor: Colors.transparent,
        borderData: FlBorderData(show: false),
        radarBorderData: BorderSide(color: AppColors.slate200, width: 1),
        tickBorderData: BorderSide(color: AppColors.slate200, width: 0.5),
        gridBorderData: BorderSide(color: AppColors.slate200, width: 0.5),
        tickCount: 5,
        ticksTextStyle: const TextStyle(
          fontSize: 9,
          color: AppColors.slate400,
        ),
        titleTextStyle: const TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: AppColors.slate600,
        ),
        getTitle: (index, _) => RadarChartTitle(
          text: labels[index],
        ),
        titlePositionPercentageOffset: 0.2,
      ),
    );
  }
}
