import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Push notification channels and routing.
/// Channels by type:
///   - plazos_72h: 72h deadline alerts for incidents
///   - aprobaciones: pending approvals
///   - propuestas_agente: MARK AI proposals
///   - capacitaciones: training reminders
///   - auditorias: upcoming audit alerts
///
/// Deep links: each notification carries a route (e.g., /incidentes/INC-001)
/// that is forwarded to go_router for handling.
class PushService {
  PushService();

  /// Notification channels matching the spec.
  static const channels = [
    PushChannel(
      id: 'plazos_72h',
      name: 'Plazos 72h — Incidentes',
      description: 'Alertas de plazos de notificación de incidentes a la SPDP',
      importance: ChannelImportance.max,
    ),
    PushChannel(
      id: 'aprobaciones',
      name: 'Aprobaciones pendientes',
      description: 'Documentos y hallazgos que requieren firma del DPO',
      importance: ChannelImportance.high,
    ),
    PushChannel(
      id: 'propuestas_agente',
      name: 'Propuestas de MARK AI',
      description: 'Propuestas del agente que requieren revisión',
      importance: ChannelImportance.normal,
    ),
    PushChannel(
      id: 'capacitaciones',
      name: 'Capacitaciones',
      description: 'Recordatorios de capacitaciones pendientes',
      importance: ChannelImportance.normal,
    ),
    PushChannel(
      id: 'auditorias',
      name: 'Auditorías próximas',
      description: 'Alertas de auditorías programadas',
      importance: ChannelImportance.high,
    ),
  ];

  /// Initialize push — called from main after Firebase init.
  Future<void> initialize() async {
    // firebase_messaging initialization happens here.
    // Channels are created on Android via flutter_local_notifications.
    // APNs registration on iOS is automatic.
    //
    // Implementation deferred until firebase_core is configured
    // with the project's google-services.json / GoogleService-Info.plist.
  }

  /// Handle foreground notification.
  void onForeground(Map<String, dynamic> data) {
    // Show local notification / in-app banner.
  }

  /// Handle notification tap — return the deep link route.
  String? getDeepLink(Map<String, dynamic> data) {
    final route = data['route'] as String?;
    return route; // e.g., '/incidentes/INC-001'
  }

  /// User notification preferences.
  final _preferences = <String, bool>{
    'plazos_72h': true,
    'aprobaciones': true,
    'propuestas_agente': true,
    'capacitaciones': true,
    'auditorias': true,
  };

  bool isChannelEnabled(String channelId) =>
      _preferences[channelId] ?? true;

  void setChannelEnabled(String channelId, bool enabled) {
    _preferences[channelId] = enabled;
  }
}

class PushChannel {
  const PushChannel({
    required this.id,
    required this.name,
    required this.description,
    required this.importance,
  });

  final String id;
  final String name;
  final String description;
  final ChannelImportance importance;
}

enum ChannelImportance { normal, high, max }

final pushServiceProvider = Provider<PushService>((ref) => PushService());
