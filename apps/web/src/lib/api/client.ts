import type {
  ApartmentDetail,
  ApartmentListItem,
  ApartmentListQuery,
  ApiErrorResponse,
  CollectionResponse,
  CreateApartmentRequest,
  DeveloperSummary,
  LoginRequest,
  LoginResponse,
  PaginatedResponse,
  ProjectSummary,
  UpdateApartmentRequest,
  UserSummary,
} from '@apartments/shared';

type FetchImplementation = typeof fetch;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!isRecord(value)) {
    return false;
  }

  const message = value.message;
  const hasValidMessage =
    typeof message === 'string' ||
    (Array.isArray(message) && message.every((item) => typeof item === 'string'));

  return (
    typeof value.statusCode === 'number' &&
    hasValidMessage &&
    typeof value.error === 'string' &&
    typeof value.timestamp === 'string' &&
    typeof value.path === 'string'
  );
}

function messageFromBody(body: ApiErrorResponse): string {
  return Array.isArray(body.message) ? body.message.join(', ') : body.message;
}

async function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return null;
  }

  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function buildApartmentQuery(query: ApartmentListQuery): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }

  const serialized = searchParams.toString();
  return serialized.length > 0 ? `?${serialized}` : '';
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details: ApiErrorResponse | null = null,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor(
    baseUrl: string,
    // Bound to globalThis: native `fetch` requires its receiver to be the
    // global scope, but this method is invoked as `this.fetchImplementation(...)`,
    // whose receiver is the ApiClient instance and throws "Illegal invocation"
    // unless the default is explicitly bound.
    private readonly fetchImplementation: FetchImplementation = fetch.bind(globalThis),
  ) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(baseUrl);
    } catch {
      throw new Error(`Invalid API base URL: "${baseUrl}"`);
    }

    this.baseUrl = parsedUrl.toString().replace(/\/$/, '');
  }

  listApartments(query: ApartmentListQuery = {}): Promise<PaginatedResponse<ApartmentListItem>> {
    return this.request(`/apartments${buildApartmentQuery(query)}`);
  }

  getApartment(id: string): Promise<ApartmentDetail> {
    return this.request(`/apartments/${encodeURIComponent(id)}`);
  }

  listProjects(): Promise<CollectionResponse<ProjectSummary>> {
    return this.request('/projects');
  }

  listDevelopers(): Promise<CollectionResponse<DeveloperSummary>> {
    return this.request('/developers');
  }

  login(body: LoginRequest): Promise<LoginResponse> {
    return this.request('/auth/login', { method: 'POST', body });
  }

  getCurrentUser(token: string): Promise<UserSummary> {
    return this.request('/auth/me', { token });
  }

  createApartment(body: CreateApartmentRequest, token: string): Promise<ApartmentDetail> {
    return this.request('/apartments', { method: 'POST', body, token });
  }

  updateApartment(
    id: string,
    body: UpdateApartmentRequest,
    token: string,
  ): Promise<ApartmentDetail> {
    return this.request(`/apartments/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body,
      token,
    });
  }

  async deleteApartment(id: string, token: string): Promise<void> {
    await this.request<void>(`/apartments/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      token,
    });
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers({ Accept: 'application/json' });
    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }
    if (options.token) {
      headers.set('Authorization', `Bearer ${options.token}`);
    }

    let response: Response;
    try {
      response = await this.fetchImplementation(`${this.baseUrl}${path}`, {
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: 'no-store',
      });
    } catch (cause) {
      throw new ApiError('Unable to reach the apartments API.', 0, null, { cause });
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const body = await readJson(response);
    if (!response.ok) {
      if (isApiErrorResponse(body)) {
        throw new ApiError(messageFromBody(body), response.status, body);
      }

      throw new ApiError(`The apartments API returned ${response.status}.`, response.status);
    }

    if (body === null) {
      throw new ApiError('The apartments API returned an invalid response.', response.status);
    }

    return body as T;
  }
}
