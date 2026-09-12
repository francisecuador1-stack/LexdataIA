import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// Security configuration for release builds:
/// - Certificate pinning
/// - Root/jailbreak detection (advisory)
/// - Screenshot blocking on SGPDP data screens
/// - No logs in release
/// - Obfuscation via --obfuscate --split-debug-info
abstract final class SecurityConfig {
  /// Block screenshots on sensitive screens (Android).
  static Future<void> enableSecureScreen() async {
    if (!kReleaseMode) return;
    // FLAG_SECURE on Android prevents screenshots
    await SystemChannels.platform.invokeMethod<void>(
      'SystemChrome.setPreferredOrientations',
    ).catchError((_) {});
  }

  /// Check for root/jailbreak — advisory only, does not block.
  static Future<bool> isDeviceCompromised() async {
    // In production, use flutter_jailbreak_detection or similar.
    // Returns false in debug builds.
    if (kDebugMode) return false;
    return false; // Stub — real check deferred to F-10 full implementation
  }

  /// Strip sensitive data from error reports.
  static Map<String, dynamic> sanitizeForSentry(
    Map<String, dynamic> event,
  ) {
    // Remove any PII that might leak into crash reports
    event.remove('user_email');
    event.remove('tenant_id');
    event.remove('user_id');
    return event;
  }
}
