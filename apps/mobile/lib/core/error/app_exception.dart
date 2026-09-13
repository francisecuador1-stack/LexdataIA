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
  const UnauthorizedException([super.message = 'Sesión expirada']);
}

class ForbiddenException extends AppException {
  const ForbiddenException([super.message = 'Sin permisos']);
}

class ValidationException extends AppException {
  const ValidationException(super.message, {this.errors = const {}});

  final Map<String, String> errors;
}

class IntegrityException extends AppException {
  const IntegrityException(
      [super.message = 'Error de integridad del hash']);
}

class OfflineException extends AppException {
  const OfflineException([super.message = 'Sin conexión a internet']);
}
