import { log } from 'crawlee';
import { client } from './orchestrator.js';
import type { State, StateAnnotation } from './state.js';
import type { TikTokDatasetItem } from './types.js';

export const GET_TIKTOK_PROFILE_NODE_NAME = 'tiktok-profile';
export function getTikTokProfile() {
    return async (state: State): Promise<typeof StateAnnotation.Update> => {
        log.info(`[${GET_TIKTOK_PROFILE_NODE_NAME}] Running graph node.`);

        let run;
        if (state.mock) {
            run = await client.run('QcXzDNmbUVtZagcYt').get();
        } else {
            run = await client.actor('clockworks/tiktok-scraper').call(
                GET_TIKTOK_PROFILE_NODE_NAME, {
                    profiles: state.profilesToEvaluate,
                    resultsPerPage: 100,
                },
            );
        }
        const items = (await client.dataset(run!.defaultDatasetId).listItems({ clean: true })).items as TikTokDatasetItem[];
        const scrapedProfiles: Record<string, TikTokDatasetItem[]> = {};
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
