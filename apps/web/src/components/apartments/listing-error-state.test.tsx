import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ListingErrorState } from './listing-error-state';

const refreshMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

describe('ListingErrorState', () => {
  it('renders a distinct error message and retries via router.refresh()', () => {
    render(<ListingErrorState message="Unable to reach the apartments API." />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Unable to load apartments' })).toBeInTheDocument();
    expect(screen.getByText('Unable to reach the apartments API.')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'No apartments matched your search' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
