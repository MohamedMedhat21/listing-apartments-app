import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api/client';
import { applyCreateApartmentApiError } from '@/lib/forms/map-create-apartment-error';

import { CreateApartmentForm } from './create-apartment-form';

const pushMock = vi.fn();
const createApartmentMock = vi.fn();
const listProjectsMock = vi.fn();
const applyErrorMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    accessToken: 'test-token',
    status: 'authenticated',
    user: { id: '1', email: 'admin@nawy.local', role: 'ADMIN' },
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('@/lib/api/browser', () => ({
  createBrowserApiClient: () => ({
    listProjects: listProjectsMock,
    createApartment: createApartmentMock,
  }),
}));

vi.mock('@/lib/forms/map-create-apartment-error', async () => {
  const actual = await vi.importActual<typeof import('@/lib/forms/map-create-apartment-error')>(
    '@/lib/forms/map-create-apartment-error',
  );

  return {
    ...actual,
    applyCreateApartmentApiError: (...args: Parameters<typeof applyCreateApartmentApiError>) => {
      applyErrorMock(...args);
      return actual.applyCreateApartmentApiError(...args);
    },
  };
});

describe('CreateApartmentForm', () => {
  const projectId = '550e8400-e29b-41d4-a716-446655440001';

  beforeEach(() => {
    pushMock.mockReset();
    createApartmentMock.mockReset();
    listProjectsMock.mockReset();
    applyErrorMock.mockReset();
    listProjectsMock.mockResolvedValue({
      data: [
        {
          id: projectId,
          name: 'Palm Hills',
          city: 'New Cairo',
          district: 'Fifth Settlement',
          developer: { id: 'dev-1', name: 'Palm Hills' },
          apartmentCount: 10,
        },
      ],
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('shows inline validation errors for required fields', async () => {
    render(<CreateApartmentForm />);

    fireEvent.click(await screen.findByRole('button', { name: 'Create apartment' }));

    expect(await screen.findByText('Unit name is required')).toBeInTheDocument();
    expect(screen.getByText('Unit number is required')).toBeInTheDocument();
    expect(screen.getAllByText('Select a project').length).toBeGreaterThan(0);
  });

  it('maps a 409 duplicate response onto the unitNumber field (BR-3)', async () => {
    createApartmentMock.mockRejectedValue(
      new ApiError('Unit number "A-101" already exists in this project', 409),
    );

    render(<CreateApartmentForm />);

    fireEvent.change(await screen.findByLabelText('Unit name'), {
      target: { value: 'Skyline A1' },
    });
    fireEvent.change(screen.getByLabelText('Unit number'), { target: { value: 'A-101' } });
    fireEvent.change(screen.getByLabelText('Price (EGP)'), { target: { value: '2500000' } });
    fireEvent.change(screen.getByLabelText('Area (m²)'), { target: { value: '180' } });

    await waitFor(() => {
      expect(listProjectsMock).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('combobox', { name: 'Project' }));
    fireEvent.click(await screen.findByRole('option', { name: /Palm Hills/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Create apartment' }));

    await waitFor(() => {
      expect(applyErrorMock).toHaveBeenCalled();
    });

    expect(
      await screen.findByText('Unit number "A-101" already exists in this project'),
    ).toBeInTheDocument();
  });
});
