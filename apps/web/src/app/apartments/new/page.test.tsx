import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import NewApartmentPage from '@/app/apartments/new/page';

const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    accessToken: null,
    status: 'unauthenticated',
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe('NewApartmentPage', () => {
  afterEach(() => {
    cleanup();
    replaceMock.mockReset();
  });

  it('redirects unauthenticated users to login with a return path', async () => {
    render(<NewApartmentPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/login?next=/apartments/new');
    });
  });
});
