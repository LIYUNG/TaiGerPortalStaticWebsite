import { useParams } from 'react-router-dom';

import Loading from '@components/Loading/Loading';
import { useApplicationStudent } from '@hooks/useApplicationStudent';
import StudentApplicationsTableTemplate from './StudentApplicationsTableTemplate';

const StudentApplicationsIndividual = () => {
    const { student_id } = useParams<{ student_id: string }>();
    const {
        data: student,
        isLoading,
        isError
    } = useApplicationStudent(student_id);

    if (isLoading) return <Loading />;
    if (isError || !student) return null;

    return <StudentApplicationsTableTemplate student={student} />;
};

export default StudentApplicationsIndividual;
