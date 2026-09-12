import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'empty_state.dart';
import 'error_view.dart';

/// Generic handler for AsyncValue — resolves loading/error/empty states
/// with the shared widgets, keeping feature screens clean.
class AsyncValueWidget<T> extends StatelessWidget {
  const AsyncValueWidget({
    required this.value,
    required this.data,
    this.emptyCheck,
    this.emptyMessage = 'No hay datos disponibles',
    this.onRetry,
    super.key,
  });

  final AsyncValue<T> value;
  final Widget Function(T data) data;
  final bool Function(T data)? emptyCheck;
  final String emptyMessage;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return value.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, _) => ErrorView(
        message: err.toString(),
        onRetry: onRetry,
      ),
      data: (d) {
        if (emptyCheck != null && emptyCheck!(d)) {
          return EmptyState(message: emptyMessage);
        }
        return data(d);
      },
    );
  }
}
