// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/)
import { StateGraph } from '@langchain/langgraph';
import { Actor } from 'apify';
// Crawlee - web scraping and browser automation library (Read more at https://crawlee.dev)
import { ChatOpenAI } from '@langchain/openai';
import { StateAnnotation } from './state.js';
import { evaluateProfiles } from './evaluate-profile.js';
import { GET_TIKTOK_PROFILE_NODE_NAME, getTikTokProfile } from './tools.js';
import { performTikTokUserSearch, TIKTOK_USER_SEARCH_NODE_NAME } from './user-search.js';
import { ASK_LLM_FOR_QUERIES_NODE_NAME, askLlmForQueries } from './ask-llm-for-queries.js';
// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// note that we need to use `.js` even when inside TS files
// import { router } from './routes.js';

interface Input {
    influencerDescription: string;
    profiles: string[];
}

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init()
await Actor.init();

// Structure of input is defined in input_schema.json
const {
    influencerDescription,
    profiles = [],
} = await Actor.getInput<Input>() ?? {} as Input;

const agentModel = new ChatOpenAI({});

const chain = new StateGraph(StateAnnotation)
    .addNode(GET_TIKTOK_PROFILE_NODE_NAME, getTikTokProfile())
    .addNode('evaluateProfiles', evaluateProfiles(agentModel))
    .addNode(TIKTOK_USER_SEARCH_NODE_NAME, performTikTokUserSearch())
    .addEdge('__start__', GET_TIKTOK_PROFILE_NODE_NAME)
    .addEdge(GET_TIKTOK_PROFILE_NODE_NAME, 'evaluateProfiles')
    .addEdge('evaluateProfiles', '__end__')
    .addNode(ASK_LLM_FOR_QUERIES_NODE_NAME, askLlmForQueries(agentModel))
    .addEdge(ASK_LLM_FOR_QUERIES_NODE_NAME, TIKTOK_USER_SEARCH_NODE_NAME)
    .addEdge(TIKTOK_USER_SEARCH_NODE_NAME, 'evaluateProfiles')
    .addConditionalEdges('__start__', (state) => {
        const nextEdges = [ASK_LLM_FOR_QUERIES_NODE_NAME];
        if (state.profilesToEvaluate.length > 0) {
            nextEdges.push(GET_TIKTOK_PROFILE_NODE_NAME);
        }
        return nextEdges;
    })
    .compile();

await chain.invoke({
    profilesToEvaluate: { append: profiles },
    influencerDescription,
});

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
await Actor.exit();
