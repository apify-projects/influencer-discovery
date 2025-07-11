import { log } from 'crawlee';
import { orchestrator } from '../../../orchestrator.js';
import type { State, StateAnnotation } from '../../state.js';
import type { TikTokDatasetItem } from '../../../types.js';
import { GET_TIKTOK_PROFILE_NODE_NAME, MOCK_GET_PROFILE_INFO_RUN_ID } from '../../../consts.js';

export function getTikTokProfile() {
    return async (state: State): Promise<typeof StateAnnotation.Update> => {
        log.info(`[${GET_TIKTOK_PROFILE_NODE_NAME}] Collecting TikTok profiles information.`);
        const client = await orchestrator.apifyClient();

        let run;
        if (state.mock) {
            run = await client.run(MOCK_GET_PROFILE_INFO_RUN_ID).get();
        } else {
            run = await client.actor('clockworks/tiktok-scraper').call(
                GET_TIKTOK_PROFILE_NODE_NAME, {
                    profiles: state.profilesToEvaluate,
                    resultsPerPage: 1,
                },
            );
        }
        const items = (await client.dataset(run!.defaultDatasetId).listItems({ clean: true })).items as TikTokDatasetItem[];
        const scrapedProfiles: Record<string, TikTokDatasetItem[]> = {};

        // Avoid collecting error items
        for (const profileName of state.profilesToEvaluate) {
            scrapedProfiles[profileName] = items.filter((item) => profileName === item.input);
        }

        return {
            scrapedProfiles,
            profilesToLlm: {
                append: state.profilesToEvaluate,
            },
            profilesToEvaluate: {
                remove: state.profilesToEvaluate,
            },
        };
    };
}
