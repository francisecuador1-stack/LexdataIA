import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/normas/presentation/normas_screen.dart';
import '../../features/incidentes/presentation/incidentes_screen.dart';
import '../../features/aprobaciones/presentation/aprobaciones_screen.dart';
import '../../features/evidencias/presentation/evidencias_screen.dart';
import '../../features/capacitaciones/presentation/capacitaciones_screen.dart';
import '../../features/agente/presentation/agente_screen.dart';
import '../../features/portal_cliente/presentation/portal_cliente_screen.dart';
import 'dpo_shell.dart';
import 'cliente_shell.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/login',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final isLoggedIn = authState.valueOrNull?.isLoggedIn ?? false;
      final isLoginRoute = state.matchedLocation == '/login';

      if (!isLoggedIn && !isLoginRoute) return '/login';
      if (isLoggedIn && isLoginRoute) {
        final role = authState.valueOrNull?.role;
        if (role == UserRole.clienteAdmin ||
            role == UserRole.clienteColaborador) {
          return '/portal';
        }
        return '/dashboard';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (_, __) => const LoginScreen(),
      ),

      // DPO shell — bottom nav with DPO tabs
      ShellRoute(
        builder: (_, __, child) => DpoShell(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            name: 'dashboard',
            builder: (_, __) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/normas',
            name: 'normas',
            builder: (_, __) => const NormasScreen(),
          ),
          GoRoute(
            path: '/incidentes',
            name: 'incidentes',
            builder: (_, __) => const IncidentesScreen(),
          ),
          GoRoute(
            path: '/incidentes/:id',
            name: 'incidenteDetalle',
            builder: (_, state) => IncidentesScreen(
              incidenteId: state.pathParameters['id'],
            ),
          ),
          GoRoute(
            path: '/aprobaciones',
            name: 'aprobaciones',
            builder: (_, __) => const AprobacionesScreen(),
          ),
          GoRoute(
            path: '/evidencias',
            name: 'evidencias',
            builder: (_, __) => const EvidenciasScreen(),
          ),
          GoRoute(
            path: '/agente',
            name: 'agente',
            builder: (_, __) => const AgenteScreen(),
          ),
        ],
      ),

      // Client shell — bottom nav with client tabs
      ShellRoute(
        builder: (_, __, child) => ClienteShell(child: child),
        routes: [
          GoRoute(
            path: '/portal',
            name: 'portal',
            builder: (_, __) => const PortalClienteScreen(),
          ),
          GoRoute(
            path: '/portal/capacitaciones',
            name: 'portalCapacitaciones',
            builder: (_, __) => const CapacitacionesScreen(),
          ),
          GoRoute(
            path: '/portal/evidencias',
            name: 'portalEvidencias',
            builder: (_, __) => const EvidenciasScreen(),
          ),
          GoRoute(
            path: '/portal/agente',
            name: 'portalAgente',
            builder: (_, __) => const AgenteScreen(),
          ),
        ],
      ),
    ],
  );
});
