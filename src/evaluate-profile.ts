import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { Dataset } from 'apify';
import { State, StateAnnotation } from './state.js';
import { SITE_NAME_FOR_LLM } from './consts.js';
import { TikTokDatasetItem } from './types.js';

const FIT_SCALE = {
    0.2: 'not a fit at all',
    0.4: 'a poor fit',
    0.6: 'mediocre fit',
    0.8: 'a good fit',
    0.9: 'a great fit',
    1.0: 'a perfect fit',
};
const fitScaleMessage = Object.entries(FIT_SCALE)
    .map(([key, value], i, arr) => `from ${i > 0 ? arr[i - 1][0] : 0} to ${key} - ${value}`)
    .join(', ');

export const evaluateProfiles = (model: ChatOpenAI) => async (state: State): Promise<typeof StateAnnotation.Update> => {
    const { profilesToEvaluate, influencerDescription, scrapedProfiles } = state;
    const scrapedProfilesToEvaluate = profilesToEvaluate.map((profileUrl) => {
        const profile = scrapedProfiles[profileUrl];
        return profile;
    })
        .filter((profile) => profile !== undefined);
    const result = await model
        .withStructuredOutput(
            z.object(
                {
                    evaluatedProfiles: z.array(
                        z.object({
                            // TODO: specify under what key/where it is provided
                            profile: z.string().describe('The profile handle, as provided in the input'),
                            fit: z.number().describe(`How well the profile fits the influencer description: ${fitScaleMessage}.`),
                            fitDescription: z.string().describe('Why such a fit score was given.'),
                        }),
                    ),
                }))
        .invoke([
            {
                role: 'system',
                content: `You are a helpful assistant that determines whether a ${SITE_NAME_FOR_LLM} profile`
                    + ` is a good influencer according to the given description.`,
            },
            {
                role: 'user',
                content: `Profile informations: ${scrapedProfilesToEvaluate.map((profile) => {
                    return formatProfileInfoForLLM(profile);
                }).join('\n\n')}`
                    + '\n\n'
                    + `Task: assign a score to each profile determining how well it fits the following influencer description: `
                    + `"${influencerDescription}"`,
            },
        ]);
    await Dataset.pushData(result);
    return {
        profilesToEvaluate: {
            remove: scrapedProfilesToEvaluate.map((profile) => profile[0].input),
        },
    };
};

export const formatProfileInfoForLLM = (profileVideos: TikTokDatasetItem[]): string => {
    // TODO: consider formatting it more nicely than JSON.stringify
    return `Profile: ${JSON.stringify(
        profileVideos[0].authorMeta,
    )}. It has the following videos: \n${profileVideos.map((video) => `- ${JSON.stringify({
        collectCount: video.collectCount,
        commentCount: video.commentCount,
        diggCount: video.diggCount,
        playCount: video.playCount,
        shareCount: video.shareCount,
        title: video.videoMeta.title,
    })}`).join('\n')}`;
};
