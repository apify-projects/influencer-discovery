import { Actor, log } from 'apify';
import { Orchestrator } from 'apify-orchestrator';
import type { Input } from './types.js';
import { initializeGraph } from './graph/initalize-graph.js';

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

const orchestrator = new Orchestrator({
    enableLogs: true,
    hideSensitiveInformation: false,
    persistenceSupport: 'kvs',
    persistencePrefix: 'apify-orchestrator-',
    abortAllRunsOnGracefulAbort: true,
});
const apifyClient = await orchestrator.apifyClient();

const chain = initializeGraph(apifyClient);

await chain.invoke({
    profilesToEvaluate: { append: usernames },
    influencerDescription,
    mock,
    generatedKeywords,
    profilesPerKeyword,
});

await Actor.exit();

async function getInput(): Promise<Input> {
    const input = await Actor.getInput<Input>();
    if (!input) {
        throw new Error('No input provided');
    }
    return input;
}
