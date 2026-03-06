import { Navigate, useParams } from 'react-router-dom';
import { is_TaiGer_Student } from '@taiger-common/core';

import DEMO from '@store/constant';
import PortalCredentialsCard from './PortalCredentialsCard';
import { useAuth } from '@components/AuthProvider';

interface PortalCredentialPageProps {
    student_id?: string;
    showTitle?: boolean;
}

export default function PortalCredentialPage(props: PortalCredentialPageProps) {
    const { student_id } = useParams();
    const { user } = useAuth();
    if (!is_TaiGer_Student(user) && !student_id && !props.student_id) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    const studentId = student_id
        ? student_id
        : is_TaiGer_Student(user)
          ? user._id.toString()
          : props.student_id;
    return (
        <PortalCredentialsCard
            showTitle={props.showTitle | false}
            student_id={studentId}
            user={user}
        />
    );
}
