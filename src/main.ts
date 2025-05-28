// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/)
import { Annotation, StateGraph } from '@langchain/langgraph';
import { Actor } from 'apify';
// Crawlee - web scraping and browser automation library (Read more at https://crawlee.dev)
import { CheerioCrawler, Dataset } from 'crawlee';
import { ChatOpenAI } from '@langchain/openai';
import { Influencer } from './types.js';
import { StateAnnotation } from './state.js';
import { evaluateProfiles } from './evaluate-profile.js';
import { getTikTokProfile } from './tools.js';
// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// note that we need to use `.js` even when inside TS files
// import { router } from './routes.js';

interface Input {
    influencerDescription: string;
    profiles: string[];
    mock?: boolean;
}

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init()
await Actor.init();

// Structure of input is defined in input_schema.json
const {
    influencerDescription,
    profiles = [],
    mock = false,
} = await Actor.getInput<Input>() ?? {} as Input;

const agentModel = new ChatOpenAI();

const chain = new StateGraph(StateAnnotation)
    .addNode('getTikTokProfile', getTikTokProfile())
    .addNode('evaluateProfiles', evaluateProfiles(agentModel))
    .addEdge('__start__', 'getTikTokProfile')
    .addEdge('getTikTokProfile', 'evaluateProfiles')
    .addEdge('evaluateProfiles', '__end__')
    .compile();

await chain.invoke({
    profilesToEvaluate: { append: profiles },
    influencerDescription,
    mock,
});

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
await Actor.exit();
