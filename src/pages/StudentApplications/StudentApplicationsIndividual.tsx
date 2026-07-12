import { useParams } from 'react-router-dom';

import Loading from '@components/Loading/Loading';
import { useApplicationStudent } from '@hooks/useApplicationStudent';
import StudentApplicationsTableTemplate, {
    type StudentApplicationsTableTemplateProps
} from './StudentApplicationsTableTemplate';

const StudentApplicationsIndividual = () => {
    const { student_id } = useParams<{ student_id: string }>();
    const {
        data: student,
        isLoading,
        isError
    } = useApplicationStudent(student_id);

    if (isLoading) return <Loading />;
    if (isError || !student) return null;

    // The template declares `student` with a `[key: string]: unknown` index
    // signature, which the `IStudentResponse` interface cannot satisfy
    // implicitly, even though it structurally provides every field it reads.
    return (
        <StudentApplicationsTableTemplate
            student={
                student as StudentApplicationsTableTemplateProps['student']
            }
        />
    );
};

export default StudentApplicationsIndividual;
