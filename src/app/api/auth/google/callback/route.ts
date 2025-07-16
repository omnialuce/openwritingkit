
import { handleGoogleCallback } from '@/ai/flows/auth-flow';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  try {
    const sessionCookie = await handleGoogleCallback(code);
    const response = NextResponse.redirect(new URL('/', req.url));
    response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
    return response;
  } catch (error) {
    console.error('Error during Google callback:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', req.url));
  }
}
