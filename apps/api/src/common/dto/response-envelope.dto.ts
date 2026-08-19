/**
 * Response envelopes from docs/requirements.md section 7.1.
 *
 * `GET /apartments` is paginated, so it uses `PaginatedResponse` (`data` +
 * pagination `meta`). `GET /projects` and `GET /developers` are explicitly
 * "not paginated" (7.7, 7.8), so they use the plain `CollectionResponse`
 * (`data` only, no `meta` — there is no page/limit/total to report).
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CollectionResponse<T> {
  data: T[];
}
