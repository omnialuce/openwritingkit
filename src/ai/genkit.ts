import {genkit, firebase} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebaseAdmin} from '@genkit-ai/firebase/admin';

export const ai = genkit({
  plugins: [googleAI(), firebaseAdmin()],
  model: 'googleai/gemini-2.0-flash',
});
