import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// KPI card matching the web design: label uppercase, value prominent,
/// optional trend indicator.
class KpiCard extends StatelessWidget {
  const KpiCard({
    required this.label,
    required this.value,
    this.subtitle,
    this.icon,
    this.color,
    this.onTap,
    super.key,
  });

  final String label;
  final String value;
  final String? subtitle;
  final IconData? icon;
  final Color? color;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final effectiveColor = color ?? AppColors.blue600;
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: 16, color: effectiveColor),
                    const SizedBox(width: 6),
                  ],
                  Expanded(
                    child: Text(
                      label.toUpperCase(),
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.5,
                        color: AppColors.slate600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                value,
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: effectiveColor,
                ),
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 4),
                Text(
                  subtitle!,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.slate500,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
