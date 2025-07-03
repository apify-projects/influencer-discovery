import { Orchestrator } from 'apify-orchestrator';

export const orchestrator = new Orchestrator({
    enableLogs: true,
    persistenceSupport: 'kvs',
    persistencePrefix: 'apify-orchestrator-',
    abortAllRunsOnGracefulAbort: true,
});
