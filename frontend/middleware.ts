import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { setCache, getCache } from '@/server/methods/cache'

export async function middleware(request: NextRequest) {

  const sessionId = request.cookies.get('session-id')?.value;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const { pathname } = request.nextUrl;

  const count = Number( await getCache(ip) || 0);

  if (count >= 100) {
    return new NextResponse('11111111', { status: 429 });
  }

  await setCache(ip, count + 1)


  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};