import { defer, json } from 'react-router-dom';
import type { Params } from 'react-router-dom';
import {
    getStudents,
    getArchivStudents,
    getMyAcademicBackground,
    getComplaintsTickets,
    getComplaintsTicket,
    getDistinctSchools,
    getProgramRequirement,
    getProgramRequirements,
    getAllOpenInterviews
} from '.';
import { queryClient } from './client';
import { getCoursessQuery, getProgramRequirementsQuery } from './query';

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

export async function getCourseLoader({ params }: { params: Params<string> }) {
    const courseId = params.courseId ?? '';
    return queryClient.fetchQuery(getCoursessQuery(courseId));
}

//

export async function ComplaintTicketLoader({
    params
}: {
    params: Params<string>;
}) {
    const complaintTicketId = params.complaintTicketId ?? '';
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

export function getComplaintTicketLoader({
    params
}: {
    params: Params<string>;
}) {
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

export async function ProgramRequirementLoader({
    params
}: {
    params: Params<string>;
}) {
    const requirementId = params.requirementId ?? '';
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

export function getProgramRequirementLoader({
    params
}: {
    params: Params<string>;
}) {
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

