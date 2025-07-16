
import { getGoogleAuthUrl } from '@/ai/flows/auth-flow';
import { NextResponse } from 'next/server';

export async function GET() {
  const authUrl = await getGoogleAuthUrl();
  return NextResponse.redirect(authUrl);
}
