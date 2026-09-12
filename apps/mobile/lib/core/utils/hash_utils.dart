import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:crypto/crypto.dart';

/// SHA-256 utilities for evidence integrity.
abstract final class HashUtils {
  /// Compute SHA-256 of a byte array.
  static String sha256String(String input) {
    final bytes = utf8.encode(input);
    return sha256.convert(bytes).toString();
  }

  /// Compute SHA-256 of bytes.
  static String sha256Bytes(Uint8List bytes) {
    return sha256.convert(bytes).toString();
  }

  /// Stream SHA-256 of a file without loading it entirely in memory.
  static Future<String> sha256File(File file) async {
    final digestSink = _DigestSink();
    final input = sha256.startChunkedConversion(digestSink);
    await for (final chunk in file.openRead()) {
      input.add(chunk);
    }
    input.close();
    return digestSink.value.toString();
  }

  /// Format hash for display: "sha256:abcd...ef12".
  static String displayHash(String hash) {
    if (hash.length <= 16) return 'sha256:$hash';
    return 'sha256:${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}';
  }
}

/// Simple sink that captures the single Digest output.
class _DigestSink implements Sink<Digest> {
  late Digest value;

  @override
  void add(Digest data) => value = data;

  @override
  void close() {}
}
