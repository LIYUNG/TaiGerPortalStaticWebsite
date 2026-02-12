import { useMemo } from 'react';
import { Card, Chip, IconButton, Link, Typography } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpIcon from '@mui/icons-material/Help';
import {
    isProgramDecided,
    isProgramSubmitted,
    ProfileNameType
} from '@taiger-common/core';
import { DocumentStatusType } from '@taiger-common/model';

import { COLORS, FILE_MISSING_SYMBOL, FILE_OK_SYMBOL } from '@utils/contants';
import { MuiDataGrid } from '../MuiDataGrid';
import type { MuiDataGridColumn } from '../MuiDataGrid';
import {
    areProgramsDecidedMoreThanContract,
    check_academic_background_filled,
    check_all_decided_applications_submitted,
    check_english_language_Notneeded,
    check_english_language_passed,
    check_german_language_Notneeded,
    check_german_language_passed,
    check_if_there_is_german_language_info,
    check_student_needs_uni_assist,
    getNextProgramDayleft,
    getNextProgramDeadline,
    getNextProgramName,
    getNextProgramStatus,
    isCVFinished,
    isEnglishLanguageInfoComplete,
    isLanguageInfoComplete,
    is_all_uni_assist_vpd_uploaded,
    is_cv_assigned,
    needUpdateCourseSelection,
    numApplicationsDecided,
    numApplicationsSubmitted,
    num_uni_assist_vpd_needed,
    num_uni_assist_vpd_uploaded,
    prepTaskStudent,
    to_register_application_portals,
    has_admissions
} from '@pages/Utils/util_functions';
import DEMO from '@store/constant';
import { green, grey } from '@mui/material/colors';
import { useTranslation } from 'react-i18next';
import type { IStudentResponse } from '@/api/types';

export interface TransformedStudentRow {
    id: string;
    firstname_lastname: string;
    applying_program_count?: number;
    year_semester: string;
    student?: Record<string, unknown>;
    attributesJoined?: string;
    target_degree: string;
    isGraduated: string;
    academic_background?: Record<string, unknown>;
    isMissingBaseDocs: boolean;
    CV: string;
    ML: string;
    RL: string;
    Essay: string;
    Portals: string;
    uniassist: string;
    total_base_docs_needed: number;
    isEnglishPassed?: boolean;
    isGermanPassed?: boolean;
    program_selection: string;
    application: string;
    nextProgram?: string;
    nextProgramDeadline?: string;
    nextProgramDayleft?: string | number;
    nextProgramStatus?: string;
    survey: string;
    basedocument: string;
    total_accepted_base_docs_needed: number;
    courseAnalysis?: string;
    num_apps_decided: number;
    num_apps_closed: number;
    areProgramsAllDecided?: boolean;
    is_All_Applications_Submitted?: boolean;
    isCVFinished_b?: boolean;
    isCVAssigned?: boolean;
    is_uni_assist_needed?: boolean;
    isall_uni_assist_vpd_uploaded?: boolean;
    numb_uni_assist_vpd_needed?: number;
    numb_uni_assist_vpd_uploaded?: number;
    expected_application_year?: string;
    expected_application_semster?: string;
    openofferreject: string;
    attributes?: Array<{ _id?: string; name?: string; value?: string }>;
    agents?: Array<{ _id?: string; firstname?: string }>;
    editors?: Array<{ _id?: string; firstname?: string }>;
}

