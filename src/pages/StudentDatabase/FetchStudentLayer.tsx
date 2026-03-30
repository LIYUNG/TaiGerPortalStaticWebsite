import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStudentAndDocLinksQuery } from '@/api/query';
import { SingleStudentPageMainContent } from './SingleStudentPage';
import { Box, CircularProgress } from '@mui/material';

export const FetchStudentLayer = () => {
    const { studentId } = useParams();

    // Fetch student and doc links using React Query
    const { data: response, isLoading, refetch } = useQuery(
        getStudentAndDocLinksQuery({ studentId: studentId ?? '' })
    );

    if (isLoading || !(response as any)?.data) {
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

    const apiData = (response as any).data;
    const { survey_link, base_docs_link, data, audit } = apiData;
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
