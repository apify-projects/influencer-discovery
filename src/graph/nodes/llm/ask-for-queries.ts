import { ChatOpenAI } from '@langchain/openai';
import z from 'zod';
import { State, StateAnnotation } from '../../state.js';
import { askForQueriesSystemPrompt } from '../../../prompts.js';

export const askLlmForQueries = () => async (state: State): Promise<typeof StateAnnotation.Update> => {
    const model = new ChatOpenAI({
        model: 'o3',
        apiKey: process.env.APIKEY,
    });
    const { influencerDescription, generatedKeywords } = state;
    const result = await model
        .withStructuredOutput(
            z.object(
                {
                    searchQueries: z.array(
                        z.string().describe('The search query used to find profiles in TikTok user search.'),
                    ).length(generatedKeywords),
                }))
        .invoke([
            {
                role: 'system',
                content: askForQueriesSystemPrompt,
            },
            {
                role: 'user',
                content: `Task: generate ${generatedKeywords} queries for TikTok `
                    + `user search that will help me find the influencers fitting this description: `
                    + `"${influencerDescription}"`
                    + '\n\n'
                    + `The queries should be 4 words at most, whatever is best for the search.`,
            },
        ]);
    return {
        searchTermsToScrape: {
            append: result.searchQueries,
        },
    };
};
