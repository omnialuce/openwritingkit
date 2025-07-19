/**
 * @fileOverview Zod schemas and TypeScript types for authentication-related actions.
 */

import { z } from 'zod';

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