const transform = (
    stds: IStudentResponse[] | null | undefined,
    riskOnly = false
): TransformedStudentRow[] => {
    const transformedStudents: TransformedStudentRow[] = [];
    if (!stds || !Array.isArray(stds)) {
        return [];
    }

    for (const student of stds) {
        const keys = Object.keys(ProfileNameType);
        const object_init: Record<string, string> = {};
        for (let i = 0; i < keys.length; i++) {
            object_init[keys[i]] = DocumentStatusType.Missing;
        }

        if (student.profile) {
            student.profile.forEach(
                (item: { name: string; status?: string }) => {
                    object_init[item.name] = item.status ?? '';
                }
            );
        }
        let isMissingBaseDocs = false;
        let total_base_docs_needed = 0;
        let total_accepted_base_docs_needed = 0;
        for (let i = 0; i < keys.length; i += 1) {
            if (object_init[keys[i]] !== DocumentStatusType.NotNeeded) {
                total_base_docs_needed += 1;
            }
            if (
                object_init[keys[i]] === DocumentStatusType.Accepted &&
                object_init[keys[i]] !== DocumentStatusType.NotNeeded
            ) {
                total_accepted_base_docs_needed += 1;
            }
        }
        isMissingBaseDocs =
            total_base_docs_needed > total_accepted_base_docs_needed;

        const isEnglishPassed = check_english_language_passed(
            student.academic_background
        );
        const isGermanPassed = check_german_language_passed(
            student.academic_background
        );
        const isSurveyCompleted = check_academic_background_filled(
            student.academic_background
        );
        const num_apps_decided = numApplicationsDecided(student);
        const num_apps_closed = numApplicationsSubmitted(student);
        const areProgramsAllDecided =
            areProgramsDecidedMoreThanContract(student);
        const is_All_Applications_Submitted =
            check_all_decided_applications_submitted(student);
        const isCVFinished_b = isCVFinished(student);
        const isCVAssigned = is_cv_assigned(student);
        const is_uni_assist_needed = check_student_needs_uni_assist(student);
        const isall_uni_assist_vpd_uploaded =
            is_all_uni_assist_vpd_uploaded(student);
        const numb_uni_assist_vpd_needed = num_uni_assist_vpd_needed(student);
        const numb_uni_assist_vpd_uploaded =
            num_uni_assist_vpd_uploaded(student);
        const target_degree =
            student.application_preference?.target_degree ?? '';
        const expected_application_year =
            student.application_preference?.expected_application_date ?? '';
        const expected_application_semster =
            student.application_preference?.expected_application_semester ?? '';

        if (riskOnly) {
            const isStudentAtRisk =
                num_apps_closed > 0 &&
                num_apps_closed >= student.applying_program_count &&
                !has_admissions(student);
            if (!isStudentAtRisk) {
                continue;
            }
        }

        transformedStudents.push({
            ...prepTaskStudent(student),
            applying_program_count: student.applying_program_count,
            year_semester: `${expected_application_year || 'TBD'}/ ${
                expected_application_semster || 'TBD'
            }`,
            id: student._id.toString(),
            student,
            attributesJoined: student.attributes
                ?.map((attribute: { name: string }) => attribute.name)
                .join(' '),
            target_degree,
            isGraduated:
                student.academic_background?.university
                    ?.high_school_isGraduated === 'Yes'
                    ? student.academic_background?.university?.isGraduated ===
                      'Yes'
                        ? 'Yes'
                        : 'No'
                    : 'No',
            academic_background: student.academic_background,
            isMissingBaseDocs,
            CV: !isCVFinished_b
                ? isCVAssigned
                    ? 'In Progress'
                    : 'Not Created'
                : 'Done',
            ML: `${
                student.applications?.filter(
                    (application: Record<string, unknown>) =>
                        application.doc_modification_thread?.some(
                            (thread: {
                                doc_thread_id?: {
                                    isFinalVersion?: boolean;
                                    file_type?: string;
                                };
                            }) =>
                                isProgramDecided(application) &&
                                thread.doc_thread_id?.isFinalVersion &&
                                thread.doc_thread_id?.file_type === 'ML'
                        )
                ).length
            }/${
                student.applications.filter(
                    (application: Record<string, unknown>) =>
                        application.doc_modification_thread?.some(
                            (thread: {
                                doc_thread_id?: { file_type?: string };
                            }) =>
                                isProgramDecided(application) &&
                                thread.doc_thread_id?.file_type === 'ML'
                        )
                ).length
            }`,
            RL: `${
                student.applications.filter(
                    (application: Record<string, unknown>) =>
                        application.doc_modification_thread?.some(
                            (thread: {
                                doc_thread_id?: {
                                    isFinalVersion?: boolean;
                                    file_type?: string;
                                };
                            }) =>
                                isProgramDecided(application) &&
                                thread.doc_thread_id?.isFinalVersion &&
                                (thread.doc_thread_id?.file_type?.includes(
                                    'RL'
                                ) ||
                                    thread.doc_thread_id?.file_type?.includes(
                                        'Recommendation'
                                    ))
                        )
                ).length
            }/${
                student.applications.filter(
                    (application: Record<string, unknown>) =>
                        application.doc_modification_thread?.some(
                            (thread: {
                                doc_thread_id?: { file_type?: string };
                            }) =>
                                isProgramDecided(application) &&
                                (thread.doc_thread_id?.file_type?.includes(
                                    'RL'
                                ) ||
                                    thread.doc_thread_id?.file_type?.includes(
                                        'Recommendation'
                                    ))
                        )
                ).length
            }`,
            Essay: `${
                student.applications.filter(
                    (application: Record<string, unknown>) =>
                        application.doc_modification_thread?.some(
                            (thread: {
                                doc_thread_id?: {
                                    isFinalVersion?: boolean;
                                    file_type?: string;
                                };
                            }) =>
                                isProgramDecided(application) &&
                                thread.doc_thread_id?.isFinalVersion &&
                                thread.doc_thread_id?.file_type?.includes(
                                    'Essay'
                                )
                        )
                ).length
            }/${
                student.applications.filter(
                    (application: Record<string, unknown>) =>
                        application.doc_modification_thread?.some(
                            (thread: {
                                doc_thread_id?: { file_type?: string };
                            }) =>
                                isProgramDecided(application) &&
                                thread.doc_thread_id?.file_type?.includes(
                                    'Essay'
                                )
                        )
                ).length
            }`,
            Portals: `${
                student.applications?.length === 0
                    ? '-'
                    : to_register_application_portals(student)
                      ? 'Missing'
                      : 'Complete'
            }`,
            uniassist: `${
                is_uni_assist_needed
                    ? isall_uni_assist_vpd_uploaded
                        ? 'Done'
                        : `(${numb_uni_assist_vpd_uploaded}/${numb_uni_assist_vpd_needed}) Incomplete `
                    : '-'
            }`,
            total_base_docs_needed,
            isEnglishPassed,
            isGermanPassed,
            program_selection: `${areProgramsAllDecided ? 'O' : '-'}${num_apps_decided}/${student.applying_program_count}`,
            application: `${
                is_All_Applications_Submitted &&
                num_apps_closed >= student.applying_program_count
                    ? 'O'
                    : '-'
            }${num_apps_closed}/${student.applying_program_count}`,
            nextProgram: getNextProgramName(student),
            nextProgramDeadline: getNextProgramDeadline(student),
            nextProgramDayleft: getNextProgramDayleft(student),
            nextProgramStatus: getNextProgramStatus(student),
            survey: isSurveyCompleted ? 'Yes' : 'No',
            basedocument: `${total_accepted_base_docs_needed}/${total_base_docs_needed}`,
            total_accepted_base_docs_needed,
            courseAnalysis: needUpdateCourseSelection(student),
            num_apps_decided,
            num_apps_closed,
            areProgramsAllDecided,
            is_All_Applications_Submitted,
            isCVFinished_b,
            isCVAssigned,
            is_uni_assist_needed,
            isall_uni_assist_vpd_uploaded,
            numb_uni_assist_vpd_needed,
            numb_uni_assist_vpd_uploaded,
            expected_application_year,
            expected_application_semster,
            openofferreject: `${
                student.applications.filter(
                    (application: Record<string, unknown>) =>
                        isProgramSubmitted(application) &&
                        isProgramDecided(application) &&
                        application.admission === '-'
                ).length
            } | ${
                student.applications.filter(
                    (application: Record<string, unknown>) =>
                        isProgramSubmitted(application) &&
                        isProgramDecided(application) &&
                        application.admission === 'O'
                ).length
            } | ${
                student.applications.filter(
                    (application: Record<string, unknown>) =>
                        isProgramSubmitted(application) &&
                        isProgramDecided(application) &&
                        application.admission === 'X'
                ).length
            }`
        });
    }

    return transformedStudents;
};

