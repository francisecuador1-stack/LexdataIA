import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';
import 'auth_interceptor.dart';
import 'flavor_config.dart';

/// Central Dio instance configured per flavor with auth interceptor.
class ApiClient {
  ApiClient({
    required FlavorConfig config,
    required SecureTokenStorage tokenStorage,
  }) : dio = Dio(BaseOptions(
          baseUrl: config.apiBaseUrl,
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 30),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        )) {
    dio.interceptors.addAll([
      AuthInterceptor(dio: dio, tokenStorage: tokenStorage),
      if (config.flavor != Flavor.prod)
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          logPrint: (o) {}, // suppress in release
        ),
    ]);
  }

  final Dio dio;
}
