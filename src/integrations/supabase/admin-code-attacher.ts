import { createMiddleware } from '@tanstack/react-start';
import { getAdminToken } from '@/lib/admin-token';

/** Attaches the short-lived admin-verified token to every server function call. */
export const attachAdminCode = createMiddleware({ type: 'function' }).client(async ({ next }) => {
  const token = getAdminToken();
  return next({ headers: token ? { 'x-admin-token': token } : {} });
});
