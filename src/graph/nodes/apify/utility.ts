import type { ProfileInformation, TikTokDatasetItem } from '../../../types.js';

export function sanitizeScrapeResults(scrapeResults: TikTokDatasetItem[]): Record<string, ProfileInformation> {
    const sanitizedResults: Record<string, ProfileInformation> = {};

    scrapeResults.forEach((item) => {
        if (!item.authorMeta || !item.videoMeta) {
            return; // Skip items without necessary metadata
        }
        // This is aware of multiple videos, but ideally we want to send only one, to not overwhelm the AI
        if (!sanitizedResults[item.authorMeta.name]) {
            sanitizedResults[item.authorMeta.name] = {
                authorMeta: item.authorMeta,
                videos: [{
                    text: item.text,
                    diggCount: item.diggCount,
                    shareCount: item.shareCount,
                    playCount: item.playCount,
                    collectCount: item.collectCount,
                    commentCount: item.commentCount,
                }],
            };
        } else {
            sanitizedResults[item.authorMeta.name].videos.push({
                text: item.text,
                diggCount: item.diggCount,
                shareCount: item.shareCount,
                playCount: item.playCount,
                collectCount: item.collectCount,
                commentCount: item.commentCount,
            });
        }
    });

    return sanitizedResults;
}
