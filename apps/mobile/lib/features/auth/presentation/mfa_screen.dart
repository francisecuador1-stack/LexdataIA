import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/auth_provider.dart';

/// TOTP 6-digit code entry with auto-advance and paste support.
class MfaScreen extends ConsumerStatefulWidget {
  const MfaScreen({super.key});

  @override
  ConsumerState<MfaScreen> createState() => _MfaScreenState();
}

class _MfaScreenState extends ConsumerState<MfaScreen> {
  final _controllers = List.generate(6, (_) => TextEditingController());
  final _focusNodes = List.generate(6, (_) => FocusNode());

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  String get _code => _controllers.map((c) => c.text).join();

  void _onChanged(int index, String value) {
    // Handle paste of full code
    if (value.length > 1) {
      final digits = value.replaceAll(RegExp(r'[^0-9]'), '');
      for (var i = 0; i < 6 && i < digits.length; i++) {
        _controllers[i].text = digits[i];
      }
      if (digits.length >= 6) {
        _focusNodes[5].unfocus();
        _submit();
      }
      return;
    }

    if (value.isNotEmpty && index < 5) {
      _focusNodes[index + 1].requestFocus();
    }

    if (_code.length == 6) {
      _submit();
    }
  }

  void _onBackspace(int index) {
    if (_controllers[index].text.isEmpty && index > 0) {
      _controllers[index - 1].clear();
      _focusNodes[index - 1].requestFocus();
    }
  }

  Future<void> _submit() async {
    if (_code.length != 6) return;
    await ref.read(authStateProvider.notifier).verifyMfa(_code);
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final isLoading = authState.isLoading;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Verificación MFA'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => ref.read(authStateProvider.notifier).logout(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.security, size: 64, color: AppColors.blue600),
              const SizedBox(height: 24),
              const Text(
                'Código de verificación',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.slate700,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Ingresa el código de 6 dígitos de tu aplicación autenticadora',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: AppColors.slate500),
              ),
              const SizedBox(height: 32),

              // 6-digit input
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(6, (i) {
                  return Container(
                    width: 44,
                    margin: EdgeInsets.only(
                      right: i < 5 ? 8 : 0,
                      left: i == 3 ? 8 : 0, // Gap after 3rd digit
                    ),
                    child: KeyboardListener(
                      focusNode: FocusNode(),
                      onKeyEvent: (event) {
                        if (event is KeyDownEvent &&
                            event.logicalKey == LogicalKeyboardKey.backspace) {
                          _onBackspace(i);
                        }
                      },
                      child: TextField(
                        controller: _controllers[i],
                        focusNode: _focusNodes[i],
                        textAlign: TextAlign.center,
                        keyboardType: TextInputType.number,
                        maxLength: 1,
                        enabled: !isLoading,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                        ],
                        decoration: const InputDecoration(
                          counterText: '',
                          contentPadding: EdgeInsets.symmetric(vertical: 14),
                        ),
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                        onChanged: (v) => _onChanged(i, v),
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 24),

              if (isLoading) const CircularProgressIndicator(),

              if (authState.hasError) ...[
                const SizedBox(height: 16),
                Text(
                  authState.error.toString(),
                  style: const TextStyle(color: AppColors.red500, fontSize: 13),
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
