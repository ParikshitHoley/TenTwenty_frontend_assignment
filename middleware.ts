import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect dashboard routes - redirect to login if no session cookie
  if (pathname.startsWith('/dashboard')) {
    // Check if user has auth session cookie
    const sessionCookie = request.cookies.get('next-auth.session-token')?.value;
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
