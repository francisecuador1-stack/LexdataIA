import 'package:intl/intl.dart';

/// Number formatting for es_EC locale.
abstract final class AppNumberUtils {
  static final _decimal = NumberFormat('#,##0.0', 'es_EC');
  static final _integer = NumberFormat('#,##0', 'es_EC');
  static final _percent = NumberFormat('#,##0', 'es_EC');

  static String formatDecimal(double value) => _decimal.format(value);
  static String formatInteger(int value) => _integer.format(value);
  static String formatPercent(double value) => '${_percent.format(value)}%';
}
