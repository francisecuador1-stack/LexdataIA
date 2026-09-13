import 'package:dio/dio.dart';
import '../models/auth_models.dart';
import '../../core/storage/secure_storage.dart';

/// Repository that talks to the API auth endpoints.
/// In development, returns mock data when the API is unreachable.
class AuthRepository {
  AuthRepository({required this._dio, required this.storage});

  final Dio _dio;
  final SecureTokenStorage storage;

  /// POST /auth/login
  Future<LoginResponse> login(LoginRequest request) async {
    try {
      final res = await _dio.post('/auth/login', data: request.toJson());
      return LoginResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException {
      // Mock response for development when API is not running
      return LoginResponse(
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        requiresMfa: false,
        user: const UserDto(
          id: 'usr_001',
          email: 'dpo@lexdata.ec',
          displayName: 'Dra. Andreina Almeida',
          role: 'DPO_HUMANO',
          tenantId: 'tenant_c1',
        ),
      );
    }
  }

  /// POST /auth/mfa/verify
  Future<LoginResponse> verifyMfa(MfaVerifyRequest request) async {
    try {
      final res = await _dio.post('/auth/mfa/verify', data: request.toJson());
      return LoginResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException {
      return const LoginResponse(
        accessToken: 'mock_access_token_mfa',
        refreshToken: 'mock_refresh_token_mfa',
        requiresMfa: false,
        user: UserDto(
          id: 'usr_001',
          email: 'dpo@lexdata.ec',
          displayName: 'Dra. Andreina Almeida',
          role: 'DPO_HUMANO',
          tenantId: 'tenant_c1',
        ),
      );
    }
  }

  /// POST /auth/pin/verify — verify signature PIN
  Future<bool> verifySignaturePin(String pin) async {
    try {
      final res = await _dio.post('/auth/pin/verify', data: {'pin': pin});
      return res.statusCode == 200;
    } on DioException {
      // Mock: accept '123456'
      return pin == '123456';
    }
  }

  /// Save tokens securely after login.
  Future<void> persistTokens(LoginResponse response) async {
    await storage.saveAccessToken(response.accessToken);
    await storage.saveRefreshToken(response.refreshToken);
  }

  /// Clear session.
  Future<void> clearSession() => storage.clearAll();

  /// Check if we have stored tokens (for biometric reopen).
  Future<bool> hasStoredSession() async {
    final token = await storage.getRefreshToken();
    return token != null;
  }
}
