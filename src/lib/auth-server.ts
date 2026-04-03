import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'edu-portal-secret-key-change-in-production';

export interface StoredUser {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  userType: 'student' | 'teacher' | 'admin';
  createdAt: string;
  photoUrl?: string;
}

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  userType: 'student' | 'teacher' | 'admin';
  createdAt: string;
  photoUrl?: string;
}

// ── In-memory store (works on Vercel serverless) ──────────────────────────────
// For production persistence, this is backed by a module-level Map
// Users registered via email/password persist per warm instance
// OAuth users are always find-or-create via Firestore in the oauth route

const userStore = new Map<string, StoredUser>();

export function findUserByEmail(email: string): StoredUser | null {
  const key = email.toLowerCase();
  return userStore.get(key) || null;
}

export function findUserById(id: string): StoredUser | null {
  for (const u of userStore.values()) {
    if (u.id === id) return u;
  }
  return null;
}

export function readUsers(): StoredUser[] {
  return Array.from(userStore.values());
}

// ── Password ──────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.startsWith('oauth_') || hash.startsWith('oauth:')) return false;
  return bcrypt.compare(password, hash);
}

// ── User creation ─────────────────────────────────────────────────────────────

export async function createUser(email: string, password: string, displayName?: string): Promise<PublicUser> {
  const key = email.toLowerCase();
  if (userStore.has(key)) throw new Error('EMAIL_IN_USE');

  const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const passwordHash = password.startsWith('oauth_')
    ? password
    : await hashPassword(password);

  const newUser: StoredUser = {
    id,
    email: key,
    displayName: displayName || email.split('@')[0],
    passwordHash,
    userType: 'student',
    createdAt: new Date().toISOString(),
  };
  userStore.set(key, newUser);
  return toPublic(newUser);
}

// ── JWT ───────────────────────────────────────────────────────────────────────

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { sub: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string };
  } catch {
    return null;
  }
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

export const COOKIE_NAME = 'edu_auth_token';

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export function toPublic(u: StoredUser): PublicUser {
  const { passwordHash: _, ...pub } = u;
  return pub;
}
