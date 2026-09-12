import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Wrapper for flutter_secure_storage — tokens live in Keychain/Keystore,
/// never in SharedPreferences.
class SecureTokenStorage {
  SecureTokenStorage([FlutterSecureStorage? storage])
      : _storage = storage ?? const FlutterSecureStorage(
          aOptions: AndroidOptions(encryptedSharedPreferences: true),
        );

  final FlutterSecureStorage _storage;

  static const _accessKey = 'access_token';
  static const _refreshKey = 'refresh_token';
  static const _pinHashKey = 'pin_hash';

  // Access token — kept in memory by the interceptor, but persisted for
  // biometric reopen.
  Future<String?> getAccessToken() => _storage.read(key: _accessKey);
  Future<void> saveAccessToken(String token) =>
      _storage.write(key: _accessKey, value: token);

  // Refresh token
  Future<String?> getRefreshToken() => _storage.read(key: _refreshKey);
  Future<void> saveRefreshToken(String token) =>
      _storage.write(key: _refreshKey, value: token);

  // PIN hash (for signature)
  Future<String?> getPinHash() => _storage.read(key: _pinHashKey);
  Future<void> savePinHash(String hash) =>
      _storage.write(key: _pinHashKey, value: hash);

  // Clear all on logout
  Future<void> clearAll() => _storage.deleteAll();
}
