import { Annotation } from '@langchain/langgraph';

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
    // TODO: use typing
    scrapedProfiles: Annotation<any[]>(),
    influencerDescription: Annotation<string>(),
});
export type State = typeof StateAnnotation.State;
