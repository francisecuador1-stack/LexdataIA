import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:lexdata_mobile/main.dart';

void main() {
  testWidgets('App shows login screen on startup', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(child: LexdataApp()),
    );
    await tester.pumpAndSettle();

    // Login screen should be visible
    expect(find.text('LEXDATA IA'), findsOneWidget);
    expect(find.text('Iniciar sesión'), findsOneWidget);
    expect(find.text('Correo electrónico'), findsOneWidget);
  });
}
