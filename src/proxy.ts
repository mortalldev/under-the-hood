import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Redirects `/` and unprefixed paths to `/uz/...` (the default locale;
// locale detection is off, see src/i18n/routing.ts).
export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
