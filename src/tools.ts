import { log } from 'crawlee';
import { client } from './orchestrator.js';
import type { State } from './state.js';

export function getTikTokProfile() {
    return async (state: State) => {
        const nodeName = 'tiktok-profile';
        log.info(`[${nodeName}] Running graph node.`);

        const run = await client.actor('clockworks/tiktok-scraper').call(
            nodeName, {
                profiles: state.profilesToEvaluate,
                resultsPerPage: 100,
            },
        );

        const { items } = await client.dataset(run.defaultDatasetId).listItems({ clean: true });
        const scrapedProfiles: Record<string, any> = {};
        for (const profileName of state.profilesToEvaluate) {
            scrapedProfiles[profileName] = items.filter((item) => item.authorMeta.name === profileName);
        }
        return { scrapedProfiles };
    };
}
