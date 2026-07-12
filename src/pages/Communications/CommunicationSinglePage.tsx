import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import type {
    ICommunicationWithId,
    IStudentResponse
} from '@taiger-common/model';

import Loading from '@components/Loading/Loading';
import CommunicationSinglePageBody from './CommunicationSinglePageBody';
import { getCommunicationQuery } from '@/api/query';
import { useQuery } from '@tanstack/react-query';

/** Body of GET /api/communications/:studentId (getCommunicationQuery is untyped). */
interface CommunicationThreadData {
    data: ICommunicationWithId[];
    student: IStudentResponse;
}

const CommunicationSinglePage = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const { data, isLoading } = useQuery(
        getCommunicationQuery(studentId ?? '')
    );

    if (isLoading) {
        return <Loading />;
    }

    return (
        <Box data-testid="communication_student_page">
            <CommunicationSinglePageBody
                loadedData={data as CommunicationThreadData}
            />
        </Box>
    );
};

export default CommunicationSinglePage;
