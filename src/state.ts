import { Annotation } from '@langchain/langgraph';

export const StateAnnotation = Annotation.Root({
    profilesToEvaluate: Annotation<string[]>(),
    // TODO: use typing
    scrapedProfiles: Annotation<any[]>(),
    influencerDescription: Annotation<string>(),
});
export type State = typeof StateAnnotation.State;
