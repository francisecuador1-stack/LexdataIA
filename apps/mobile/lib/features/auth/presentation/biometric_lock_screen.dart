import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/auth_provider.dart';

/// Shown when the app resumes after being locked (inactivity or cold start
/// with stored session). Biometric unlock only — does not replace initial login.
class BiometricLockScreen extends ConsumerStatefulWidget {
  const BiometricLockScreen({super.key});

  @override
  ConsumerState<BiometricLockScreen> createState() =>
      _BiometricLockScreenState();
}

class _BiometricLockScreenState extends ConsumerState<BiometricLockScreen> {
  final _localAuth = LocalAuthentication();
  bool _isBiometricAvailable = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _checkBiometrics();
  }

  Future<void> _checkBiometrics() async {
    try {
      _isBiometricAvailable = await _localAuth.canCheckBiometrics ||
          await _localAuth.isDeviceSupported();
      if (_isBiometricAvailable) {
        _authenticate();
      }
    } catch (_) {
      _isBiometricAvailable = false;
    }
    if (mounted) setState(() {});
  }

  Future<void> _authenticate() async {
    try {
      final authenticated = await _localAuth.authenticate(
        localizedReason: 'Desbloquea LEXDATA IA con tu huella o rostro',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );

      if (authenticated) {
        ref.read(authStateProvider.notifier).reopenWithBiometrics();
      } else {
        setState(() => _error = 'Autenticación cancelada');
      }
    } catch (e) {
      setState(() => _error = 'Error de biometría: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.navy900,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Center(
                    child: Text(
                      'LX',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'LEXDATA IA',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppColors.navy900,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Sesión bloqueada',
                  style: TextStyle(fontSize: 14, color: AppColors.slate500),
                ),
                const SizedBox(height: 32),

                if (_isBiometricAvailable)
                  ElevatedButton.icon(
                    onPressed: _authenticate,
                    icon: const Icon(Icons.fingerprint, size: 24),
                    label: const Text('Desbloquear con biometría'),
                  )
                else
                  const Text(
                    'Biometría no disponible',
                    style: TextStyle(color: AppColors.slate500),
                  ),

                const SizedBox(height: 16),
                TextButton(
                  onPressed: () =>
                      ref.read(authStateProvider.notifier).logout(),
                  child: const Text('Cerrar sesión e ingresar con contraseña'),
                ),

                if (_error != null) ...[
                  const SizedBox(height: 16),
                  Text(
                    _error!,
                    style: const TextStyle(color: AppColors.red500, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
