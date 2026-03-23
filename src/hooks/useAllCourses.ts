import { useQuery } from '@tanstack/react-query';

import { getAllCourses } from '@/api';
import type { GetAllCoursesResponse } from '@taiger-common/model';

/**
 * Fetches all courses from course database.
 */
export function useAllCourses() {
    const result = useQuery<GetAllCoursesResponse>({
        queryKey: ['all-courses/all'],
        queryFn: () => getAllCourses(),
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    return {
        ...result,
        queryKey: ['all-courses/all'] as const
    };
}
