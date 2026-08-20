import { ApartmentSortOption, ApartmentStatus, type ApiErrorResponse } from '@apartments/shared';
import { describe, expect, it, vi } from 'vitest';

import { ApiClient, ApiError } from './client';

function jsonResponse(body: unknown, init: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'content-type': 'application/json' },
  });
}

describe('ApiClient', () => {
  it('serializes apartment filters and returns the shared response contract', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          data: [],
          meta: { page: 2, limit: 12, total: 0, totalPages: 0 },
        },
        { status: 200 },
      ),
    );
    const client = new ApiClient('http://api:4000/api/v1/', fetchMock);

    const result = await client.listApartments({
      q: 'Nile',
      status: ApartmentStatus.AVAILABLE,
      sort: ApartmentSortOption.PRICE_ASC,
      page: 2,
    });

    expect(result.meta.page).toBe(2);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api:4000/api/v1/apartments?q=Nile&status=AVAILABLE&sort=price%3Aasc&page=2',
      expect.objectContaining({ cache: 'no-store', method: 'GET' }),
    );
  });

  it('maps the standard API error envelope to ApiError', async () => {
    const body: ApiErrorResponse = {
      statusCode: 400,
      message: ['page must not be less than 1', 'limit must not be greater than 50'],
      error: 'Bad Request',
      timestamp: '2026-08-19T00:00:00.000Z',
      path: '/api/v1/apartments',
    };
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(jsonResponse(body, { status: 400 }));
    const client = new ApiClient('http://localhost:4000/api/v1', fetchMock);

    const request = client.listApartments({ page: 0 });

    await expect(request).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'page must not be less than 1, limit must not be greater than 50',
      details: body,
    });
  });

  it('maps non-contract error responses without treating them as empty data', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(new Response('Service unavailable', { status: 503 }));
    const client = new ApiClient('http://localhost:4000/api/v1', fetchMock);

    await expect(client.listProjects()).rejects.toEqual(
      expect.objectContaining<ApiError>({
        name: 'ApiError',
        status: 503,
        message: 'The apartments API returned 503.',
        details: null,
      }),
    );
  });

  it('maps network failures to a status-zero ApiError', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    const client = new ApiClient('http://localhost:4000/api/v1', fetchMock);

    await expect(client.listDevelopers()).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
      message: 'Unable to reach the apartments API.',
    });
  });
});
