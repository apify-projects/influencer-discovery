import { StateGraph } from '@langchain/langgraph';
import { StateAnnotation } from './state.js';
import { GET_TIKTOK_PROFILE_NODE_NAME, getTikTokProfile } from './nodes/apify/get-profile-info.js';
import { TIKTOK_USER_SEARCH_NODE_NAME, performTikTokUserSearch } from './nodes/apify/user-search.js';
import { ASK_LLM_FOR_QUERIES_NODE_NAME, askLlmForQueries } from './nodes/llm/ask-llm-for-queries.js';
import { evaluateProfiles } from './nodes/llm/evaluate-profile.js';

export function initializeGraph() {
    return new StateGraph(StateAnnotation)
        .addNode(GET_TIKTOK_PROFILE_NODE_NAME, getTikTokProfile())
        .addNode('evaluateProfiles', evaluateProfiles())
        .addNode(TIKTOK_USER_SEARCH_NODE_NAME, performTikTokUserSearch())
        .addConditionalEdges('__start__', (state) => {
            const nextEdges = [];
            if (state.profilesToEvaluate.length > 0) {
                nextEdges.push(GET_TIKTOK_PROFILE_NODE_NAME);
            } else {
                nextEdges.push(ASK_LLM_FOR_QUERIES_NODE_NAME);
            }
            return nextEdges;
        })
        .addEdge(GET_TIKTOK_PROFILE_NODE_NAME, 'evaluateProfiles')
        // Recursive call to LLM if there are more profiles to evaluate
        .addConditionalEdges('evaluateProfiles', (state) => {
            if (state.profilesToLlm.length > 0) {
                return 'evaluateProfiles';
            }
            return '__end__';
        })
        .addNode(ASK_LLM_FOR_QUERIES_NODE_NAME, askLlmForQueries())
        .addEdge(ASK_LLM_FOR_QUERIES_NODE_NAME, TIKTOK_USER_SEARCH_NODE_NAME)
        .addEdge(TIKTOK_USER_SEARCH_NODE_NAME, 'evaluateProfiles')
        .compile();
}
