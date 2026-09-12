import 'package:intl/intl.dart';

/// Date formatting for es_EC locale, presentation in America/Guayaquil,
/// storage always in UTC.
abstract final class AppDateUtils {
  static final _guayaquilOffset = const Duration(hours: -5);

  static final _dateFormat = DateFormat('dd MMM yyyy', 'es_EC');
  static final _dateTimeFormat = DateFormat('dd MMM yyyy HH:mm', 'es_EC');
  static final _timeFormat = DateFormat('HH:mm', 'es_EC');

  /// Convert UTC to Guayaquil display time (UTC-5).
  static DateTime toLocal(DateTime utc) => utc.toUtc().add(_guayaquilOffset);

  /// Format date as "12 sep 2026".
  static String formatDate(DateTime utc) => _dateFormat.format(toLocal(utc));

  /// Format date+time as "12 sep 2026 14:30".
  static String formatDateTime(DateTime utc) =>
      _dateTimeFormat.format(toLocal(utc));

  /// Format time only as "14:30".
  static String formatTime(DateTime utc) => _timeFormat.format(toLocal(utc));

  /// Remaining duration as human-readable string.
  static String formatRemaining(Duration d) {
    if (d.isNegative) return 'Vencido';
    if (d.inDays > 0) return '${d.inDays}d ${d.inHours.remainder(24)}h';
    if (d.inHours > 0) return '${d.inHours}h ${d.inMinutes.remainder(60)}m';
    return '${d.inMinutes}m';
  }
}
