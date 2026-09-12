import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart';

import 'core/theme/app_theme.dart';
import 'core/network/flavor_config.dart';
import 'core/router/app_router.dart';

/// Flavor is injected via --dart-define=FLAVOR=dev|staging|prod
const _flavorName = String.fromEnvironment('FLAVOR', defaultValue: 'dev');

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  Intl.defaultLocale = 'es_EC';

  final config = FlavorConfig.fromString(_flavorName);

  runApp(
    ProviderScope(
      overrides: [
        flavorConfigProvider.overrideWithValue(config),
      ],
      child: const LexdataApp(),
    ),
  );
}

/// Riverpod provider for flavor config.
final flavorConfigProvider = Provider<FlavorConfig>((ref) => FlavorConfig.dev);

class LexdataApp extends ConsumerWidget {
  const LexdataApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'LEXDATA IA',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.light,
      locale: const Locale('es', 'EC'),
      supportedLocales: const [Locale('es', 'EC')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: router,
    );
  }
}
