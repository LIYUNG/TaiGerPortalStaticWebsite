import React from 'react';
import { useLoaderData } from 'react-router-dom';

import StudentApplicationsTableTemplate from './StudentApplicationsTableTemplate';
import Loading from '../../components/Loading/Loading';

const StudentApplicationsIndividual = () => {
    const {
        data: { data: student }
    } = useLoaderData();
    if (!student) {
        return <Loading />;
    }
    return <StudentApplicationsTableTemplate student={student} />;
};

export default StudentApplicationsIndividual;
