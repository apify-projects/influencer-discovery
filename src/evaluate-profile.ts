import { ChatOpenAI } from '@langchain/openai';
import { Dataset } from 'apify';
import { State, StateAnnotation } from './state.js';
import { SITE_NAME_FOR_LLM } from './consts.js';

export const evaluateProfiles = (model: ChatOpenAI) => async (state: State): Promise<typeof StateAnnotation.Update> => {
    const { profilesToEvaluate, influencerDescription, scrapedProfiles } = state;
    const scrapedProfilesToEvaluate = profilesToEvaluate.map((profileUrl) => {
        // TODO: map correctly once we have typing
        const profile = scrapedProfiles.find((p) => p.url === profileUrl);
        return profile;
    })
        .filter((profile) => profile !== undefined);
    const result = await model.invoke([
        {
            role: 'system',
            content: `You are a helpful assistant that determines whether a ${SITE_NAME_FOR_LLM} profile`
                + ` is a good influencer according to the given description.`,
        },
        {
            role: 'user',
            // TODO: do not stringify
            content: `Profile info: ${JSON.stringify(scrapedProfilesToEvaluate)}`
                // TODO: provide output JSON format
                + `Task: determine what profiles are influencer that fit the following description well: `
                + `"${influencerDescription}"`,
        },
    ]);
    // TODO: once we have output schema, fix this
    const parsedResult = JSON.parse(result.content.toString()) as {
        goodFitProfiles: string[];
    };
    // TODO: correct output format
    await Dataset.pushData(parsedResult.goodFitProfiles);
    return {
        profilesToEvaluate: {
            // TODO: use correct mapping
            remove: scrapedProfilesToEvaluate.map((profile) => profile.url),
        },
    };
};
