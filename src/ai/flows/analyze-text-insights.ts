'use server';

/**
 * @fileOverview AI flow for analyzing text insights, focusing on pacing analysis and recommendations.
 *
 * - analyzeTextPacing - Analyzes the pacing of a story and provides recommendations.
 * - AnalyzeTextPacingInput - Input type for the analyzeTextPacing function.
 * - AnalyzeTextPacingOutput - Return type for the analyzeTextPacing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextPacingInputSchema = z.object({
  text: z
    .string()
    .describe('The text of the story to analyze for pacing.'),
  genre: z
    .string()
    .optional()
    .describe('The genre of the story, which can influence pacing expectations.'),
});

export type AnalyzeTextPacingInput = z.infer<typeof AnalyzeTextPacingInputSchema>;

const AnalyzeTextPacingOutputSchema = z.object({
  pacingAnalysis: z.string().describe('An analysis of the story pacing, highlighting areas that may be too fast or too slow.'),
  recommendations: z.string().describe('Recommendations for adjusting the pacing of the story.'),
});

export type AnalyzeTextPacingOutput = z.infer<typeof AnalyzeTextPacingOutputSchema>;

export async function analyzeTextPacing(input: AnalyzeTextPacingInput): Promise<AnalyzeTextPacingOutput> {
  return analyzeTextPacingFlow(input);
}

const analyzeTextPacingPrompt = ai.definePrompt({
  name: 'analyzeTextPacingPrompt',
  input: {schema: AnalyzeTextPacingInputSchema},
  output: {schema: AnalyzeTextPacingOutputSchema},
  prompt: `You are an AI writing assistant specializing in pacing analysis for stories.

  Analyze the provided text and determine if the pacing is appropriate for the genre (if provided).
  Identify sections where the pacing may be too fast, causing the reader to miss important details, or too slow, causing the reader to lose interest.

  Provide specific recommendations for improving the pacing, such as adding more descriptive details, shortening drawn-out scenes, or introducing conflicts to increase tension.

  Text:
  {{text}}

  Genre (if applicable):
  {{genre}}

  Pacing Analysis and Recommendations:
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const analyzeTextPacingFlow = ai.defineFlow(
  {
    name: 'analyzeTextPacingFlow',
    inputSchema: AnalyzeTextPacingInputSchema,
    outputSchema: AnalyzeTextPacingOutputSchema,
  },
  async input => {
    const {output} = await analyzeTextPacingPrompt(input);
    return output!;
  }
);
