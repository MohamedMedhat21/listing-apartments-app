import { PaginationMeta } from '../dto/response-envelope.dto';

// BR-11: totalPages is ceil(total / limit), and is 0 when total is 0 (never
// division producing NaN, and never a fractional page count).
export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}
