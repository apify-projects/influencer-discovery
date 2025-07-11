import { log } from 'crawlee';
import { orchestrator } from '../../../orchestrator.js';
import type { State, StateAnnotation } from '../../state.js';
import type { TikTokDatasetItem } from '../../../types.js';
import { MOCK_USER_SEARCH_RUN_ID, TIKTOK_USER_SEARCH_NODE_NAME } from '../../../consts.js';

export function performTikTokUserSearch() {
    return async (state: State): Promise<typeof StateAnnotation.Update> => {
        log.info(`[${TIKTOK_USER_SEARCH_NODE_NAME}] Searching for influencer.`);
        const { profilesPerKeyword } = state;
        const client = await orchestrator.apifyClient();

        let run;
        if (state.mock) {
            run = await client.run(MOCK_USER_SEARCH_RUN_ID).get();
        } else {
            run = await client.actor('clockworks/tiktok-scraper').call(
                TIKTOK_USER_SEARCH_NODE_NAME,
                {
                    searchQueries: state.searchTermsToScrape,
                    resultsPerPage: 1,
                    maxProfilesPerQuery: profilesPerKeyword,
                    searchSection: '/user',
                },
            );
        }

        const items = (await client.dataset(run!.defaultDatasetId).listItems({ clean: true })).items as TikTokDatasetItem[];

        // Avoid collecting items without authorMeta or videoMeta
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
