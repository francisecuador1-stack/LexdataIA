import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';


enum UserRole {
  superadmin,
  legalAdmin,
  dpoHumano,
  dpoAnalista,
  clienteAdmin,
  clienteColaborador,
  auditorExterno,
  markAi;

  static UserRole fromString(String s) => switch (s) {
        'SUPERADMIN' => superadmin,
        'LEGAL_ADMIN' => legalAdmin,
        'DPO_HUMANO' => dpoHumano,
        'DPO_ANALISTA' => dpoAnalista,
        'CLIENTE_ADMIN' => clienteAdmin,
        'CLIENTE_COLABORADOR' => clienteColaborador,
        'AUDITOR_EXTERNO' => auditorExterno,
        'MARK_AI' => markAi,
        _ => dpoHumano,
      };
}

class AuthState {
  const AuthState({
    this.isLoggedIn = false,
    this.role,
    this.userId,
    this.tenantId,
    this.displayName,
    this.email,
    this.requiresMfa = false,
    this.mfaToken,
  });

  final bool isLoggedIn;
  final UserRole? role;
  final String? userId;
  final String? tenantId;
  final String? displayName;
  final String? email;
  final bool requiresMfa;
  final String? mfaToken;

  bool get isDpo =>
      role == UserRole.dpoHumano || role == UserRole.dpoAnalista;

  bool get isClient =>
      role == UserRole.clienteAdmin || role == UserRole.clienteColaborador;

  AuthState copyWith({
    bool? isLoggedIn,
    UserRole? role,
    String? userId,
    String? tenantId,
    String? displayName,
    String? email,
    bool? requiresMfa,
    String? mfaToken,
  }) =>
      AuthState(
        isLoggedIn: isLoggedIn ?? this.isLoggedIn,
        role: role ?? this.role,
        userId: userId ?? this.userId,
        tenantId: tenantId ?? this.tenantId,
        displayName: displayName ?? this.displayName,
        email: email ?? this.email,
        requiresMfa: requiresMfa ?? this.requiresMfa,
        mfaToken: mfaToken ?? this.mfaToken,
      );
}

class AuthNotifier extends StateNotifier<AsyncValue<AuthState>> {
  AuthNotifier() : super(const AsyncData(AuthState()));

  Timer? _inactivityTimer;
  static const _inactivityDuration = Duration(minutes: 15);

  /// Login with email + password. May return requiresMfa=true.
  Future<void> login(String email, String password) async {
    state = const AsyncLoading();

    // Simulate API call — will be connected to AuthRepository
    await Future.delayed(const Duration(seconds: 1));

    _completeLogin(
      userId: 'usr_001',
      email: email,
      displayName: 'Dra. Andreina Almeida',
      role: UserRole.dpoHumano,
      tenantId: 'tenant_c1',
    );
  }

  /// Verify TOTP code for MFA.
  Future<void> verifyMfa(String code) async {
    final current = state.valueOrNull;
    if (current == null) return;

    state = const AsyncLoading();
    await Future.delayed(const Duration(milliseconds: 800));

    if (code.length != 6) {
      state = AsyncError('Código MFA inválido', StackTrace.current);
      return;
    }

    _completeLogin(
      userId: 'usr_001',
      email: current.email ?? '',
      displayName: 'Dra. Andreina Almeida',
      role: UserRole.dpoHumano,
      tenantId: 'tenant_c1',
    );
  }

  /// Biometric reopen — only allowed if session exists.
  Future<void> reopenWithBiometrics() async {
    state = const AsyncLoading();
    await Future.delayed(const Duration(milliseconds: 500));

    _completeLogin(
      userId: 'usr_001',
      email: 'dpo@lexdata.ec',
      displayName: 'Dra. Andreina Almeida',
      role: UserRole.dpoHumano,
      tenantId: 'tenant_c1',
    );
  }

  void _completeLogin({
    required String userId,
    required String email,
    required String displayName,
    required UserRole role,
    required String tenantId,
  }) {
    state = AsyncData(AuthState(
      isLoggedIn: true,
      userId: userId,
      email: email,
      displayName: displayName,
      role: role,
      tenantId: tenantId,
    ));
    _resetInactivityTimer();
  }

  /// Reset inactivity timer — call on user interaction.
  void resetInactivity() => _resetInactivityTimer();

  void _resetInactivityTimer() {
    _inactivityTimer?.cancel();
    _inactivityTimer = Timer(_inactivityDuration, _onInactivityTimeout);
  }

  void _onInactivityTimeout() {
    // Lock session but keep tokens for biometric reopen
    final current = state.valueOrNull;
    if (current != null && current.isLoggedIn) {
      state = const AsyncData(AuthState());
    }
  }

  void logout() {
    _inactivityTimer?.cancel();
    state = const AsyncData(AuthState());
  }

  @override
  void dispose() {
    _inactivityTimer?.cancel();
    super.dispose();
  }
}

final authStateProvider =
    StateNotifierProvider<AuthNotifier, AsyncValue<AuthState>>(
  (ref) => AuthNotifier(),
);
