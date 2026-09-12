import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_colors.dart';

/// Bottom navigation shell for client users.
class ClienteShell extends StatelessWidget {
  const ClienteShell({required this.child, super.key});

  final Widget child;

  static const _tabs = [
    _Tab('/portal', Icons.home_outlined, Icons.home, 'Inicio'),
    _Tab('/portal/capacitaciones', Icons.school_outlined, Icons.school,
        'Cursos'),
    _Tab('/portal/evidencias', Icons.upload_file_outlined, Icons.upload_file,
        'Evidencias'),
    _Tab('/portal/agente', Icons.smart_toy_outlined, Icons.smart_toy,
        'Asistente'),
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    for (var i = 0; i < _tabs.length; i++) {
      if (location == _tabs[i].path) return i;
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
