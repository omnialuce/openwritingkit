
'use server';

/**
 * @fileOverview A flow for sending feedback via Firestore using the Trigger Email extension.
 * 
 * This flow writes a document to the 'mail' collection in Firestore. The Trigger Email
 * Firebase Extension should be configured to listen to this collection and send an
 * email based on the document's content.
 * 
 * - sendFeedback - Writes feedback to Firestore to trigger an email.
 * - FeedbackInput - The input type for the sendFeedback function.
 */

import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase-admin';
import { z } from 'zod';

const FeedbackInputSchema = z.object({
  type: z.string().describe('The type of feedback (e.g., general, bug, suggestion).'),
  page: z.string().describe('The page the feedback relates to.'),
  message: z.string().describe('The user\'s feedback message.'),
  from: z.string().email().describe('The email address of the user sending feedback.'),
});

export type FeedbackInput = z.infer<typeof FeedbackInputSchema>;

export async function sendFeedback(input: FeedbackInput): Promise<{ success: boolean; message: string }> {
  try {
    const validatedInput = FeedbackInputSchema.parse(input);

    const db = getFirestore(adminApp);
    
    // The document written to the 'mail' collection will trigger the "Trigger Email" extension.
    // The extension should be configured in Firebase to send an email.
    // The `to` field specifies the recipient, and the `message` field contains the email body.
    await db.collection('mail').add({
      to: ['owk@omnialuce.tech'],
      message: {
        subject: `OpenWritingKit Feedback: [${validatedInput.type}] on [${validatedInput.page}]`,
        html: `
          <p><strong>From:</strong> ${validatedInput.from}</p>
          <p><strong>Type:</strong> ${validatedInput.type}</p>
          <p><strong>Page:</strong> ${validatedInput.page}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${validatedInput.message.replace(/\n/g, '<br>')}</p>
        `,
      },
    });

    return { success: true, message: 'Feedback sent successfully.' };

  } catch (error: any) {
    console.error('Error sending feedback:', error);

    if (error instanceof z.ZodError) {
      return { success: false, message: 'Invalid input. Please check the form and try again.' };
    }
    
    // Provide a generic error message to the user.
    return { success: false, message: 'An unexpected error occurred while sending your feedback. Please try again later.' };
  }
}
