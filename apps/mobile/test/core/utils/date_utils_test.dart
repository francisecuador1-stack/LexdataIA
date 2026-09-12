import 'package:flutter_test/flutter_test.dart';
import 'package:intl/intl.dart';
import 'package:lexdata_mobile/core/utils/date_utils.dart';

void main() {
  setUpAll(() {
    Intl.defaultLocale = 'es_EC';
  });

  group('AppDateUtils', () {
    test('toLocal applies UTC-5 offset', () {
      final utc = DateTime.utc(2026, 9, 12, 20, 30); // 20:30 UTC
      final local = AppDateUtils.toLocal(utc);
      expect(local.hour, equals(15)); // 15:30 ECT
      expect(local.minute, equals(30));
    });

    test('formatRemaining returns "Vencido" for negative duration', () {
      expect(
        AppDateUtils.formatRemaining(const Duration(hours: -5)),
        equals('Vencido'),
      );
    });

    test('formatRemaining formats hours correctly', () {
      final result = AppDateUtils.formatRemaining(const Duration(hours: 22));
      expect(result, equals('22h 0m'));
    });

    test('formatRemaining formats days + hours', () {
      final result = AppDateUtils.formatRemaining(
          const Duration(days: 2, hours: 5));
      expect(result, equals('2d 5h'));
    });
  });
}
