import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { code } = await request.json();
  const expected = process.env.INVITE_CODE;

  // If no INVITE_CODE is configured, signup is open
  if (!expected) {
    return NextResponse.json({ ok: true });
  }

  if (typeof code !== 'string' || code.trim() !== expected) {
    return NextResponse.json({ ok: false, error: 'Invalid invite code' }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
