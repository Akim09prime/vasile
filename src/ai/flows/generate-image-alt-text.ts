'use server';

/**
 * @fileOverview Generates alt text for images using a generative AI model.
 *
 * - generateImageAltText - A function that generates alt text for an image.
 * - GenerateImageAltTextInput - The input type for the generateImagealtText function.
 * - GenerateImageAltTextOutput - The return type for the generateImageAltText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageAltTextInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateImageAltTextInput = z.infer<typeof GenerateImageAltTextInputSchema>;

const GenerateImageAltTextOutputSchema = z.object({
  altText: z.string().describe('The generated alt text for the image.'),
});
export type GenerateImageAltTextOutput = z.infer<typeof GenerateImageAltTextOutputSchema>;

export async function generateImageAltText(input: GenerateImageAltTextInput): Promise<GenerateImageAltTextOutput> {
  return generateImageAltTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImageAltTextPrompt',
  input: {schema: GenerateImageAltTextInputSchema},
  output: {schema: GenerateImageAltTextOutputSchema},
  prompt: `You are an expert in generating concise and descriptive alt text for images.

  Given the following image, generate alt text that is:
  - Descriptive: Accurately describes the visual content of the image.
  - Concise: Keeps the alt text brief and to the point (under 100 characters).
  - SEO-friendly: Includes relevant keywords where appropriate.
  - Accessible: Ensures the alt text is helpful for users with visual impairments.

  Image: {{media url=photoDataUri}}

  Alt Text: `,
});

const generateImageAltTextFlow = ai.defineFlow(
  {
    name: 'generateImageAltTextFlow',
    inputSchema: GenerateImageAltTextInputSchema,
    outputSchema: GenerateImageAltTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
