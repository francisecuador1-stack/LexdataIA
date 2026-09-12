enum Flavor { dev, staging, prod }

class FlavorConfig {
  const FlavorConfig({
    required this.flavor,
    required this.apiBaseUrl,
  });

  final Flavor flavor;
  final String apiBaseUrl;

  static const dev = FlavorConfig(
    flavor: Flavor.dev,
    apiBaseUrl: 'http://10.0.2.2:3000/api', // Android emulator → host
  );

  static const staging = FlavorConfig(
    flavor: Flavor.staging,
    apiBaseUrl: 'https://staging-api.lexdata.ec/api',
  );

  static const prod = FlavorConfig(
    flavor: Flavor.prod,
    apiBaseUrl: 'https://api.lexdata.ec/api',
  );

  static FlavorConfig fromString(String name) => switch (name) {
        'staging' => staging,
        'prod' || 'production' => prod,
        _ => dev,
      };
}
