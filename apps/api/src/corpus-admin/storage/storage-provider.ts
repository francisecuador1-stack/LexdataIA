/**
 * Storage abstraction for corpus source documents.
 *
 * §B.1: Interface + local driver (dev) + supabase driver (prod).
 * Keys derived from SHA-256 hash — never from user-provided filenames.
 */

import { join, dirname } from 'path';
import { mkdir, writeFile, readFile, unlink, access } from 'fs/promises';

export interface StorageProvider {
  put(key: string, buffer: Buffer, mime: string): Promise<void>;
  get(key: string): Promise<Buffer>;
  getSignedUrl(key: string, ttlSeconds: number): Promise<string>;
  delete(key: string): Promise<void>;
}

/**
 * Local filesystem driver for development.
 * Stores files under CORPUS_STORAGE_PATH (default: .storage/corpus/).
 */
export class LocalStorageProvider implements StorageProvider {
  private readonly basePath: string;

  constructor() {
    this.basePath = process.env['CORPUS_STORAGE_PATH'] ?? join(process.cwd(), '.storage', 'corpus');
  }

  async put(key: string, buffer: Buffer, _mime: string): Promise<void> {
    const filePath = this.resolvePath(key);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);
  }

  async get(key: string): Promise<Buffer> {
    const filePath = this.resolvePath(key);
    return readFile(filePath);
  }

  async getSignedUrl(key: string, _ttlSeconds: number): Promise<string> {
    // Local driver: return a path that the API can serve directly
    // The actual serving is done by a dedicated endpoint
    return `/corpus/admin/documentos/archivo/contenido?key=${encodeURIComponent(key)}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);
    try {
      await access(filePath);
      await unlink(filePath);
    } catch {
      // File doesn't exist — ok
    }
  }

  private resolvePath(key: string): string {
    // Sanitize: prevent path traversal
    const safe = key.replace(/\.\./g, '').replace(/^\//, '');
    return join(this.basePath, safe);
  }
}

/**
 * Get the configured storage provider.
 */
export function createStorageProvider(): StorageProvider {
  const driver = process.env['CORPUS_STORAGE_DRIVER'] ?? 'local';

  if (driver === 'supabase') {
    // TODO: Implement Supabase Storage driver
    // For now fall through to local
    console.warn('Supabase storage driver not yet implemented — using local');
  }

  return new LocalStorageProvider();
}
