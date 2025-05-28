import { log } from 'crawlee';
import { client } from './orchestrator.js';
import type { State, StateAnnotation } from './state.js';
import type { TikTokDatasetItem } from './types.js';

export const TIKTOK_USER_SEARCH_NODE_NAME = 'tiktok-user-search';
export function performTikTokUserSearch() {
    return async (state: State): Promise<typeof StateAnnotation.Update> => {
        log.info(`[${TIKTOK_USER_SEARCH_NODE_NAME}] Running graph node.`);

        const run = await client.actor('clockworks/tiktok-scraper').call(
            TIKTOK_USER_SEARCH_NODE_NAME,
            {
                searchQueries: state.searchTermsToScrape,
                resultsPerPage: 20,
                maxProfilesPerQuery: 100,
            },
        );

        const items = (await client.dataset(run.defaultDatasetId).listItems({ clean: true })).items as TikTokDatasetItem[];
        const scrapedProfiles: Record<string, TikTokDatasetItem[]> = items.reduce((acc, item) => {
            if (!acc[item.authorMeta.name]) {
                acc[item.authorMeta.name] = [];
            }
            acc[item.authorMeta.name].push(item);
            return acc;
        }, {} as Record<string, TikTokDatasetItem[]>);
        return {
            scrapedProfiles,
            profilesToEvaluate: {
                append: Object.keys(scrapedProfiles),
            },
        };
    };
}
