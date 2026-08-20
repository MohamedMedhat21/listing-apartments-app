import { describe, expect, it } from 'vitest';

import { resolvePostLoginPath } from './post-login-redirect';

describe('resolvePostLoginPath', () => {
  it('returns the listing page when next is missing', () => {
    expect(resolvePostLoginPath(null)).toBe('/');
    expect(resolvePostLoginPath(undefined)).toBe('/');
  });

  it('returns the protected return path when next is a valid relative URL', () => {
    expect(resolvePostLoginPath('/apartments/new')).toBe('/apartments/new');
  });

  it('falls back to the listing page for unsafe or login-loop paths', () => {
    expect(resolvePostLoginPath('https://evil.example')).toBe('/');
    expect(resolvePostLoginPath('//evil.example')).toBe('/');
    expect(resolvePostLoginPath('/login')).toBe('/');
    expect(resolvePostLoginPath('/login?next=/apartments/new')).toBe('/');
  });
});
