import { log } from 'crawlee';
import { client } from './orchestrator.js';
import type { State, StateAnnotation } from './state.js';
import type { TikTokDatasetItem } from './types.js';

export const TIKTOK_USER_SEARCH_NODE_NAME = 'tiktok-user-search';
export function performTikTokUserSearch() {
    return async (state: State): Promise<typeof StateAnnotation.Update> => {
        log.info(`[${TIKTOK_USER_SEARCH_NODE_NAME}] Running graph node.`);

        let run;
        if (state.mock) {
            run = await client.run('nyevW470e0sKvzw9T').get();
        } else {
            run = await client.actor('clockworks/tiktok-scraper').call(
                TIKTOK_USER_SEARCH_NODE_NAME,
                {
                    searchQueries: state.searchTermsToScrape,
                    resultsPerPage: 5,
                    maxProfilesPerQuery: 50,
                    searchSection: '/user',
                },
            );
        }

        const items = (await client.dataset(run!.defaultDatasetId).listItems({ clean: true })).items as TikTokDatasetItem[];
        const scrapedProfiles: Record<string, TikTokDatasetItem[]> = items.reduce((acc, item) => {
            if (!item.authorMeta || !item.videoMeta) {
                return acc;
            }
            if (!acc[item.authorMeta.name]) {
                acc[item.authorMeta.name] = [];
            }
            acc[item.authorMeta.name].push(item);
            return acc;
        }, {} as Record<string, TikTokDatasetItem[]>);
        return {
            oldSearchTermsToScrape: {
                append: state.searchTermsToScrape,
            },
            searchTermsToScrape: {
                remove: state.searchTermsToScrape,
            },
            scrapedProfiles,
            profilesToLlm: {
                append: Object.keys(scrapedProfiles),
            },
        };
    };
}
