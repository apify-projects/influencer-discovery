import { Annotation } from '@langchain/langgraph';
import type { TikTokDatasetItem } from './types.js';

const arrayReducer = <T>() => (
    state: T[],
    update: {
        append?: T[],
        remove?: T[],
    },
) => {
    const newState = new Set(state);
    const { append = [], remove = [] } = update;
    append.forEach((item) => newState.add(item));
    remove.forEach((item) => newState.delete(item));
    return Array.from(newState);
};
export const StateAnnotation = Annotation.Root({
    profilesToEvaluate: Annotation<string[], {
        append?: string[],
        remove?: string[],
    }>({
        reducer: arrayReducer<string>(),
        default: () => [],
    }),
    scrapedProfiles: Annotation<Record<string, TikTokDatasetItem[]>, Record<string, TikTokDatasetItem[]>>({
        reducer: (state, update) => {
            const newState = { ...state };
            Object.entries(update).forEach(([key, value]) => {
                if (value === undefined) {
                    delete newState[key];
                } else {
                    newState[key] = value;
                }
            });
            return newState;
        },
        default: () => ({}),
    }),
    influencerDescription: Annotation<string>(),
    searchTermsToScrape: Annotation<string[], {
        append?: string[],
        remove?: string[],
    }>({
        reducer: arrayReducer<string>(),
        default: () => [],
    }),
});

export type State = typeof StateAnnotation.State;
