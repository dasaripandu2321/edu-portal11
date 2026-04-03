import { NextRequest, NextResponse } from 'next/server';
import { signToken, COOKIE_NAME, cookieOptions } from '@/lib/auth-server';
import { findUserByEmail, createUser, toPublic } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    const { email, displayName, photoUrl } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Find existing user or create new one
    let stored = findUserByEmail(email.trim());

    if (!stored) {
      try {
        await createUser(email.trim(), `oauth_${Date.now()}`, displayName || email.split('@')[0]);
        stored = findUserByEmail(email.trim());
      } catch {
        stored = findUserByEmail(email.trim());
      }
    }

    if (!stored) {
      return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
    }

    const token = signToken(stored.id);
    const user = toPublic(stored);

    const res = NextResponse.json({ user });
    res.cookies.set(COOKIE_NAME, token, cookieOptions(60 * 60 * 24 * 7));
    return res;
  } catch (err) {
    console.error('OAuth error:', err);
    return NextResponse.json({ error: 'OAuth sign-in failed.' }, { status: 500 });
  }
}
