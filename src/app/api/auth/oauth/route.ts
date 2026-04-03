import { NextRequest, NextResponse } from 'next/server';
import { signToken, COOKIE_NAME, cookieOptions, findUserByEmail, createUser, toPublic } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail, displayName, photoUrl, provider, uid } = await req.json();

    // Build a guaranteed non-empty email
    const email = rawEmail?.trim()
      || (uid ? `${uid}@${provider || 'oauth'}.com` : null);

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    let stored = findUserByEmail(email);

    if (!stored) {
      try {
        await createUser(
          email,
          `oauth_${Date.now()}`,
          displayName || email.split('@')[0],
        );
        stored = findUserByEmail(email);
      } catch {
        // Already exists (race condition) — just fetch it
        stored = findUserByEmail(email);
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
