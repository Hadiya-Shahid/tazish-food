import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('tazish_app_auth')
  const { pathname } = request.nextUrl
  const appPassword = process.env.APP_PASSWORD

  // Allow next.js internal assets, static files, wait for hydration on next pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icon.png') ||
    pathname.startsWith('/manifest.json') ||
    pathname === '/sw.js'
  ) {
    return NextResponse.next()
  }

  // Let API auth route pass
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // If going to login page
  if (pathname === '/login') {
    if (appPassword && authCookie?.value === appPassword) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // All other pages require authentication
  if (!appPassword || authCookie?.value !== appPassword) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
