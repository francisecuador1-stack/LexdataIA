import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Local cache database abstraction for offline support.
/// Uses drift under the hood — full implementation activated after
/// `dart run build_runner build` generates the schema code.
///
/// For now, provides an in-memory mock layer that the features
/// consume through repositories.

/// Norma cached for offline access.
class CachedNorma {
  const CachedNorma({
    required this.id,
    required this.source,
    required this.article,
    required this.title,
    this.category = '',
    this.content = '',
    this.summary = '',
    this.phase = '',
    this.scope = 'Nacional',
    this.status = 'Vigente',
    this.hashSha256 = '',
    this.issuer = '',
    this.issuedDate = '',
    this.version = '1',
    this.normType = '',
    this.isFavorite = false,
  });

  final String id, source, article, title, category, content, summary;
  final String phase, scope, status, hashSha256, issuer, issuedDate;
  final String version, normType;
  final bool isFavorite;
}

/// Principio cached.
class CachedPrincipio {
  const CachedPrincipio({
    required this.id,
    required this.name,
    required this.base,
    required this.status,
    this.definition = '',
    this.verifiedDate,
    this.hashSha256 = '',
    this.auditQuestions = const [],
  });

  final String id, name, base, status, definition, hashSha256;
  final String? verifiedDate;
  final List<String> auditQuestions;
}

/// Control cached.
class CachedControl {
  const CachedControl({
    required this.id,
    required this.source,
    required this.control,
    required this.evidenceRequired,
    required this.phase,
    this.hashSha256 = '',
  });

  final String id, source, control, evidenceRequired, phase, hashSha256;
}

/// Pending offline operation.
class OfflineOperation {
  const OfflineOperation({
    required this.id,
    required this.type,
    required this.payload,
    this.status = 'pending',
    required this.createdAt,
    this.retryCount = 0,
  });

  final int id;
  final String type; // evidence, evaluation, observation
  final String payload; // JSON
  final String status;
  final DateTime createdAt;
  final int retryCount;
}

/// Corpus version info.
class CorpusVersionInfo {
  const CorpusVersionInfo({
    required this.version,
    required this.hashSha256,
    required this.downloadedAt,
  });

  final String version, hashSha256;
  final DateTime downloadedAt;
}

/// Database abstraction — will be backed by drift after code gen.
/// For now uses in-memory storage.
class LocalDatabase {
  final _offlineQueue = <OfflineOperation>[];
  CorpusVersionInfo? corpusVersion;
  int _nextQueueId = 1;

  /// Enqueue an offline operation.
  Future<void> enqueueOperation({
    required String type,
    required String payload,
  }) async {
    _offlineQueue.add(OfflineOperation(
      id: _nextQueueId++,
      type: type,
      payload: payload,
      createdAt: DateTime.now().toUtc(),
    ));
  }

  /// Get pending operations.
  Future<List<OfflineOperation>> getPendingOperations() async {
    return _offlineQueue.where((o) => o.status == 'pending').toList();
  }

  /// Mark operation as completed.
  Future<void> completeOperation(int id) async {
    _offlineQueue.removeWhere((o) => o.id == id);
  }

  /// Get offline queue count.
  int get pendingCount =>
      _offlineQueue.where((o) => o.status == 'pending').length;
}

final localDatabaseProvider = Provider<LocalDatabase>((ref) => LocalDatabase());
