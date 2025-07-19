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
  notes: z.string().optional().describe('Optional user notes for additional context.'),
  documentContext: z.string().optional().describe('Optional content of a linked document, scene, or chapter for context.'),
  characterContext: z.string().optional().describe('Optional profile of a linked character for context.'),
  language: z.string().optional().describe('The target language dialect for the prompt, specified as a BCP-47 tag (e.g., "en-US", "pt-BR").'),
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
  prompt: `You are a creative writing assistant. Generate a writing prompt based on the specified genre, style, and any provided context.
{{#if language}}
The prompt should be suitable for the specified language dialect: {{{language}}}. Use appropriate cultural references and phrasing.
{{/if}}

Genre: {{{genre}}}
Style: {{{style}}}

{{#if notes}}
User Notes:
{{{notes}}}
{{/if}}

{{#if documentContext}}
Linked Document Context:
{{{documentContext}}}
{{/if}}

{{#if characterContext}}
Linked Character Context:
{{{characterContext}}}
{{/if}}

Based on all the provided information, generate a compelling and relevant writing prompt.

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
