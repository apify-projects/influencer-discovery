import { Actor } from 'apify';
import { Orchestrator } from 'apify-orchestrator';

await Actor.init();

export const orchestrator = new Orchestrator({
    enableLogs: true,
    persistenceSupport: 'kvs',
    persistencePrefix: 'apify-orchestrator-',
    abortAllRunsOnGracefulAbort: true,
});

export const client = await orchestrator.apifyClient();
