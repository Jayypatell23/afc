import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  const { pathname } = request.nextUrl

  // Define public paths that don't require authentication
  const isPublicPath = pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/'

  // Protect all other routes
  if (!authCookie && !isPublicPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (authCookie && (pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/')) {
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
