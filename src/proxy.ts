import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Paths that require authentication
const PROTECTED_PATHS = ['/', '/dashboard', '/invoices', '/quotes', '/expenses', '/settings'];

// Paths that are for guests only (redirect to dashboard if logged in)
const AUTH_PATHS = ['/login', '/register'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Check if path is protected or auth-related
    const isProtected = PROTECTED_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));
    const isAuth = AUTH_PATHS.some(path => pathname === path);

    if (!isProtected && !isAuth) {
        return NextResponse.next();
    }

    // 2. Validate Session
    const token = request.cookies.get('auth_token')?.value;
    const payload = token ? await verifyToken(token) : null;
    const isAuthenticated = !!payload;

    // 2.5 Handle API Protection
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
        if (!isAuthenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    // 3. Handle Redirects
    if (isProtected && !isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuth && isAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url)); // Redirect to Dashboard
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
