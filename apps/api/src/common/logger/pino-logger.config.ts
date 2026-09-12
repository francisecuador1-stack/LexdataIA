import { LoggerService } from '@nestjs/common';

// ---------------------------------------------------------------------------
// PII fields to redact from log payloads
// ---------------------------------------------------------------------------
const PII_KEYS = new Set([
  'email',
  'password',
  'token',
  'hash',
  'refresh_token',
  'access_token',
  'cedula',
  'telefono',
  'direccion',
  'authorization',
]);

const REDACTED = '[REDACTED]';

/**
 * Recursively strip PII fields from an object before it reaches the log
 * transport.  Works on plain objects and arrays; ignores primitives.
 */
function redactPii<T>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactPii) as unknown as T;
  }

  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (PII_KEYS.has(key.toLowerCase())) {
      clean[key] = REDACTED;
    } else {
      clean[key] = redactPii(value);
    }
  }
  return clean as T;
}

// ---------------------------------------------------------------------------
// Pino configuration factory
// ---------------------------------------------------------------------------

interface PinoLoggerOptions {
  /** Current NODE_ENV — controls pretty-print vs JSON */
  nodeEnv: string;
  /** Base log level (default: 'info') */
  level?: string;
}

/**
 * Build a pino configuration object suitable for `nestjs-pino`.
 *
 * Production  → JSON lines (machine-readable, stdout → log collector).
 * Development → pino-pretty (human-readable, coloured).
 */
export function buildPinoConfig(opts: PinoLoggerOptions) {
  const isProd = opts.nodeEnv === 'production';
  const level = opts.level ?? (isProd ? 'info' : 'debug');

  return {
    pinoHttp: {
      level,

      // Attach LEXDATA context fields to every log line
      customProps: (req: {
        headers?: Record<string, string | string[] | undefined>;
        id?: string;
        url?: string;
        method?: string;
      }) => ({
        request_id: req.id ?? req.headers?.['x-request-id'] ?? undefined,
        tenant_id: req.headers?.['x-tenant-id'] ?? undefined,
        user_id: req.headers?.['x-user-id'] ?? undefined,
        route: `${req.method ?? ''} ${req.url ?? ''}`,
      }),

      // Duration is added automatically by pino-http as `responseTime`

      // Serializers — strip PII from request / response bodies
      serializers: {
        req: (req: Record<string, unknown>) => redactPii(req),
        res: (res: Record<string, unknown>) => redactPii(res),
      },

      // Pretty-print only in dev
      ...(isProd
        ? {}
        : {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                singleLine: false,
                translateTime: 'SYS:HH:MM:ss.l',
              },
            },
          }),
    },
  };
}

// ---------------------------------------------------------------------------
// Lightweight NestJS LoggerService wrapper (no extra deps needed)
// ---------------------------------------------------------------------------

/**
 * Minimal structured logger that can be used as NestJS's built-in logger
 * replacement when `nestjs-pino` is not installed.  Applies PII redaction
 * and outputs JSON in production.
 */
export class PinoLoggerAdapter implements LoggerService {
  private readonly isProd: boolean;

  constructor(nodeEnv = process.env['NODE_ENV'] ?? 'development') {
    this.isProd = nodeEnv === 'production';
  }

  log(message: string, context?: string) {
    this.write('info', message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.write('error', message, context, trace);
  }

  warn(message: string, context?: string) {
    this.write('warn', message, context);
  }

  debug(message: string, context?: string) {
    this.write('debug', message, context);
  }

  verbose(message: string, context?: string) {
    this.write('debug', message, context);
  }

  private write(level: string, message: string, context?: string, trace?: string) {
    const entry = redactPii({
      level,
      timestamp: new Date().toISOString(),
      context: context ?? 'Application',
      message,
      ...(trace ? { trace } : {}),
    });

    if (this.isProd) {
      process.stdout.write(JSON.stringify(entry) + '\n');
    } else {
      const colour =
        level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[36m';
      const reset = '\x1b[0m';
      // eslint-disable-next-line no-console
      console.log(`${colour}[${entry.level}]${reset} [${entry.context}] ${entry.message}`);
      if (trace) {
        // eslint-disable-next-line no-console
        console.log(trace);
      }
    }
  }
}

export { redactPii };
