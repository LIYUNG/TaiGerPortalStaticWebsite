import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStudentAndDocLinksQuery } from '@/api/query';
import { SingleStudentPageMainContent } from './SingleStudentPage';
import { Box, CircularProgress } from '@mui/material';
import type {
    IAuditWithId,
    IBasedocumentationslinkWithId,
    IStudentResponse
} from '@taiger-common/model';

interface StudentDocLinksApiResponse {
    success: boolean;
    data: IStudentResponse;
    survey_link: { key: string; link: string }[];
    base_docs_link: IBasedocumentationslinkWithId[];
    audit: IAuditWithId[];
}

type StudentDocLinksAxiosLikeResponse = {
    data?: StudentDocLinksApiResponse;
};

export const FetchStudentLayer = () => {
    const { studentId } = useParams();

    // Fetch student and doc links using React Query
    const {
        data: response,
        isLoading,
        refetch
    } = useQuery(getStudentAndDocLinksQuery({ studentId: studentId ?? '' }));

    const axiosData = (response as StudentDocLinksAxiosLikeResponse | undefined)
        ?.data;

    if (isLoading || !axiosData) {
        return (
            <Box
                sx={{
                    width: window.innerWidth - 60,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    const { survey_link, base_docs_link, data, audit } = axiosData;
    return (
        <Box sx={{ width: window.innerWidth - 60 }}>
            <SingleStudentPageMainContent
                audit={audit}
                base_docs_link={base_docs_link}
                data={data}
                refetch={refetch}
                survey_link={survey_link}
            />
        </Box>
    );
};
