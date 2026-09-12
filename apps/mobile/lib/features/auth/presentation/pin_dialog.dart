import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_colors.dart';

/// PIN dialog for signature operations.
/// Returns the entered PIN or null if cancelled.
/// The PIN is transmitted to server for verification — never stored locally.
class PinDialog extends StatefulWidget {
  const PinDialog({
    this.title = 'PIN de firma',
    this.subtitle = 'Ingresa tu PIN de 6 dígitos para firmar',
    super.key,
  });

  final String title;
  final String subtitle;

  /// Show the dialog and return the entered PIN.
  static Future<String?> show(BuildContext context, {
    String title = 'PIN de firma',
    String subtitle = 'Ingresa tu PIN de 6 dígitos para firmar',
  }) {
    return showDialog<String>(
      context: context,
      barrierDismissible: false,
      builder: (_) => PinDialog(title: title, subtitle: subtitle),
    );
  }

  @override
  State<PinDialog> createState() => _PinDialogState();
}

class _PinDialogState extends State<PinDialog> {
  final _controllers = List.generate(6, (_) => TextEditingController());
  final _focusNodes = List.generate(6, (_) => FocusNode());
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNodes[0].requestFocus();
    });
  }

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

  String get _pin => _controllers.map((c) => c.text).join();

  void _onChanged(int index, String value) {
    setState(() => _hasError = false);

    if (value.isNotEmpty && index < 5) {
      _focusNodes[index + 1].requestFocus();
    }

    if (_pin.length == 6) {
      Navigator.of(context).pop(_pin);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.title,
          style: const TextStyle(fontWeight: FontWeight.w700)),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(widget.subtitle,
              style: const TextStyle(fontSize: 14, color: AppColors.slate500)),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(6, (i) {
              return Container(
                width: 40,
                margin: EdgeInsets.only(right: i < 5 ? 6 : 0),
                child: TextField(
                  controller: _controllers[i],
                  focusNode: _focusNodes[i],
                  textAlign: TextAlign.center,
                  obscureText: true,
                  keyboardType: TextInputType.number,
                  maxLength: 1,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                  ],
                  decoration: InputDecoration(
                    counterText: '',
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: _hasError ? AppColors.red500 : AppColors.slate200,
                      ),
                    ),
                  ),
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                  onChanged: (v) => _onChanged(i, v),
                ),
              );
            }),
          ),
          if (_hasError) ...[
            const SizedBox(height: 12),
            const Text('PIN incorrecto',
                style: TextStyle(color: AppColors.red500, fontSize: 13)),
          ],
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(null),
          child: const Text('Cancelar'),
        ),
      ],
    );
  }
}
