import { Annotation } from '@langchain/langgraph';
import type { TikTokDatasetItem } from './types.js';

export const StateAnnotation = Annotation.Root({
    profilesToEvaluate: Annotation<string[], {
        append?: string[],
        remove?: string[],
    }>({
        reducer: (
            state,
            update,
        ) => {
            const newState = new Set(state);
            const { append = [], remove = [] } = update;
            append.forEach((item) => newState.add(item));
            remove.forEach((item) => newState.delete(item));
            return Array.from(newState);
        },
        default: () => [],
    }),
    scrapedProfiles: Annotation<Record<string, TikTokDatasetItem[]>>(),
    influencerDescription: Annotation<string>(),
    mock: Annotation<boolean>(),
});
export type State = typeof StateAnnotation.State;
