import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// ── Queue: Corpus ingestion (embeddings for semantic search) ──
const corpusWorker = new Worker(
  'corpus-ingestion',
  async (job) => {
    console.log(`[corpus-ingestion] Processing: ${job.name}`, job.data);
    // TODO: Ingest legal corpus, generate embeddings with pgvector
  },
  { connection },
);

// ── Queue: PDF generation (reports, certificates) ──
const pdfWorker = new Worker(
  'pdf-generation',
  async (job) => {
    console.log(`[pdf-generation] Processing: ${job.name}`, job.data);
    // TODO: Generate PDF with Playwright/Chromium
  },
  { connection },
);

// ── Queue: 72h alert monitor (INV-9, RN-602) ──
const alertWorker = new Worker(
  'alert-72h',
  async (job) => {
    console.log(`[alert-72h] Processing: ${job.name}`, job.data);
    // TODO: Check incidentes where fechaMaxReporteSPDP is approaching
    // and notificadoSPDP is false. Alert DPO.
  },
  { connection },
);

// ── Queue: Scheduled reminders ──
const reminderWorker = new Worker(
  'reminders',
  async (job) => {
    console.log(`[reminders] Processing: ${job.name}`, job.data);
    // TODO: ARCO deadlines, audit schedules, training reminders
  },
  { connection },
);

console.log('LEXDATA Worker started — queues: corpus-ingestion, pdf-generation, alert-72h, reminders');

// Graceful shutdown
process.on('SIGTERM', async () => {
  await Promise.all([
    corpusWorker.close(),
    pdfWorker.close(),
    alertWorker.close(),
    reminderWorker.close(),
  ]);
  await connection.quit();
  process.exit(0);
});
