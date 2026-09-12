import { z } from 'zod';

/** Paginated response wrapper */
export interface Paginated<T> {
  data: T[];
  total: number;
  cursor?: string;
  hasMore: boolean;
}

/** Standard API error */
export const ApiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  timestamp: z.string(),
  requestId: z.string().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

/** Pagination query */
export const PaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  orden: z.enum(['asc', 'desc']).default('desc'),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
