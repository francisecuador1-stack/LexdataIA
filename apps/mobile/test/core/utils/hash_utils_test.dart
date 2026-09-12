import 'package:flutter_test/flutter_test.dart';
import 'package:lexdata_mobile/core/utils/hash_utils.dart';

void main() {
  group('HashUtils', () {
    test('sha256String produces consistent output', () {
      const input = 'test data for hashing';
      final hash1 = HashUtils.sha256String(input);
      final hash2 = HashUtils.sha256String(input);
      expect(hash1, equals(hash2));
      expect(hash1.length, equals(64)); // SHA-256 = 64 hex chars
    });

    test('sha256String produces different output for different input', () {
      final hash1 = HashUtils.sha256String('input A');
      final hash2 = HashUtils.sha256String('input B');
      expect(hash1, isNot(equals(hash2)));
    });

    test('displayHash formats correctly', () {
      const hash =
          'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2';
      final display = HashUtils.displayHash(hash);
      expect(display, startsWith('sha256:'));
      expect(display, contains('...'));
      expect(display.length, lessThan(hash.length + 10));
    });

    test('displayHash handles short hashes', () {
      const hash = 'abc123';
      final display = HashUtils.displayHash(hash);
      expect(display, equals('sha256:abc123'));
    });
  });
}
