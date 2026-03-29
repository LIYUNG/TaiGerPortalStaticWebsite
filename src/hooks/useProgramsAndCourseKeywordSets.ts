import { useQuery } from '@tanstack/react-query';

import { getProgramsAndCourseKeywordSets } from '@/api';
import type { ProgramsAndKeywordsData } from '@taiger-common/model';

const PROGRAMS_AND_KEYWORDS_QUERY_KEY = [
    'program-requirements',
    'programs-and-keywords'
] as const;

/**
 * Programs and course keyword sets for creating/editing program requirements.
 */
export function useProgramsAndCourseKeywordSets() {
    const result = useQuery<
        ProgramsAndKeywordsData,
        Error,
        ProgramsAndKeywordsData
    >({
        queryKey: PROGRAMS_AND_KEYWORDS_QUERY_KEY,
        queryFn: async () => {
            const body = await getProgramsAndCourseKeywordSets();
            return body.data ?? {};
        },
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    return {
        ...result,
        queryKey: PROGRAMS_AND_KEYWORDS_QUERY_KEY
    };
}
