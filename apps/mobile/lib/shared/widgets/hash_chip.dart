import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/hash_utils.dart';

/// Displays a truncated SHA-256 hash with copy-to-clipboard.
class HashChip extends StatelessWidget {
  const HashChip({required this.hash, super.key});

  final String hash;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(4),
      onTap: () {
        Clipboard.setData(ClipboardData(text: hash));
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Hash copiado al portapapeles'),
            duration: Duration(seconds: 2),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.slate200.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.fingerprint, size: 14, color: AppColors.slate500),
            const SizedBox(width: 4),
            Text(
              HashUtils.displayHash(hash),
              style: const TextStyle(
                fontSize: 11,
                fontFamily: 'monospace',
                color: AppColors.slate600,
              ),
            ),
            const SizedBox(width: 4),
            const Icon(Icons.copy, size: 12, color: AppColors.slate400),
          ],
        ),
      ),
    );
  }
}
