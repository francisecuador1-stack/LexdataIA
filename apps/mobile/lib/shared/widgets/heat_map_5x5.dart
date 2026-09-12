import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// 5×5 heat map for risk: Impact (Y) × Probability (X).
/// Each cell shows the count of risks in that position.
class HeatMap5x5 extends StatelessWidget {
  const HeatMap5x5({
    required this.data,
    super.key,
  });

  /// Map of (impact, probability) → count.
  final Map<(int, int), int> data;

  Color _cellColor(int impact, int probability) {
    final score = impact * probability;
    if (score >= 15) return AppColors.red500;
    if (score >= 8) return AppColors.amber600;
    if (score >= 4) return AppColors.amber500.withValues(alpha: 0.6);
    return AppColors.green600.withValues(alpha: 0.5);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'MAPA DE CALOR — IMPACTO × PROBABILIDAD',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
            color: AppColors.slate600,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Y-axis label
            const RotatedBox(
              quarterTurns: -1,
              child: Text('Impacto',
                  style: TextStyle(fontSize: 10, color: AppColors.slate500)),
            ),
            const SizedBox(width: 4),
            Expanded(
              child: Column(
                children: [
                  for (int y = 5; y >= 1; y--)
                    Row(
                      children: [
                        SizedBox(
                          width: 16,
                          child: Text('$y',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                  fontSize: 10, color: AppColors.slate400)),
                        ),
                        for (int x = 1; x <= 5; x++)
                          Expanded(
                            child: Container(
                              height: 36,
                              margin: const EdgeInsets.all(1),
                              decoration: BoxDecoration(
                                color: _cellColor(y, x).withValues(alpha: 0.3),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(
                                  color: _cellColor(y, x).withValues(alpha: 0.5),
                                  width: 0.5,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  '${data[(y, x)] ?? ''}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: (data[(y, x)] ?? 0) > 0
                                        ? AppColors.slate700
                                        : Colors.transparent,
                                  ),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  Row(
                    children: [
                      const SizedBox(width: 16),
                      for (int x = 1; x <= 5; x++)
                        Expanded(
                          child: Text('$x',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                  fontSize: 10, color: AppColors.slate400)),
                        ),
                    ],
                  ),
                  const Text('Probabilidad',
                      style: TextStyle(fontSize: 10, color: AppColors.slate500)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        // Legend
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _LegendItem('Bajo', AppColors.green600),
            _LegendItem('Medio', AppColors.amber500),
            _LegendItem('Alto', AppColors.amber600),
            _LegendItem('Crítico', AppColors.red500),
          ],
        ),
      ],
    );
  }
}

class _LegendItem extends StatelessWidget {
  const _LegendItem(this.label, this.color);

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 3),
          Text(label,
              style: const TextStyle(fontSize: 10, color: AppColors.slate500)),
        ],
      ),
    );
  }
}
