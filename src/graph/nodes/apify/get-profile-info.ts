import { log } from 'crawlee';
import type { ExtendedApifyClient } from 'apify-orchestrator';
import type { State, StateAnnotation } from '../../state.js';
import type { TikTokDatasetItem } from '../../../types.js';
import { GET_TIKTOK_PROFILE_NODE_NAME, MOCK_GET_PROFILE_INFO_RUN_ID } from '../../../consts.js';
import { sanitizeScrapeResults } from './utility.js';

export function getTikTokProfile(apifyClient: ExtendedApifyClient) {
    return async (state: State): Promise<typeof StateAnnotation.Update> => {
        log.info(`[${GET_TIKTOK_PROFILE_NODE_NAME}] Collecting TikTok profiles information.`);

        let run;
        if (state.mock) {
            run = await apifyClient.run(MOCK_GET_PROFILE_INFO_RUN_ID).get();
        } else {
            run = await apifyClient.actor('clockworks/tiktok-scraper').call(
                GET_TIKTOK_PROFILE_NODE_NAME,
                {
                    profiles: state.profilesToEvaluate,
                    resultsPerPage: 1,
                },
            );
        }
        const items = (await apifyClient.dataset(run!.defaultDatasetId).listItems({ clean: true })).items as TikTokDatasetItem[];

        const scrapedProfiles = sanitizeScrapeResults(items);

        return {
            scrapedProfiles,
            profilesToLlm: {
                append: Object.keys(scrapedProfiles),
            },
            profilesToEvaluate: {
                remove: state.profilesToEvaluate,
            },
        };
    };
}
