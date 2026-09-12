import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lexdata_mobile/features/auth/providers/auth_provider.dart';

void main() {
  group('AuthNotifier', () {
    late ProviderContainer container;

    setUp(() {
      container = ProviderContainer();
    });

    tearDown(() {
      container.dispose();
    });

    test('initial state is not logged in', () {
      final state = container.read(authStateProvider);
      expect(state.valueOrNull?.isLoggedIn, isFalse);
    });

    test('login sets isLoggedIn and role', () async {
      await container
          .read(authStateProvider.notifier)
          .login('dpo@lexdata.ec', 'password');

      final state = container.read(authStateProvider);
      expect(state.valueOrNull?.isLoggedIn, isTrue);
      expect(state.valueOrNull?.role, equals(UserRole.dpoHumano));
      expect(state.valueOrNull?.displayName, contains('Andreina'));
    });

    test('logout clears state', () async {
      await container
          .read(authStateProvider.notifier)
          .login('dpo@lexdata.ec', 'password');

      container.read(authStateProvider.notifier).logout();

      final state = container.read(authStateProvider);
      expect(state.valueOrNull?.isLoggedIn, isFalse);
      expect(state.valueOrNull?.role, isNull);
    });

    test('isDpo returns true for DPO roles', () async {
      await container
          .read(authStateProvider.notifier)
          .login('dpo@lexdata.ec', 'password');

      final state = container.read(authStateProvider);
      expect(state.valueOrNull?.isDpo, isTrue);
      expect(state.valueOrNull?.isClient, isFalse);
    });
  });

  group('UserRole', () {
    test('fromString parses all roles', () {
      expect(UserRole.fromString('DPO_HUMANO'), UserRole.dpoHumano);
      expect(UserRole.fromString('DPO_ANALISTA'), UserRole.dpoAnalista);
      expect(UserRole.fromString('CLIENTE_ADMIN'), UserRole.clienteAdmin);
      expect(UserRole.fromString('LEGAL_ADMIN'), UserRole.legalAdmin);
      expect(UserRole.fromString('SUPERADMIN'), UserRole.superadmin);
      expect(UserRole.fromString('MARK_AI'), UserRole.markAi);
    });
  });
}
