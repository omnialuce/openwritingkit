'use server';
/**
 * @fileOverview Authentication-related server actions for changing user credentials.
 *
 * - changeEmail - Updates the user's email address in Firebase Auth.
 * - changePassword - Updates the user's password in Firebase Auth.
 */

import { z } from 'genkit';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from '@/lib/firebase-admin';

// --- Change Email ---

export const ChangeEmailInputSchema = z.object({
  uid: z.string().describe('The UID of the user changing their email.'),
  newEmail: z.string().email().describe('The new email address for the user.'),
});
export type ChangeEmailInput = z.infer<typeof ChangeEmailInputSchema>;

export const ChangeEmailOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type ChangeEmailOutput = z.infer<typeof ChangeEmailOutputSchema>;

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


// --- Change Password ---

export const ChangePasswordInputSchema = z.object({
  uid: z.string().describe('The UID of the user changing their password.'),
  newPassword: z.string().min(6).describe('The new password, must be at least 6 characters.'),
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;

export const ChangePasswordOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type ChangePasswordOutput = z.infer<typeof ChangePasswordOutputSchema>;

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
