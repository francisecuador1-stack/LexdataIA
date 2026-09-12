// ---------------------------------------------------------------------------
// OpenTelemetry SDK bootstrap for LEXDATA IA API
//
// This file MUST be loaded before the NestJS application starts.
// In production, use the Node.js --require flag:
//   node --require ./dist/common/tracing/otel.config.js dist/main.js
//
// Traces long-running flows:
//   - Agent chat (MARK AI conversations)
//   - PDF generation (worker)
//   - Corpus ingestion (embeddings pipeline)
// ---------------------------------------------------------------------------

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
} from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';

const env = process.env['NODE_ENV'] ?? 'development';
const otlpEndpoint =
  process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] ?? 'http://localhost:4318';

// ---------------------------------------------------------------------------
// Resource: service identity
// ---------------------------------------------------------------------------
const resource = new Resource({
  [ATTR_SERVICE_NAME]: 'lexdata-api',
  [ATTR_SERVICE_VERSION]: process.env['APP_VERSION'] ?? '0.0.0',
  [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env,
});

// ---------------------------------------------------------------------------
// Exporter
// ---------------------------------------------------------------------------
const traceExporter = new OTLPTraceExporter({
  url: `${otlpEndpoint}/v1/traces`,
});

// ---------------------------------------------------------------------------
// SDK
// ---------------------------------------------------------------------------
const sdk = new NodeSDK({
  resource,
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
  instrumentations: [
    new HttpInstrumentation({
      // Ignore health-check noise
      ignoreIncomingRequestHook: (req) =>
        req.url === '/health' || req.url === '/metrics',
    }),
    new ExpressInstrumentation(),
    new PrismaInstrumentation(),
  ],
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
sdk.start();

// Graceful shutdown — flush remaining spans
const shutdown = async () => {
  try {
    await sdk.shutdown();
  } catch {
    // Best-effort; do not crash on shutdown failure
  }
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { sdk };
