import { useQuery } from '@tanstack/react-query';

import { getAllCourses } from '@/api';
import type { GetAllCoursesResponse } from '@taiger-common/model';

/**
 * A course as the API actually returns it. `IAllCourse` is the Mongoose document
 * interface — it has no `_id` and requires fields the response leaves optional —
 * so rows must be typed off the response, not off the document.
 */
export type AllCourseItem = NonNullable<GetAllCoursesResponse['data']>[number];

/**
 * Fetches all courses from course database.
 */
export function useAllCourses() {
    const result = useQuery<GetAllCoursesResponse, Error, AllCourseItem[]>({
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
