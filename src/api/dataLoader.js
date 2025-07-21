import { defer, json } from 'react-router-dom';
import queryString from 'query-string';
import {
    getStudents,
    getArchivStudents,
    getStudentAndDocLinks,
    getMyAcademicBackground,
    getComplaintsTickets,
    getComplaintsTicket,
    getDistinctSchools,
    getCourseKeywordSets,
    getProgramRequirement,
    getProgramRequirements,
    getProgramsAndCourseKeywordSets,
    getCommunicationThread,
    getProgram,
    getAllOpenInterviews,
    getApplicationStudentV2,
    getActiveThreads
} from '.';
import { queryClient } from './client';
import {
    getAllCoursessQuery,
    getCommunicationQuery,
    getCoursessQuery,
    getProgramRequirementsQuery
} from './query';
import { file_category_const } from '../Demo/Utils/checking-functions';

export async function getStudentsLoader() {
    const response = await getStudents();
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response;
    }
}

export async function getAllCoursesLoader() {
    return queryClient.fetchQuery(getAllCoursessQuery());
}

export async function getCourseLoader({ params }) {
    const courseId = params.courseId;
    return queryClient.fetchQuery(getCoursessQuery(courseId));
}

export async function getActiveEssayThreadsLoader() {
    const response = await getActiveThreads(
        queryString.stringify({
            file_type: file_category_const.essay_required
        })
    );
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response;
    }
}

//

export async function CommunicationThreadLoader({ params }) {
    const student_id = params.student_id;
    const response = await getCommunicationThread(student_id);
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response.data;
    }
}

export function getCommunicationThreadLoader({ params }) {
    const studentId = params.studentId;
    return queryClient.fetchQuery(getCommunicationQuery(studentId));
    //  return defer({ data: CommunicationThreadLoader({ params }) });
}

//

export async function ComplaintTicketLoader({ params }) {
    const complaintTicketId = params.complaintTicketId;
    const response = await getComplaintsTicket(complaintTicketId);
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response.data.data;
    }
}

export function getComplaintTicketLoader({ params }) {
    return defer({ complaintTicket: ComplaintTicketLoader({ params }) });
}

//

export async function AllComplaintTicketsLoader() {
    const response = await getComplaintsTickets();
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response.data.data;
    }
}

export function getAllComplaintTicketsLoader() {
    return defer({ complaintTickets: AllComplaintTicketsLoader() });
}

//

export async function getArchivStudentsLoader() {
    const response = await getArchivStudents();
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response;
    }
}

export async function getStudentAndDocLinksLoader({ params }) {
    const studentId = params.studentId;
    const response = await getStudentAndDocLinks(studentId);
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response;
    }
}

export async function getApplicationStudentLoader({ params }) {
    const student_id = params.student_id;
    const response = await getApplicationStudentV2(student_id);
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response;
    }
}

export async function getMyAcademicBackgroundLoader() {
    const response = await getMyAcademicBackground();
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response;
    }
}

export async function getAllOpenInterviewsLoader() {
    const response = await getAllOpenInterviews();
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response;
    }
}

///

export async function DistinctSchoolsLoader() {
    const response = await getDistinctSchools();
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response.data.data;
    }
}

export function getDistinctSchoolsLoader() {
    return defer({ distinctSchools: DistinctSchoolsLoader() });
}

///

export async function CourseKeywordSetsLoader() {
    const response = await getCourseKeywordSets();
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response.data.data;
    }
}

export function getCourseKeywordSetsLoader() {
    return defer({ courseKeywordSets: CourseKeywordSetsLoader() });
}

///

export async function ProgramsAndCourseKeywordSetsLoader() {
    const response = await getProgramsAndCourseKeywordSets();
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response.data.data;
    }
}

export function getProgramsAndCourseKeywordSetsLoader() {
    return defer({
        programsAndCourseKeywordSets: ProgramsAndCourseKeywordSetsLoader()
    });
}

///

export async function ProgramRequirementLoader({ params }) {
    const requirementId = params.requirementId;
    const response = await getProgramRequirement(requirementId);
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response.data.data;
    }
}

export function getProgramRequirementLoader({ params }) {
    return defer({
        programRequirement: ProgramRequirementLoader({ params })
    });
}

///

export async function ProgramRequirementsLoader() {
    const response = await getProgramRequirements();
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response.data.data;
    }
}

export function getProgramRequirementsLoader() {
    return defer({ programRequirements: ProgramRequirementsLoader() });
}

export async function getProgramRequirementsV2Loader() {
    return queryClient.fetchQuery(getProgramRequirementsQuery());
}

///

export async function ProgramLoader({ params }) {
    const { programId } = params;

    const response = await getProgram(programId);
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response.data;
    }
}

export function getProgramLoader({ params }) {
    // { data, success, students, vc } = resp.data;
    return defer({ data: ProgramLoader({ params }) });
}

export async function getAllOpenInterviewLoader() {
    const response = await getAllOpenInterviews();
    if (response.status >= 400) {
        throw json(
            { message: response.statusText },
            { status: response.status }
        );
    } else {
        return response;
    }
}
