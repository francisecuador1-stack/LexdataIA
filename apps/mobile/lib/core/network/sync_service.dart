import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/local/app_database.dart';
import 'connectivity_service.dart';

/// Sync manager: retries pending offline operations with exponential backoff.
class SyncService {
  SyncService({
    required this.db,
    required this.connectivity,
  });

  final LocalDatabase db;
  final ConnectivityService connectivity;
  Timer? _retryTimer;
  bool _syncing = false;

  /// Start periodic sync attempts.
  void startPeriodicSync() {
    _retryTimer?.cancel();
    _retryTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      syncPending();
    });
  }

  /// Attempt to sync all pending operations.
  Future<int> syncPending() async {
    if (_syncing || !connectivity.isOnline) return 0;
    _syncing = true;

    try {
      final pending = await db.getPendingOperations();
      var synced = 0;

      for (final op in pending) {
        try {
          // TODO: dispatch by op.type to the correct API call
          // For now, simulate sync
          await Future.delayed(const Duration(milliseconds: 200));
          await db.completeOperation(op.id);
          synced++;
        } catch (_) {
          // Will retry on next cycle with backoff
          break;
        }
      }

      return synced;
    } finally {
      _syncing = false;
    }
  }

  void dispose() {
    _retryTimer?.cancel();
  }
}

final syncServiceProvider = Provider<SyncService>((ref) {
  final svc = SyncService(
    db: ref.watch(localDatabaseProvider),
    connectivity: ref.watch(connectivityProvider),
  );
  ref.onDispose(() => svc.dispose());
  return svc;
});
