/// Base exception for all app errors.
sealed class AppException implements Exception {
  const AppException(this.message, [this.cause]);

  final String message;
  final Object? cause;

  @override
  String toString() => '$runtimeType: $message';
}

class NetworkException extends AppException {
  const NetworkException(super.message, [super.cause]);
}

class UnauthorizedException extends AppException {
  const UnauthorizedException([String message = 'Sesión expirada'])
      : super(message);
}

class ForbiddenException extends AppException {
  const ForbiddenException([String message = 'Sin permisos'])
      : super(message);
}

class ValidationException extends AppException {
  const ValidationException(super.message, {this.errors = const {}});

  final Map<String, String> errors;
}

class IntegrityException extends AppException {
  const IntegrityException(
      [String message = 'Error de integridad del hash'])
      : super(message);
}

class OfflineException extends AppException {
  const OfflineException([String message = 'Sin conexión a internet'])
      : super(message);
}
