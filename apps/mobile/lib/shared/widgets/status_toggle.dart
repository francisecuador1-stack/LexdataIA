import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Toggle button group for status filters (e.g. Todos / Pendiente / Validado).
class StatusToggle extends StatelessWidget {
  const StatusToggle({
    required this.options,
    required this.selected,
    required this.onChanged,
    super.key,
  });

  final List<String> options;
  final String selected;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (final opt in options) ...[
            _Chip(
              label: opt,
              isSelected: opt == selected,
              onTap: () => onChanged(opt),
            ),
            const SizedBox(width: 8),
          ],
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.blue600 : AppColors.card,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.blue600 : AppColors.slate200,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: isSelected ? Colors.white : AppColors.slate600,
          ),
        ),
      ),
    );
  }
}
