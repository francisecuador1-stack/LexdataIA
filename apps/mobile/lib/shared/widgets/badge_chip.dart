import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Small colored badge for status, level, etc.
class BadgeChip extends StatelessWidget {
  const BadgeChip({
    required this.label,
    this.color,
    this.textColor,
    super.key,
  });

  /// Convenience constructors for common statuses.
  const BadgeChip.vigente({super.key})
      : label = 'Vigente',
        color = AppColors.green600,
        textColor = null;

  const BadgeChip.critico({super.key})
      : label = 'Crítico',
        color = AppColors.red500,
        textColor = null;

  const BadgeChip.alto({super.key})
      : label = 'Alto',
        color = AppColors.amber600,
        textColor = null;

  const BadgeChip.pendiente({super.key})
      : label = 'Pendiente',
        color = AppColors.amber500,
        textColor = null;

  final String label;
  final Color? color;
  final Color? textColor;

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.blue600;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: c.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: textColor ?? c,
        ),
      ),
    );
  }
}
