import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/network/connectivity_service.dart';
import '../../data/local/app_database.dart';

/// Shows sync status: online/offline indicator + pending operations count.
class SyncStatusBar extends ConsumerWidget {
  const SyncStatusBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final connectivityAsync = ref.watch(isOnlineProvider);
    final db = ref.watch(localDatabaseProvider);

    return connectivityAsync.when(
      data: (isOnline) => _buildBar(isOnline, db.pendingCount),
      loading: () => const SizedBox.shrink(),
      error: (_, _) => _buildBar(false, db.pendingCount),
    );
  }

  Widget _buildBar(bool isOnline, int pendingCount) {
    if (isOnline && pendingCount == 0) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: isOnline ? AppColors.amber500.withValues(alpha: 0.1) : AppColors.red500.withValues(alpha: 0.1),
      child: Row(
        children: [
          Icon(
            isOnline ? Icons.sync : Icons.cloud_off,
            size: 16,
            color: isOnline ? AppColors.amber600 : AppColors.red500,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              isOnline
                  ? '$pendingCount operaciones pendientes de sincronizar'
                  : 'Sin conexión · $pendingCount operaciones en cola',
              style: TextStyle(
                fontSize: 12,
                color: isOnline ? AppColors.amber600 : AppColors.red500,
              ),
            ),
          ),
          if (isOnline && pendingCount > 0)
            TextButton(
              onPressed: () {
                // Trigger manual sync
              },
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                minimumSize: const Size(0, 28),
              ),
              child: const Text('Sincronizar', style: TextStyle(fontSize: 12)),
            ),
        ],
      ),
    );
  }
}
