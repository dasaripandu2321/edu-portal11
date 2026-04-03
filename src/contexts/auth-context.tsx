'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  userType: 'student' | 'teacher' | 'admin';
  createdAt: string;
  photoUrl?: string;
  photoURL?: string;
  uid?: string;
}

export interface UserCredential { user: AppUser; }

interface AuthContextType {
  user: AppUser | null;
  appUser: AppUser | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithGithub: () => Promise<UserCredential>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  sendSignInLink: (email: string) => Promise<void>;
  completeSignInWithEmailLink: (email?: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

function normalize(u: AppUser): AppUser {
  return { ...u, uid: u.id, photoURL: u.photoUrl };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount — check if a valid session cookie exists
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(({ user }) => setUser(user ? normalize(user) : null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Login failed');
      err.code = res.status === 401 ? 'auth/invalid-credential' : 'auth/unknown';
      throw err;
    }
    const u = normalize(data.user);
    setUser(u);
    return { user: u };
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<UserCredential> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Registration failed');
      err.code = res.status === 409 ? 'auth/email-already-in-use' : 'auth/unknown';
      throw err;
    }
    const u = normalize(data.user);
    setUser(u);
    return { user: u };
  };

  const signInWithGoogle = async (): Promise<UserCredential> => {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    // Use uid-based email fallback if Google doesn't return email
    const email = fbUser.email || `${fbUser.uid}@google-oauth.com`;
    const res = await fetch('/api/auth/oauth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
        photoUrl: fbUser.photoURL,
        provider: 'google',
        uid: fbUser.uid,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google sign-in failed');
    const u = normalize(data.user);
    setUser(u);
    return { user: u };
  };

  const signInWithGithub = async (): Promise<UserCredential> => {
    const result = await signInWithPopup(auth, githubProvider);
    const fbUser = result.user;
    const email = fbUser.email || `${fbUser.uid}@github-oauth.com`;
    const res = await fetch('/api/auth/oauth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'GitHub User',
        photoUrl: fbUser.photoURL,
        provider: 'github',
        uid: fbUser.uid,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'GitHub sign-in failed');
    const u = normalize(data.user);
    setUser(u);
    return { user: u };
  };

  const signOut = async (): Promise<void> => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const resetPassword = async (_email: string): Promise<void> => {
    // Wire up a real email service (e.g. Resend, SendGrid) here
    console.log('Password reset requested for:', _email);
  };

  const sendVerificationEmail = async (): Promise<void> => {
    console.log('Verification email simulated');
  };

  const sendSignInLink = async (email: string): Promise<void> => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('emailForSignIn', email);
    }
  };

  const completeSignInWithEmailLink = async (providedEmail?: string): Promise<UserCredential> => {
    const email = providedEmail || (typeof window !== 'undefined' ? localStorage.getItem('emailForSignIn') : null);
    if (!email) throw new Error('Email required');
    try {
      return await signInWithEmail(email, 'emaillink-auto');
    } catch {
      return await signUpWithEmail(email, 'emaillink-auto');
    }
  };

  return (
    <AuthContext.Provider value={{
      user, appUser: user, loading,
      signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGithub,
      signOut, resetPassword, sendVerificationEmail,
      sendSignInLink, completeSignInWithEmailLink,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Re-export types used elsewhere
export interface Course {
  id: string; title: string; description: string;
  createdAt: string; imageUrl?: string; teacherId: string;
}
export interface Module {
  id: string; title: string; description: string;
  orderIndex: number; createdAt: string; courseId: string;
}
export interface Lesson {
  id: string; title: string; content: string;
  orderIndex: number; createdAt: string; moduleId: string; externalLink?: string;
}
export interface Question {
  id: string; queryText: string; aiResponse: string;
  createdAt: string; studentId: string; lessonId: string;
}
export interface StudentProgress {
  id: string; isCompleted: boolean;
  createdAt: string; updatedAt: string; studentId: string; lessonId: string;
}
