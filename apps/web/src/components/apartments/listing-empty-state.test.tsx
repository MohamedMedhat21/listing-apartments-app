import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ListingEmptyState } from './listing-empty-state';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams('q=palm'),
}));

vi.mock('@/lib/listing/use-listing-query', () => ({
  useListingQuery: () => ({
    clearFilters: () => pushMock('/'),
  }),
}));

describe('ListingEmptyState', () => {
  afterEach(() => {
    cleanup();
  });

  it('offers a clear-filters action when filters are active', () => {
    render(<ListingEmptyState hasActiveFilters />);

    expect(
      screen.getByRole('heading', { name: 'No apartments matched your search' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('does not offer clear filters when no filters are active', () => {
    render(<ListingEmptyState hasActiveFilters={false} />);

    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
    expect(screen.getByText(/no apartments available to browse right now/i)).toBeInTheDocument();
  });
});
