import { StateGraph } from '@langchain/langgraph';
import { Actor, log } from 'apify';
import { ChatOpenAI } from '@langchain/openai';
import { StateAnnotation } from './state.js';
import { evaluateProfiles } from './evaluate-profile.js';
import { GET_TIKTOK_PROFILE_NODE_NAME, getTikTokProfile } from './tools.js';
import { performTikTokUserSearch, TIKTOK_USER_SEARCH_NODE_NAME } from './user-search.js';
import { ASK_LLM_FOR_QUERIES_NODE_NAME, askLlmForQueries } from './ask-llm-for-queries.js';
import type { Input } from './types.js';

await Actor.init();

const {
    influencerDescription,
    usernames = [],
    mock = false,
    generatedKeywords = 5,
    profilesPerKeyword = 10,
} = await getInput();

if (usernames.length > 0) {
    log.info(`Using the provided username. No other influencer will be searched on TikTok.`);
} else {
    log.info(`Generating keywords and looking for suitable influencer. Max number of influencer scraped: ${generatedKeywords * profilesPerKeyword}`);
}

const agentModel = new ChatOpenAI({
    model: 'o3',
    apiKey: process.env.APIKEY,
});

const chain = new StateGraph(StateAnnotation)
    .addNode(GET_TIKTOK_PROFILE_NODE_NAME, getTikTokProfile())
    .addNode('evaluateProfiles', evaluateProfiles(agentModel))
    .addNode(TIKTOK_USER_SEARCH_NODE_NAME, performTikTokUserSearch())
    .addEdge(GET_TIKTOK_PROFILE_NODE_NAME, 'evaluateProfiles')
    .addConditionalEdges('evaluateProfiles', (state) => {
        if (state.profilesToLlm.length > 0) {
            return 'evaluateProfiles';
        }
        return '__end__';
    })
    .addNode(ASK_LLM_FOR_QUERIES_NODE_NAME, askLlmForQueries(agentModel))
    .addEdge(ASK_LLM_FOR_QUERIES_NODE_NAME, TIKTOK_USER_SEARCH_NODE_NAME)
    .addEdge(TIKTOK_USER_SEARCH_NODE_NAME, 'evaluateProfiles')
    .addConditionalEdges('__start__', (state) => {
        const nextEdges = [];
        if (state.profilesToEvaluate.length > 0) {
            nextEdges.push(GET_TIKTOK_PROFILE_NODE_NAME);
        } else {
            nextEdges.push(ASK_LLM_FOR_QUERIES_NODE_NAME);
        }
        return nextEdges;
    })
    .compile();

await chain.invoke({
    profilesToEvaluate: { append: usernames },
    influencerDescription,
    mock,
    generatedKeywords,
    profilesPerKeyword,
});

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
await Actor.exit();

async function getInput(): Promise<Input> {
    const input = await Actor.getInput<Input>();
    if (!input) {
        throw new Error('No input provided');
    }
    return input;
}
