import { StateGraph } from '@langchain/langgraph';
import { StateAnnotation } from './state.js';
import { getTikTokProfile } from './nodes/apify/get-profile-info.js';
import { performTikTokUserSearch } from './nodes/apify/user-search.js';
import { askLlmForQueries } from './nodes/llm/ask-for-queries.js';
import { evaluateProfiles } from './nodes/llm/evaluate-profile.js';
import { GET_TIKTOK_PROFILE_NODE_NAME, TIKTOK_USER_SEARCH_NODE_NAME, ASK_FOR_QUERIES_NODE_NAME, EVALUATE_PROFILES_NODE_NAME } from '../consts.js';

export function initializeGraph() {
    return new StateGraph(StateAnnotation)
        .addNode(GET_TIKTOK_PROFILE_NODE_NAME, getTikTokProfile())
        .addNode(EVALUATE_PROFILES_NODE_NAME, evaluateProfiles())
        .addNode(TIKTOK_USER_SEARCH_NODE_NAME, performTikTokUserSearch())
        .addConditionalEdges('__start__', (state) => {
            const nextEdges = [];
            if (state.profilesToEvaluate.length > 0) {
                nextEdges.push(GET_TIKTOK_PROFILE_NODE_NAME);
            } else {
                nextEdges.push(ASK_FOR_QUERIES_NODE_NAME);
            }
            return nextEdges;
        })
        .addEdge(GET_TIKTOK_PROFILE_NODE_NAME, EVALUATE_PROFILES_NODE_NAME)
        // Recursive call to LLM if there are more profiles to evaluate
        .addConditionalEdges(EVALUATE_PROFILES_NODE_NAME, (state) => {
            if (state.profilesToLlm.length > 0) {
                return EVALUATE_PROFILES_NODE_NAME;
            }
            return '__end__';
        })
        .addNode(ASK_FOR_QUERIES_NODE_NAME, askLlmForQueries())
        .addEdge(ASK_FOR_QUERIES_NODE_NAME, TIKTOK_USER_SEARCH_NODE_NAME)
        .addEdge(TIKTOK_USER_SEARCH_NODE_NAME, EVALUATE_PROFILES_NODE_NAME)
        .compile();
}
