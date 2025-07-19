'use server';
/**
 * @fileOverview Authentication-related server actions for changing user credentials.
 *
 * - changeEmail - Updates the user's email address in Firebase Auth.
 * - changePassword - Updates the user's password in Firebase Auth.
 */
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase-admin';
import type { ChangeEmailInput, ChangeEmailOutput, ChangePasswordInput, ChangePasswordOutput } from '@/ai/schemas/auth-schemas';


export async function changeEmail(input: ChangeEmailInput): Promise<ChangeEmailOutput> {
  try {
    const auth = getAuth(adminApp);
    await auth.updateUser(input.uid, {
      email: input.newEmail,
    });
    return { success: true, message: 'Email updated successfully. Please log in again.' };
  } catch (error: any) {
    let message = 'An unexpected error occurred.';
    if (error.code === 'auth/email-already-exists') {
      message = 'This email address is already in use by another account.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'The new email address is not valid.';
    }
    console.error('Error changing email:', error);
    return { success: false, message };
  }
}

export async function changePassword(input: ChangePasswordInput): Promise<ChangePasswordOutput> {
  try {
    const auth = getAuth(adminApp);
    await auth.updateUser(input.uid, {
      password: input.newPassword,
    });
    return { success: true, message: 'Password updated successfully. Please log in again.' };
  } catch (error: any) {
    let message = 'An unexpected error occurred.';
    if (error.code === 'auth/weak-password') {
      message = 'The new password is too weak. It must be at least 6 characters.';
    }
    console.error('Error changing password:', error);
    return { success: false, message };
  }
}
