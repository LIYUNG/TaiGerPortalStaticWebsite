import { useQuery } from '@tanstack/react-query';

import { getAllCourses } from '@/api';
import type { GetAllCoursesResponse, IAllCourse } from '@taiger-common/model';

/**
 * Fetches all courses from course database.
 */
export function useAllCourses() {
    const result = useQuery<GetAllCoursesResponse, Error, IAllCourse[]>({
        queryKey: ['all-courses/all'],
        queryFn: () => getAllCourses(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        select: (data) => data.data ?? []
    });

    return {
        ...result,
        queryKey: ['all-courses/all'] as const
    };
}
