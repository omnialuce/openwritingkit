
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  generateCodeVerifier,
  generateState,
  Google as GoogleOAuthProvider,
} from 'oslo/oauth2';
import { TimeSpan, createDate } from 'oslo';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const SESSION_COOKIE_NAME = 'auth_session';
const STATE_COOKIE_NAME = 'google_oauth_state';
const CODE_VERIFIER_COOKIE_NAME = 'google_oauth_code_verifier';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback` : 'http://localhost:3000/api/auth/google/callback';

if (!clientId || !clientSecret) {
  throw new Error('Missing Google OAuth credentials in environment variables');
}

const auth = new GoogleOAuthProvider(clientId, clientSecret, {
    redirectURI: redirectUri,
    scope: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/drive.appdata'],
});
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'default-secret-string-that-is-long-enough');

interface UserSession {
    sub: string; // User ID
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
}

async function createSessionCookie(session: UserSession) {
  const expires = createDate(new TimeSpan(30, 'd'));
  const sessionJwt = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);

  return {
    name: SESSION_COOKIE_NAME,
    value: sessionJwt,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires,
      path: '/',
    },
  };
}

export const getGoogleAuthUrl = ai.defineFlow(
  {
    name: 'getGoogleAuthUrl',
    inputSchema: z.void(),
    outputSchema: z.string(),
  },
  async () => {
    const state = generateState();
    const codeVerifier = generateCodeifier();

    cookies().set(STATE_COOKIE_NAME, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    cookies().set(CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    const url = await auth.createAuthorizationURL(state, {
      scopes: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/drive.appdata'],
      codeChallengeMethod: 'S256',
      codeChallenge: codeVerifier,
    });

    return url.toString();
  }
);

export const handleGoogleCallback = ai.defineFlow(
  {
    name: 'handleGoogleCallback',
    inputSchema: z.string().describe('The authorization code from Google'),
    outputSchema: z.any(),
  },
  async (code) => {
    const storedState = cookies().get(STATE_COOKIE_NAME)?.value;
    const storedCodeVerifier = cookies().get(CODE_VERIFIER_COOKIE_NAME)?.value;

    if (!storedState || !storedCodeVerifier) {
      throw new Error('Missing state or code verifier');
    }

    const tokens = await auth.validateAuthorizationCode(code, storedCodeVerifier);

    const googleUserResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
        },
    });
    const googleUser = await googleUserResponse.json();

    // Here you would typically look up the user in your database or create a new one.
    // For this demo, we'll use the Google user ID (sub) as our user ID.
    const userId = googleUser.sub;

    const session: UserSession = {
      sub: userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + tokens.accessTokenExpiresIn * 1000),
    };

    return createSessionCookie(session);
  }
);
