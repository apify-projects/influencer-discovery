import { log } from 'crawlee';
import { client } from './orchestrator.js';
import type { State } from './state.js';
import type { StructuredProfileInformation, TikTokDatasetItem } from './types.js';

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

        const items = (await client.dataset(run.defaultDatasetId).listItems({ clean: true })).items as TikTokDatasetItem[];
        const scrapedProfiles: Record<string, StructuredProfileInformation> = {};
        for (const profileName of state.profilesToEvaluate) {
            const relatedDatasetItem = items.filter((item) => profileName === item.input);
            // TODO: perform error handling
            scrapedProfiles[profileName] = {
                originalUserInput: relatedDatasetItem[0].input,
                authorInformation: relatedDatasetItem[0].authorMeta,
                videosInformation: relatedDatasetItem.map((video) => {
                    return {
                        title: video.videoMeta.title,
                        diggCount: video.diggCount,
                        shareCount: video.shareCount,
                        playCount: video.playCount,
                        collectCount: video.collectCount,
                        commentCount: video.commentCount,
                    };
                }),
            };
        }
        return { scrapedProfiles };
    };
}
