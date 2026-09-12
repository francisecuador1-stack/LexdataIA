// ---------------------------------------------------------------------------
// Sentry SDK configuration for LEXDATA IA API
//
// Priorities:
//   1. Release tracking with sourcemaps
//   2. PII stripping — never send email, tenant data, or credentials
//   3. Performance monitoring (sample rate adjustable per env)
// ---------------------------------------------------------------------------

import * as Sentry from '@sentry/node';

const env = process.env['NODE_ENV'] ?? 'development';
const isProd = env === 'production';

// ---------------------------------------------------------------------------
// PII fields to scrub from breadcrumbs and event payloads
// ---------------------------------------------------------------------------
const PII_FIELDS = [
  'email',
  'password',
  'token',
  'access_token',
  'refresh_token',
  'cedula',
  'telefono',
  'direccion',
  'authorization',
  'x-tenant-id',
  'tenant_id',
];

/**
 * Recursively remove PII keys from an arbitrary object.
 */
function stripPii(data: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (PII_FIELDS.includes(key.toLowerCase())) {
      clean[key] = '[Filtered]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      clean[key] = stripPii(value as Record<string, unknown>);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

export function initSentry(): void {
  if (!process.env['SENTRY_DSN']) {
    // eslint-disable-next-line no-console
    console.warn('[Sentry] SENTRY_DSN not set — Sentry disabled');
    return;
  }

  Sentry.init({
    dsn: process.env['SENTRY_DSN'],
    environment: env,
    release: process.env['SENTRY_RELEASE'] ?? `lexdata-api@${process.env['APP_VERSION'] ?? '0.0.0'}`,

    // Performance
    tracesSampleRate: isProd ? 0.2 : 1.0,

    // PII: strip sensitive data globally
    sendDefaultPii: false,

    beforeSend(event) {
      // Strip PII from extra context and breadcrumb data
      if (event.extra) {
        event.extra = stripPii(event.extra as Record<string, unknown>);
      }
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((bc) => ({
          ...bc,
          data: bc.data ? stripPii(bc.data as Record<string, unknown>) : bc.data,
        }));
      }
      // Remove user email if accidentally attached
      if (event.user) {
        delete event.user.email;
        delete (event.user as Record<string, unknown>)['tenant_id'];
      }
      return event;
    },

    beforeBreadcrumb(breadcrumb) {
      // Drop breadcrumbs that might contain tenant-specific data
      if (breadcrumb.data) {
        breadcrumb.data = stripPii(breadcrumb.data as Record<string, unknown>);
      }
      return breadcrumb;
    },

    // Integrations
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
    ],

    // Sourcemaps — uploaded during CI/CD build step
    // `sentry-cli sourcemaps upload --release=<release> dist/`
  });
}

export { Sentry };
