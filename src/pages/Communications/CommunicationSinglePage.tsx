import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';

import Loading from '@components/Loading/Loading';
import CommunicationSinglePageBody from './CommunicationSinglePageBody';
import { getCommunicationQuery } from '@/api/query';
import { useQuery } from '@tanstack/react-query';

const CommunicationSinglePage = () => {
    const { studentId } = useParams();
    const { data, isLoading } = useQuery(getCommunicationQuery(studentId));

    if (isLoading) {
        return <Loading />;
    }

    return (
        <Box data-testid="communication_student_page">
            <CommunicationSinglePageBody loadedData={data} />
        </Box>
    );
};

export default CommunicationSinglePage;
