import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getPortalCredentials, postPortalCredentials } from '@/api';
import type { ApiPayload } from '@/api/types';
import type {
    ApplicationId,
    GetPortalCredentialsResponse
} from '@taiger-common/model';

export const portalCredentialsQueryKey = (studentId: string) =>
    ['portal-credentials', studentId] as const;

export type UsePortalCredentialsOptions = {
    enabled?: boolean;
};

export type PostPortalCredentialsVariables = {
    applicationId: ApplicationId;
    credentials: ApiPayload;
};

/**
 * GET /api/portal-informations/:student_id — portal accounts for a student’s applications.
 * POST mutation updates credentials for one application and refreshes the list on API success.
 */
export function usePortalCredentials(
    studentId: string,
    options?: UsePortalCredentialsOptions
) {
    const enabled = (options?.enabled ?? true) && Boolean(studentId);
    const queryClient = useQueryClient();

    const result = useQuery<GetPortalCredentialsResponse, Error>({
        queryKey: portalCredentialsQueryKey(studentId),
        queryFn: () => getPortalCredentials(studentId),
        enabled,
        staleTime: 1000 * 60 * 2
    });

    const postCredentialsMutation = useMutation({
        mutationFn: ({
            applicationId,
            credentials
        }: PostPortalCredentialsVariables) =>
            postPortalCredentials(studentId, applicationId, credentials),
        onSuccess: (response) => {
            if (response.data.success) {
                void queryClient.invalidateQueries({
                    queryKey: portalCredentialsQueryKey(studentId)
                });
            }
        }
    });

    return {
        ...result,
        queryKey: portalCredentialsQueryKey(studentId),
        postCredentialsMutation
    };
}
