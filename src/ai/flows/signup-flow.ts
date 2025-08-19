'use server';
/**
 * @fileOverview Sign-up flow for creating new users with invite code validation.
 */
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase-admin';
import type { SignupInput, SignupOutput } from '@/ai/schemas/signup-schemas';

export async function signupUser(input: SignupInput): Promise<SignupOutput> {
  const { email, password, inviteCode, ipAddress } = input;
  const auth = getAuth(adminApp);
  const db = getFirestore(adminApp);

  try {
    // 1. Validate Invite Code
    const inviteRef = db.collection('inviteCodes').doc(inviteCode);
    const inviteDoc = await inviteRef.get();

    if (!inviteDoc.exists) {
      return { success: false, message: 'Invalid invite code.' };
    }

    const inviteData = inviteDoc.data();
    if (inviteData?.used) {
      return { success: false, message: 'This invite code has already been used.' };
    }

    // 2. Create User in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
    });

    // 3. Mark invite code as used
    await inviteRef.update({
      used: true,
      usedBy: userRecord.uid,
      usedAt: new Date(),
    });

    // 4. Log activity
    await db.collection('activityLog').add({
        action: 'signup',
        userId: userRecord.uid,
        email: email,
        timestamp: new Date(),
        ipAddress: ipAddress || 'unknown',
        details: 'User signed up successfully.'
    });

    return { success: true, message: 'User created successfully!', uid: userRecord.uid };

  } catch (error: any) {
    let message = 'An unexpected error occurred during sign up.';
    if (error.code === 'auth/email-already-exists') {
      message = 'This email address is already in use by another account.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'The email address is not valid.';
    } else if (error.code === 'auth/weak-password') {
      message = 'The password is too weak. It must be at least 6 characters.';
    }
    
    // Log failed attempt
     await db.collection('activityLog').add({
        action: 'signup_failed',
        email: email,
        timestamp: new Date(),
        ipAddress: ipAddress || 'unknown',
        details: message,
        error: error.message,
    });

    console.error('Error signing up user:', error);
    return { success: false, message };
  }
}
