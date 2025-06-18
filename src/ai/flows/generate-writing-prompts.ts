'use server';
/**
 * @fileOverview A writing prompt generator AI agent.
 *
 * - generateWritingPrompts - A function that handles the writing prompt generation process.
 * - GenerateWritingPromptsInput - The input type for the generateWritingPrompts function.
 * - GenerateWritingPromptsOutput - The return type for the generateWritingPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWritingPromptsInputSchema = z.object({
  genre: z.string().describe('The genre of the writing prompt.'),
  style: z.string().describe('The style of the writing prompt.'),
});
export type GenerateWritingPromptsInput = z.infer<typeof GenerateWritingPromptsInputSchema>;

const GenerateWritingPromptsOutputSchema = z.object({
  prompt: z.string().describe('The generated writing prompt.'),
});
export type GenerateWritingPromptsOutput = z.infer<typeof GenerateWritingPromptsOutputSchema>;

export async function generateWritingPrompts(input: GenerateWritingPromptsInput): Promise<GenerateWritingPromptsOutput> {
  return generateWritingPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWritingPromptsPrompt',
  input: {schema: GenerateWritingPromptsInputSchema},
  output: {schema: GenerateWritingPromptsOutputSchema},
  prompt: `You are a creative writing assistant. Generate a writing prompt based on the specified genre and style.

Genre: {{{genre}}}
Style: {{{style}}}

Prompt:`,
});

const generateWritingPromptsFlow = ai.defineFlow(
  {
    name: 'generateWritingPromptsFlow',
    inputSchema: GenerateWritingPromptsInputSchema,
    outputSchema: GenerateWritingPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
