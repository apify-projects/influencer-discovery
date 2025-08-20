import { log } from 'crawlee';
import type { ExtendedApifyClient } from 'apify-orchestrator';
import type { State, StateAnnotation } from '../../state.js';
import type { TikTokDatasetItem } from '../../../types.js';
import { MOCK_USER_SEARCH_RUN_ID, TIKTOK_USER_SEARCH_NODE_NAME } from '../../../consts.js';
import { sanitizeScrapeResults } from './utility.js';

export function performTikTokUserSearch(apifyClient: ExtendedApifyClient) {
    return async (state: State): Promise<typeof StateAnnotation.Update> => {
        log.info(`[${TIKTOK_USER_SEARCH_NODE_NAME}] Searching for influencer.`);
        const { profilesPerKeyword } = state;

        let run;
        if (state.mock) {
            run = await apifyClient.run(MOCK_USER_SEARCH_RUN_ID).get();
        } else {
            run = await apifyClient.actor('clockworks/tiktok-scraper').call(
                TIKTOK_USER_SEARCH_NODE_NAME,
                {
                    searchQueries: state.searchTermsToScrape,
                    resultsPerPage: 1,
                    maxProfilesPerQuery: profilesPerKeyword,
                    searchSection: '/user',
                },
            );
        }

        const items = (await apifyClient.dataset(run!.defaultDatasetId).listItems({ clean: true })).items as TikTokDatasetItem[];

        const scrapedProfiles = sanitizeScrapeResults(items);

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
