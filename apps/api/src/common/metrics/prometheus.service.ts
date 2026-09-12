import { Injectable, OnModuleInit } from '@nestjs/common';

// ---------------------------------------------------------------------------
// Prometheus metrics service for LEXDATA IA
//
// Exposes domain-specific counters, histograms, and gauges consumed by
// Grafana dashboards and alert rules.
//
// Depends on `prom-client`.  The `/metrics` endpoint is registered via
// the HealthModule or a dedicated MetricsController.
// ---------------------------------------------------------------------------

import * as client from 'prom-client';

@Injectable()
export class PrometheusService implements OnModuleInit {
  /** Global prom-client registry (default) */
  readonly registry = client.register;

  // -- HTTP ------------------------------------------------------------------

  /** Histogram: HTTP request duration by route and method */
  readonly httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'] as const,
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  });

  /** Counter: HTTP errors (focus on 5xx) */
  readonly httpErrorsTotal = new client.Counter({
    name: 'http_errors_total',
    help: 'Total HTTP error responses by status code',
    labelNames: ['status_code'] as const,
  });

  // -- BullMQ ----------------------------------------------------------------

  /** Gauge: current queue depth per queue name */
  readonly bullmqQueueDepth = new client.Gauge({
    name: 'bullmq_queue_depth',
    help: 'Number of jobs waiting in a BullMQ queue',
    labelNames: ['queue'] as const,
  });

  /** Histogram: BullMQ job processing duration per queue */
  readonly bullmqJobDuration = new client.Histogram({
    name: 'bullmq_job_duration_seconds',
    help: 'BullMQ job processing duration in seconds',
    labelNames: ['queue', 'job_name'] as const,
    buckets: [0.1, 0.5, 1, 5, 15, 30, 60, 120],
  });

  // -- Domain ----------------------------------------------------------------

  /** Counter: PDFs generated (worker) */
  readonly pdfGeneratedTotal = new client.Counter({
    name: 'pdf_generated_total',
    help: 'Total number of PDFs generated',
  });

  /** Counter: agent (MARK AI) tokens consumed per tenant */
  readonly agentTokensTotal = new client.Counter({
    name: 'agent_tokens_total',
    help: 'Total LLM tokens consumed by MARK AI',
    labelNames: ['tenant_id'] as const,
  });

  /** Counter: evidencias uploaded */
  readonly evidenciasUploadedTotal = new client.Counter({
    name: 'evidencias_uploaded_total',
    help: 'Total evidencias uploaded to the vault',
  });

  /**
   * Gauge: active incidentes by deadline band.
   * Labels: >48h, 24-48h, <24h, expired
   *
   * INV-9: The 72h clock is computed server-side. This gauge drives alerts
   * when incidentes approach or exceed the SPDP notification deadline.
   */
  readonly incidentesActivos = new client.Gauge({
    name: 'incidentes_activos',
    help: 'Number of active incidentes grouped by 72h deadline band',
    labelNames: ['deadline_band'] as const,
  });

  // -- Lifecycle -------------------------------------------------------------

  onModuleInit() {
    // Collect default Node.js process metrics (GC, event loop, memory)
    client.collectDefaultMetrics({ register: this.registry });
  }

  /** Serialize all metrics for the /metrics endpoint */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /** Content-type header for Prometheus scrape responses */
  get contentType(): string {
    return this.registry.contentType;
  }
}
