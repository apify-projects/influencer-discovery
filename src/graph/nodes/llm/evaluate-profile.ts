import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { Dataset, log } from 'apify';
import { State, StateAnnotation } from '../../state.js';
import { evaluateProfileSystemPrompt } from '../../../prompts.js';
import { TikTokDatasetItem } from '../../../types.js';
import { CHARGE_EVENT_NAMES, chargeEvent } from '../../../chargingManager.js';
import { EVALUATE_PROFILES_NODE_NAME } from '../../../consts.js';

/**
 * Number of profiles to evaluate in one batch.
 */
const BATCH_SIZE = 10;
const CONCURRENT_CALLS = 5;
export const evaluateProfiles = () => async (state: State): Promise<typeof StateAnnotation.Update> => {
    log.info(`[${EVALUATE_PROFILES_NODE_NAME}] Evaluating profiles.`);
    const model = new ChatOpenAI({
        model: 'o3',
        apiKey: process.env.APIKEY,
    });
    const { influencerDescription, scrapedProfiles, profilesToLlm } = state;
    const profileNameBatches = [];
    for (let i = 0, j = 0; i < profilesToLlm.length && j < CONCURRENT_CALLS; i += BATCH_SIZE, j++) {
        profileNameBatches.push(profilesToLlm.slice(i, i + BATCH_SIZE));
    }
    const scrapedProfilesToEvaluateInBatches = profileNameBatches.map((profileNames) => profileNames.map((profileUrl) => {
        const profile = scrapedProfiles[profileUrl];
        return profile;
    }))
        .filter((profile) => profile !== undefined);
    const result = await model
        .withStructuredOutput(
            z.object(
                {
                    evaluatedProfiles: z.array(
                        z.object({
                            // TODO: specify under what key/where it is provided
                            profile: z.string().describe('The profile handle, as provided in the input.'),
                            profileUrl: z.string().describe('The url of the profile on TikTok'),
                            engagement: z.number().describe(
                                `The engagement rate of the influencer calculated like this: (total engagement / total followers) `
                                + `x 100, where total engagement = reactions + shares + comments`,
                            ),
                            averagePostPerWeek: z.number().describe(`How many videos per week are posted by the influencer.`),
                            country: z.string().describe(`The nationality of the influencer, where do they post from.`),
                            fit: z.number().describe(`How well the profile fits the influencer description.`),
                            fitDescription: z.string().describe('Why such a fit score was given.'),
                        }),
                    ),
                }))
        .batch(scrapedProfilesToEvaluateInBatches.map((scrapedProfilesToEvaluate) => [
            {
                role: 'system',
                content: evaluateProfileSystemPrompt,
            },
            {
                role: 'user',
                content: `Profile Information: ${scrapedProfilesToEvaluate.map((profile) => formatProfileInfoForLLM(profile)).join('\n\n')}`
                    + `Influencer Description: "${influencerDescription}"`,
            },
        ]));
    await Dataset.pushData(result.map((evaluation) => evaluation.evaluatedProfiles).flat());
    await chargeEvent({ eventName: CHARGE_EVENT_NAMES.PROFILE_OUTPUT, count: result.length });
    return {
        profilesToLlm: {
            remove: profileNameBatches.flat(),
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
