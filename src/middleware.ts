import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Anyone can browse the site and build a cart anonymously — sign-in is only
// required to actually check out and to view account-specific pages.
const PROTECTED_PREFIXES = ['/checkout', '/profile', '/orders']

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  const { pathname } = request.nextUrl

  const requiresAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (!authCookie && requiresAuth) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect authenticated users away from the sign-in/sign-up forms, but
  // leave "/" alone — it's the home/landing page now, not just an auth
  // gateway, so signed-in visitors should still be able to see it.
  if (authCookie && (pathname === '/sign-in' || pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/menu', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - file.svg, globe.svg, next.svg, vercel.svg, window.svg (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)',
  ],
}
