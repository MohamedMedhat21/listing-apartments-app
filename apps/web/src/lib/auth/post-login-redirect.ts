const DEFAULT_POST_LOGIN_PATH = '/';

/**
 * Resolves where to send the user after a successful login.
 * Uses `next` only when it is a same-origin relative path set by a protected page.
 */
export function resolvePostLoginPath(next: string | null | undefined): string {
  if (!next) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  if (!next.startsWith('/') || next.startsWith('//')) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  if (next === '/login' || next.startsWith('/login?')) {
    return DEFAULT_POST_LOGIN_PATH;
  }

  return next;
}
