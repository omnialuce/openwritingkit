
'use server';
/**
 * @fileOverview AI flow for getting writing feedback including grammar, spelling, and readability.
 *
 * - getWritingFeedback - Analyzes text for grammar, spelling, and readability.
 * - GetWritingFeedbackInput - Input type for the getWritingFeedback function.
 * - GetWritingFeedbackOutput - Return type for the getWritingFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetWritingFeedbackInputSchema = z.object({
  text: z.string().describe('The text to analyze.'),
});
export type GetWritingFeedbackInput = z.infer<typeof GetWritingFeedbackInputSchema>;

const GrammarSpellingSuggestionSchema = z.object({
  originalText: z.string().describe('The original segment of text with an issue.'),
  suggestedCorrection: z.string().describe('The suggested correction for the segment.'),
  explanation: z.string().optional().describe('A very brief explanation of the issue or suggestion (ideally 1-3 lines or a short paragraph).'),
  issueType: z.string().describe('Type of issue (e.g., "grammar", "spelling", "punctuation").')
});

const GetWritingFeedbackOutputSchema = z.object({
  overallAssessment: z.string().describe('A brief overall assessment of the writing quality.'),
  grammarSpellingSuggestions: z.array(GrammarSpellingSuggestionSchema).describe('A list of grammar and spelling suggestions.'),
  readability: z.object({
    scoreDescription: z.string().describe('A descriptive readability score (e.g., "Grade 8 level", "Easy to read").'),
    assessment: z.string().describe('A brief assessment of the text readability and suggestions for improvement.'),
  }),
});
export type GetWritingFeedbackOutput = z.infer<typeof GetWritingFeedbackOutputSchema>;

export async function getWritingFeedback(input: GetWritingFeedbackInput): Promise<GetWritingFeedbackOutput> {
  return getWritingFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getWritingFeedbackPrompt',
  input: {schema: GetWritingFeedbackInputSchema},
  output: {schema: GetWritingFeedbackOutputSchema},
  prompt: `You are an expert writing assistant. Analyze the following text for grammar, spelling, punctuation, and readability.

Text to analyze:
{{{text}}}

Provide an overall assessment of the writing quality.
List specific grammar and spelling suggestions, including the original text, the suggested correction, a very brief explanation (ideally 1-3 lines, or a short paragraph at most) if helpful, and the type of issue (grammar, spelling, punctuation).
Provide a readability score (e.g., Flesch-Kincaid grade level, or a descriptive term like 'Easy to Read') and a brief assessment of its readability with any suggestions for improvement.

Format your response according to the output schema.
If there are no grammar or spelling issues, return an empty array for grammarSpellingSuggestions.
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE'},
    ],
  },
});

const getWritingFeedbackFlow = ai.defineFlow(
  {
    name: 'getWritingFeedbackFlow',
    inputSchema: GetWritingFeedbackInputSchema,
    outputSchema: GetWritingFeedbackOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