export interface StudentOverviewTableProps {
    isLoading?: boolean;
    students?: unknown[] | null;
    riskOnly?: boolean;
}

const StudentOverviewTable = ({
    isLoading,
    students,
    riskOnly = false
}: StudentOverviewTableProps) => {
    const { t } = useTranslation();

    const memoizedColumns =
        useMemo((): MuiDataGridColumn<TransformedStudentRow>[] => {
            return [
                {
                    field: 'firstname_lastname',
                    headerName: t('First-/ Last Name', { ns: 'common' }),
                    align: 'left',
                    headerAlign: 'left',
                    width: 150,
                    renderCell: (params) => {
                        const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                            params.row.id,
                            DEMO.PROFILE_HASH
                        )}`;
                        return (
                            <Link
                                component={LinkDom}
                                target="_blank"
                                title={params.value as string}
                                to={linkUrl}
                                underline="hover"
                            >
                                {String(params.value)}
                            </Link>
                        );
                    }
                },
                {
                    field: 'year_semester',
                    headerName: t('Target Year /Semester', { ns: 'common' }),
                    align: 'left',
                    headerAlign: 'left',
                    width: 100
                },
                {
                    field: 'target_degree',
                    headerName: t('Target Degree', { ns: 'common' }),
                    align: 'left',
                    headerAlign: 'left',
                    width: 80
                },
                {
                    field: 'attributesJoined',
                    headerName: t('Attributes', { ns: 'common' }),
                    align: 'left',
                    headerAlign: 'left',
                    width: 80,
                    renderCell: (params) => {
                        const attrs = params.row.attributes;
                        if (!attrs?.length) return null;
                        return attrs.map((attribute) => (
                            <Chip
                                color={
                                    COLORS[
                                        attribute.value as keyof typeof COLORS
                                    ] as
                                        | 'default'
                                        | 'primary'
                                        | 'secondary'
                                        | 'error'
                                        | 'info'
                                        | 'success'
                                        | 'warning'
                                }
                                key={attribute._id}
                                label={attribute.name}
                                size="small"
                            />
                        ));
                    }
                },
                {
                    field: 'agents_joined',
                    headerName: t('Agents', { ns: 'common' }),
                    width: 80,
                    renderCell: (params) => {
                        const agents = params.row.agents;
                        if (!agents?.length) return null;
                        return agents.map((agent) => (
                            <Link
                                component={LinkDom}
                                key={agent._id?.toString()}
                                target="_blank"
                                title={agent.firstname}
                                to={DEMO.TEAM_AGENT_LINK(
                                    agent._id?.toString() ?? ''
                                )}
                                underline="hover"
                            >
                                {`${agent.firstname} `}
                            </Link>
                        ));
                    }
                },
                {
                    field: 'editors_joined',
                    headerName: t('Editors', { ns: 'common' }),
                    width: 80,
                    renderCell: (params) => {
                        const editors = params.row.editors;
                        if (!editors?.length) return null;
                        return editors.map((editor) => (
                            <Link
                                component={LinkDom}
                                key={editor._id?.toString()}
                                target="_blank"
                                title={editor.firstname}
                                to={DEMO.TEAM_EDITOR_LINK(
                                    editor._id?.toString() ?? ''
                                )}
                                underline="hover"
                            >
                                {`${editor.firstname} `}
                            </Link>
                        ));
                    }
                },
                {
                    field: 'isGraduated',
                    headerName: t('Graduated', { ns: 'common' }),
                    width: 70
                },
                {
                    field: 'program_selection',
                    headerName: t('Program Selection', { ns: 'common' }),
                    width: 100,
                    renderCell: (params) => {
                        const programSelection =
                            params.row.program_selection
                                ?.replaceAll('-', '')
                                .replaceAll('O', '') ?? '';
                        return (
                            <Link
                                component={LinkDom}
                                to={`${DEMO.STUDENT_APPLICATIONS_ID_LINK(params.row.id)}`}
                            >
                                <Typography>
                                    {params.row.areProgramsAllDecided ? (
                                        <IconButton>
                                            {FILE_OK_SYMBOL}
                                        </IconButton>
                                    ) : (
                                        <IconButton>
                                            {FILE_MISSING_SYMBOL}
                                        </IconButton>
                                    )}
                                    {params.row.num_apps_decided >
                                    (params.row.applying_program_count ?? 0) ? (
                                        <b>{programSelection}</b>
                                    ) : (
                                        programSelection
                                    )}
                                </Typography>
                            </Link>
                        );
                    }
                },
                {
                    field: 'application',
                    headerName: t('Application', { ns: 'common' }),
                    width: 100,
                    renderCell: (params) => {
                        const application =
                            params.row.application
                                ?.replaceAll('-', '')
                                .replaceAll('O', '') ?? '';
                        return (
                            <Link
                                component={LinkDom}
                                to={`${DEMO.STUDENT_APPLICATIONS_ID_LINK(params.row.id)}`}
                            >
                                <Typography>
                                    {params.row.is_All_Applications_Submitted &&
                                    params.row.num_apps_closed >=
                                        (params.row.applying_program_count ??
                                            0) ? (
                                        <IconButton>
                                            {FILE_OK_SYMBOL}
                                        </IconButton>
                                    ) : (
                                        <IconButton>
                                            {FILE_MISSING_SYMBOL}
                                        </IconButton>
                                    )}
                                    {application}
                                </Typography>
                            </Link>
                        );
                    }
                },
                {
                    field: 'nextProgram',
                    headerName: t('Next Program to apply', { ns: 'common' }),
                    width: 100
                },
                {
                    field: 'nextProgramDeadline',
                    headerName: t('Next Program deadline', { ns: 'common' }),
                    width: 100
                },
                {
                    field: 'nextProgramDayleft',
                    headerName: t('Next Program Days left', { ns: 'common' }),
                    width: 70
                },
                {
                    field: 'nextProgramStatus',
                    headerName: t('Next Program status', { ns: 'common' }),
                    width: 70
                },
                {
                    field: 'survey',
                    headerName: t('Survey', { ns: 'common' }),
                    width: 100,
                    renderCell: (params) => (
                        <Link
                            component={LinkDom}
                            style={{ textDecoration: 'none' }}
                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                params.row.id,
                                DEMO.PROFILE_HASH
                            )}`}
                        >
                            {String(params.value)}
                        </Link>
                    )
                },
                {
                    field: 'basedocument',
                    headerName: t('Documents', { ns: 'common' }),
                    width: 100,
                    renderCell: (params) => (
                        <Link
                            component={LinkDom}
                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                params.row.id,
                                DEMO.PROFILE_HASH
                            )}`}
                        >
                            {String(params.value)}
                        </Link>
                    )
                },
                {
                    field: 'Language',
                    headerName: t('Language', { ns: 'common' }),
                    width: 100,
                    renderCell: (params) => {
                        const bg = params.row.academic_background;
                        return !isLanguageInfoComplete(bg) ? (
                            <Link
                                component={LinkDom}
                                to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                    params.row.id,
                                    DEMO.PROFILE_HASH
                                )}`}
                            >
                                <Typography>No info</Typography>
                            </Link>
                        ) : (
                            <>
                                {isEnglishLanguageInfoComplete(bg) ? (
                                    <Link
                                        component={LinkDom}
                                        to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                            params.row.id,
                                            DEMO.SURVEY_HASH
                                        )}`}
                                    >
                                        E:
                                        {params.row.isEnglishPassed ? (
                                            <IconButton>
                                                <CheckCircleIcon
                                                    fontSize="small"
                                                    style={{
                                                        color: green[500]
                                                    }}
                                                    title={`complete ${(bg as { language?: { english_certificate?: string; english_score?: string } })?.language?.english_certificate} ${(bg as { language?: { english_certificate?: string; english_score?: string } })?.language?.english_score}`}
                                                />
                                            </IconButton>
                                        ) : (
                                            !check_english_language_Notneeded(
                                                bg
                                            ) && (
                                                <>
                                                    {FILE_MISSING_SYMBOL}
                                                    <HelpIcon
                                                        fontSize="small"
                                                        style={{
                                                            color: grey[400]
                                                        }}
                                                        title={`Expected Test Date ${(bg as { language?: { english_certificate?: string; english_test_date?: string } })?.language?.english_certificate} ${(bg as { language?: { english_test_date?: string } })?.language?.english_test_date}`}
                                                    />
                                                </>
                                            )
                                        )}
                                    </Link>
                                ) : null}
                                {check_if_there_is_german_language_info(bg) ? (
                                    <Link
                                        component={LinkDom}
                                        to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                            params.row.id,
                                            DEMO.SURVEY_HASH
                                        )}`}
                                    >
                                        D:
                                        {params.row.isGermanPassed ? (
                                            <IconButton>
                                                <CheckCircleIcon
                                                    fontSize="small"
                                                    style={{
                                                        color: green[500]
                                                    }}
                                                    title={`complete ${(bg as { language?: { german_certificate?: string; german_score?: string } })?.language?.german_certificate} ${(bg as { language?: { german_score?: string } })?.language?.german_score}`}
                                                />
                                            </IconButton>
                                        ) : (
                                            !check_german_language_Notneeded(
                                                bg
                                            ) && (
                                                <HelpIcon
                                                    fontSize="small"
                                                    style={{ color: grey[400] }}
                                                    title={`Expected Test Date${(bg as { language?: { german_certificate?: string; german_test_date?: string } })?.language?.german_certificate} ${(bg as { language?: { german_test_date?: string } })?.language?.german_test_date}`}
                                                />
                                            )
                                        )}
                                        {(
                                            bg as {
                                                language?: {
                                                    english_isPassed?: string;
                                                    german_isPassed?: string;
                                                };
                                            }
                                        )?.language?.english_isPassed ===
                                            '--' &&
                                        (
                                            bg as {
                                                language?: {
                                                    german_isPassed?: string;
                                                };
                                            }
                                        )?.language?.german_isPassed === '--'
                                            ? 'Not needed'
                                            : null}
                                    </Link>
                                ) : null}
                            </>
                        );
                    }
                },
                {
                    field: 'courseAnalysis',
                    headerName: t('Course Analysis', { ns: 'common' }),
                    width: 100,
                    renderCell: (params) => (
                        <Link
                            component={LinkDom}
                            to={`${DEMO.COURSES_INPUT_LINK(params.row.id)}`}
                        >
                            {String(params.value)}
                        </Link>
                    )
                },
                {
                    field: 'CV',
                    headerName: t('CV', { ns: 'common' }),
                    width: 100,
                    renderCell: (params) => (
                        <Link
                            component={LinkDom}
                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                params.row.id,
                                DEMO.CVMLRL_HASH
                            )}`}
                        >
                            {String(params.value)}
                        </Link>
                    )
                },
                {
                    field: 'ML',
                    headerName: t('ML', { ns: 'common' }),
                    width: 80,
                    renderCell: (params) => (
                        <Link
                            component={LinkDom}
                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                params.row.id,
                                DEMO.CVMLRL_HASH
                            )}`}
                        >
                            {String(params.value)}
                        </Link>
                    )
                },
                {
                    field: 'RL',
                    headerName: t('RL', { ns: 'common' }),
                    width: 80,
                    renderCell: (params) => (
                        <Link
                            component={LinkDom}
                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                params.row.id,
                                DEMO.CVMLRL_HASH
                            )}`}
                        >
                            {String(params.value)}
                        </Link>
                    )
                },
                {
                    field: 'Essay',
                    headerName: t('Essay', { ns: 'common' }),
                    width: 80,
                    renderCell: (params) => (
                        <Link
                            component={LinkDom}
                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                params.row.id,
                                DEMO.CVMLRL_HASH
                            )}`}
                        >
                            {String(params.value)}
                        </Link>
                    )
                },
                {
                    field: 'Portals',
                    headerName: t('Portals', { ns: 'common' }),
                    width: 100,
                    renderCell: (params) => (
                        <Link
                            component={LinkDom}
                            to={`${DEMO.PORTALS_MANAGEMENT_STUDENTID_LINK(params.row.id)}`}
                        >
                            {String(params.value)}
                        </Link>
                    )
                },
                {
                    field: 'uniassist',
                    headerName: t('Uni-Assist', { ns: 'common' }),
                    width: 100,
                    renderCell: (params) => (
                        <Link
                            component={LinkDom}
                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                params.row.id,
                                DEMO.UNIASSIST_HASH
                            )}`}
                        >
                            {String(params.value)}
                        </Link>
                    )
                },
                {
                    field: 'openofferreject',
                    headerName: t('open/offer/reject', { ns: 'common' }),
                    width: 100
                }
            ];
        }, [t]);

    const rows = transform(students, riskOnly);

    return (
        <Card>
            <MuiDataGrid
                autoHeight={true}
                columns={memoizedColumns}
                isLoading={isLoading}
                rows={rows}
            />
        </Card>
    );
};

export default StudentOverviewTable;
