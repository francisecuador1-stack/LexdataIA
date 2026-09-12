import 'dart:async';
import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';

/// Dio interceptor: attaches access token, refreshes on 401 with
/// single-flight concurrency (only one refresh at a time).
class AuthInterceptor extends Interceptor {
  AuthInterceptor({
    required Dio dio,
    required this.tokenStorage,
  }) : _dio = dio;

  final Dio _dio;
  final SecureTokenStorage tokenStorage;

  Completer<String?>? _refreshCompleter;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await tokenStorage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode != 401) {
      return handler.next(err);
    }

    // Single-flight refresh
    try {
      final newToken = await _refreshToken();
      if (newToken == null) {
        await tokenStorage.clearAll();
        return handler.next(err);
      }

      // Retry the failed request
      final opts = err.requestOptions;
      opts.headers['Authorization'] = 'Bearer $newToken';
      final response = await _dio.fetch(opts);
      return handler.resolve(response);
    } catch (_) {
      await tokenStorage.clearAll();
      return handler.next(err);
    }
  }

  Future<String?> _refreshToken() async {
    if (_refreshCompleter != null) {
      return _refreshCompleter!.future;
    }

    _refreshCompleter = Completer<String?>();

    try {
      final refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken == null) {
        _refreshCompleter!.complete(null);
        return null;
      }

      final response = await Dio(BaseOptions(
        baseUrl: _dio.options.baseUrl,
      )).post('/auth/refresh', data: {'refreshToken': refreshToken});

      final accessToken = response.data['accessToken'] as String?;
      final newRefresh = response.data['refreshToken'] as String?;

      if (accessToken != null) {
        await tokenStorage.saveAccessToken(accessToken);
        if (newRefresh != null) {
          await tokenStorage.saveRefreshToken(newRefresh);
        }
      }

      _refreshCompleter!.complete(accessToken);
      return accessToken;
    } catch (e) {
      _refreshCompleter!.complete(null);
      return null;
    } finally {
      _refreshCompleter = null;
    }
  }
}
