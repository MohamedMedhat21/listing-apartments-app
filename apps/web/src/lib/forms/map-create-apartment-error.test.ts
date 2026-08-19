import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api/client';
import { applyCreateApartmentApiError } from './map-create-apartment-error';

describe('applyCreateApartmentApiError', () => {
  it('maps a 409 duplicate unit number onto the unitNumber field (BR-3)', () => {
    const setError = vi.fn();
    const setFormError = vi.fn();
    const error = new ApiError('Unit number "A-101" already exists in this project', 409, {
      statusCode: 409,
      message: 'Unit number "A-101" already exists in this project',
      error: 'Conflict',
      timestamp: '2026-01-01T00:00:00.000Z',
      path: '/api/v1/apartments',
    });

    applyCreateApartmentApiError(error, setError, setFormError);

    expect(setError).toHaveBeenCalledWith('unitNumber', {
      message: 'Unit number "A-101" already exists in this project',
    });
    expect(setFormError).not.toHaveBeenCalled();
  });

  it('maps a 422 missing project onto the projectId field (BR-2)', () => {
    const setError = vi.fn();
    const setFormError = vi.fn();
    const error = new ApiError('Project abc does not exist', 422);

    applyCreateApartmentApiError(error, setError, setFormError);

    expect(setError).toHaveBeenCalledWith('projectId', { message: 'Project abc does not exist' });
  });
});
