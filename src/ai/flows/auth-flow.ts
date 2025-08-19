
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
import { ChangeEmailInputSchema, ChangeEmailOutputSchema, ChangePasswordInputSchema, ChangePasswordOutputSchema } from '@/ai/schemas/auth-schemas';
import { ai } from '@/ai/genkit';
import { z } from 'zod';


const changeEmailTool = ai.defineTool(
    {
        name: 'changeEmailTool',
        inputSchema: ChangeEmailInputSchema,
        outputSchema: ChangeEmailOutputSchema,
    },
    async (input) => {
        try {
            const auth = getAuth(adminApp);
            await auth.updateUser(input.uid, { email: input.newEmail });
            return { success: true, message: 'Email updated successfully. Please log in again with your new email address.' };
        } catch (error: any) {
            let message = 'An unexpected error occurred while updating your email.';
            if (error.code === 'auth/email-already-exists') {
                message = 'This email address is already in use by another account.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'The new email address is not valid.';
            } else if (error.code === 'auth/user-not-found') {
                message = 'User not found.';
            }
            console.error('Error changing email:', error);
            return { success: false, message };
        }
    }
);

const changePasswordTool = ai.defineTool(
    {
        name: 'changePasswordTool',
        inputSchema: ChangePasswordInputSchema,
        outputSchema: ChangePasswordOutputSchema,
    },
    async (input) => {
        try {
            const auth = getAuth(adminApp);
            await auth.updateUser(input.uid, { password: input.newPassword });
            return { success: true, message: 'Password updated successfully. Please log in again with your new password.' };
        } catch (error: any) {
            let message = 'An unexpected error occurred while updating your password.';
            if (error.code === 'auth/weak-password') {
                message = 'The new password is too weak. It must be at least 6 characters.';
            } else if (error.code === 'auth/user-not-found') {
                message = 'User not found.';
            }
            console.error('Error changing password:', error);
            return { success: false, message };
        }
    }
);


export async function changeEmail(input: ChangeEmailInput): Promise<ChangeEmailOutput> {
  try {
    if (!input.uid || !input.newEmail) {
        return { success: false, message: 'User ID and new email are required.' };
    }
    return await changeEmailTool(input);
  } catch (error: any) {
    console.error('Error changing email:', error);
    return { success: false, message: 'An unexpected error occurred while updating your email.' };
  }
}

export async function changePassword(input: ChangePasswordInput): Promise<ChangePasswordOutput> {
  try {
     if (!input.uid || !input.newPassword) {
        return { success: false, message: 'User ID and new password are required.' };
    }
    return await changePasswordTool(input);
  } catch (error: any) {
    console.error('Error changing password:', error);
    return { success: false, message: 'An unexpected error occurred while updating your password.' };
  }
}
