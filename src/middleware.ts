import { NextResponse, type NextRequest } from 'next/server';

// Redirect authenticated users away from auth pages on the edge (works in production)
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only handle login/signup routes
  if (pathname === '/login' || pathname === '/signup') {
    const userCookie = req.cookies.get('user_data')?.value;
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie) as { role?: 'brand' | 'creator' | 'admin' };
        const role = user?.role === 'brand' ? 'brand' : 'creator';
        const url = req.nextUrl.clone();
        url.pathname = `/${role}`;
        return NextResponse.redirect(url);
      } catch {
        // If parsing fails, still consider authenticated and send to creator by default
        const url = req.nextUrl.clone();
        url.pathname = '/creator';
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/signup'],
};


