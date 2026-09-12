import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_colors.dart';

/// Bottom navigation shell for DPO users.
class DpoShell extends StatelessWidget {
  const DpoShell({required this.child, super.key});

  final Widget child;

  static const _tabs = [
    _Tab('/dashboard', Icons.dashboard_outlined, Icons.dashboard, 'Inicio'),
    _Tab('/normas', Icons.menu_book_outlined, Icons.menu_book, 'Normas'),
    _Tab('/incidentes', Icons.warning_amber_outlined, Icons.warning_amber,
        'Incidentes'),
    _Tab('/aprobaciones', Icons.task_alt_outlined, Icons.task_alt,
        'Aprobar'),
    _Tab('/agente', Icons.smart_toy_outlined, Icons.smart_toy, 'MARK AI'),
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    for (var i = 0; i < _tabs.length; i++) {
      if (location.startsWith(_tabs[i].path)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final idx = _currentIndex(context);
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: idx,
        onDestinationSelected: (i) => context.go(_tabs[i].path),
        backgroundColor: AppColors.card,
        indicatorColor: AppColors.blue50,
        destinations: [
          for (final t in _tabs)
            NavigationDestination(
              icon: Icon(t.icon),
              selectedIcon: Icon(t.selectedIcon, color: AppColors.blue600),
              label: t.label,
            ),
        ],
      ),
    );
  }
}

class _Tab {
  const _Tab(this.path, this.icon, this.selectedIcon, this.label);

  final String path;
  final IconData icon;
  final IconData selectedIcon;
  final String label;
}
