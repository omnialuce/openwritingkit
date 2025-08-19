/**
 * @fileOverview Zod schemas and TypeScript types for the sign-up process.
 */

import { z } from 'zod';

export const SignupInputSchema = z.object({
  email: z.string().email().describe('The email address for the new user.'),
  password: z.string().min(6).describe('The new password, must be at least 6 characters.'),
  inviteCode: z.string().min(1).describe('The mandatory invite code for sign-up.'),
  ipAddress: z.string().optional().describe('The IP address of the user signing up.'),
});
export type SignupInput = z.infer<typeof SignupInputSchema>;

export const SignupOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  uid: z.string().optional(),
});
export type SignupOutput = z.infer<typeof SignupOutputSchema>;
