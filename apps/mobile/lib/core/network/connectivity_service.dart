import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Exposes a stream of connectivity state for the entire app.
class ConnectivityService {
  ConnectivityService() {
    _subscription = Connectivity()
        .onConnectivityChanged
        .listen((results) {
      _isOnline = results.any((r) => r != ConnectivityResult.none);
    });
  }

  late final StreamSubscription<List<ConnectivityResult>> _subscription;
  bool _isOnline = true;

  bool get isOnline => _isOnline;

  Future<bool> checkNow() async {
    final result = await Connectivity().checkConnectivity();
    _isOnline = result.any((r) => r != ConnectivityResult.none);
    return _isOnline;
  }

  void dispose() => _subscription.cancel();
}

final connectivityProvider = Provider<ConnectivityService>((ref) {
  final svc = ConnectivityService();
  ref.onDispose(() => svc.dispose());
  return svc;
});

/// Stream provider for reactive connectivity.
final isOnlineProvider = StreamProvider<bool>((ref) {
  return Connectivity().onConnectivityChanged.map(
    (results) => results.any((r) => r != ConnectivityResult.none),
  );
});
