import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Header matching §1.3: cycle badge + phase badge + alert badges.
class PhaseHeader extends StatelessWidget {
  const PhaseHeader({
    required this.cycle,
    required this.phase,
    required this.title,
    this.subtitle,
    this.alerts = const [],
    super.key,
  });

  final String cycle; // P, H, V, A
  final int phase; // 1–7
  final String title;
  final String? subtitle;
  final List<String> alerts;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              _Badge('$cycle · FASE $phase', AppColors.blue600),
              for (final a in alerts) _Badge(a, AppColors.amber600),
            ],
          ),
          const SizedBox(height: 12),
          Text(title, style: Theme.of(context).textTheme.headlineMedium),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Text(subtitle!, style: Theme.of(context).textTheme.bodySmall),
          ],
        ],
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge(this.text, this.color);

  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
