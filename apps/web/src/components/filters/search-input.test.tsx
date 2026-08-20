import { cleanup, fireEvent, render, screen, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchInput } from './search-input';

const pushMock = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/',
  useSearchParams: () => currentSearchParams,
}));

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    pushMock.mockReset();
    currentSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('debounces URL updates by 400ms when typing a search query', () => {
    render(<SearchInput />);

    fireEvent.change(screen.getByLabelText('Search apartments'), { target: { value: 'palm' } });

    expect(pushMock).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(pushMock).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(pushMock).toHaveBeenCalledWith('/?q=palm');
  });

  it('does not write whitespace-only queries to the URL', () => {
    currentSearchParams = new URLSearchParams('q=palm');
    render(<SearchInput />);

    fireEvent.change(screen.getByLabelText('Search apartments'), { target: { value: '   ' } });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(pushMock).toHaveBeenCalledWith('/');
  });
});
