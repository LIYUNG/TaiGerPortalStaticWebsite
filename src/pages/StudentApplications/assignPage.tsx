import { useParams } from 'react-router-dom';

import Loading from '@components/Loading/Loading';
import { useApplicationStudent } from '@hooks/useApplicationStudent';
import StudentApplicationsAssignProgramlistPage from './StudentApplicationsAssignProgramlistPage';

const StudentApplicationsAssignPage = () => {
    const { student_id } = useParams<{ student_id: string }>();
    const {
        data: student,
        isLoading,
        isError
    } = useApplicationStudent(student_id);

    if (isLoading) return <Loading />;
    if (isError || !student) return null;

    return <StudentApplicationsAssignProgramlistPage student={student} />;
};

export default StudentApplicationsAssignPage;
