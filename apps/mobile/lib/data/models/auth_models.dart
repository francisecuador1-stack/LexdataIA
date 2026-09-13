/// Login request/response models.
library;

class LoginRequest {
  const LoginRequest({required this.email, required this.password});

  final String email;
  final String password;

  Map<String, dynamic> toJson() => {
        'email': email,
        'password': password,
      };
}

class LoginResponse {
  const LoginResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.requiresMfa,
    this.mfaToken,
    this.user,
  });

  final String accessToken;
  final String refreshToken;
  final bool requiresMfa;
  final String? mfaToken;
  final UserDto? user;

  factory LoginResponse.fromJson(Map<String, dynamic> json) => LoginResponse(
        accessToken: json['accessToken'] as String? ?? '',
        refreshToken: json['refreshToken'] as String? ?? '',
        requiresMfa: json['requiresMfa'] as bool? ?? false,
        mfaToken: json['mfaToken'] as String?,
        user: json['user'] != null
            ? UserDto.fromJson(json['user'] as Map<String, dynamic>)
            : null,
      );
}

class MfaVerifyRequest {
  const MfaVerifyRequest({required this.mfaToken, required this.code});

  final String mfaToken;
  final String code;

  Map<String, dynamic> toJson() => {
        'mfaToken': mfaToken,
        'code': code,
      };
}

class UserDto {
  const UserDto({
    required this.id,
    required this.email,
    required this.displayName,
    required this.role,
    required this.tenantId,
  });

  final String id;
  final String email;
  final String displayName;
  final String role;
  final String tenantId;

  factory UserDto.fromJson(Map<String, dynamic> json) => UserDto(
        id: json['id'] as String,
        email: json['email'] as String,
        displayName: json['displayName'] as String? ?? '',
        role: json['role'] as String,
        tenantId: json['tenantId'] as String,
      );
}
