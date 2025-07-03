import { ChatOpenAI } from '@langchain/openai';
import z from 'zod';
import { State, StateAnnotation } from './state.js';
import { SITE_NAME_FOR_LLM } from './consts.js';

export const ASK_LLM_FOR_QUERIES_NODE_NAME = 'ask-llm-for-queries';
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
                content: `You are a helpful assistant that wants to find profiles on ${SITE_NAME_FOR_LLM} `
                    + `that are good influencers according to the description given by the user. `
                    + `For that purpose a TikTok search in "Users" section will be performed.`
                    + ` You generate search queries capable of yielding the best search results, according to the given description.`,
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
