// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Spanish Castilian (`es`).
class AppLocalizationsEs extends AppLocalizations {
  AppLocalizationsEs([String locale = 'es']) : super(locale);

  @override
  String get appTitle => 'LEXDATA IA';

  @override
  String get sgpdpSubtitle => 'Sistema SGPDP · LOPDP Ecuador';

  @override
  String get login => 'Iniciar sesión';

  @override
  String get email => 'Correo electrónico';

  @override
  String get password => 'Contraseña';

  @override
  String get required => 'Requerido';

  @override
  String get invalidEmail => 'Correo inválido';

  @override
  String get recoverPassword => 'Recuperar contraseña';

  @override
  String get noConnection => 'Sin conexión a internet';

  @override
  String get retry => 'Reintentar';

  @override
  String get noData => 'No hay datos disponibles';

  @override
  String get hashCopied => 'Hash copiado al portapapeles';

  @override
  String get markAiDisclaimer =>
      'MARK AI propone y documenta; las aprobaciones, cierres y firmas son del DPO humano.';

  @override
  String get offlineMode => 'Modo sin conexión';

  @override
  String get expired => 'Vencido';

  @override
  String get urgent => 'URGENTE';

  @override
  String get pending => 'PENDIENTE';
}
