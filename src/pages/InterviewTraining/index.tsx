import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as LinkDom, useNavigate } from 'react-router-dom';
import { Box, Button, Breadcrumbs, Link, Typography } from '@mui/material';
import {
    is_TaiGer_role,
    isProgramAdmitted,
    isProgramDecided,
    isProgramRejected
} from '@taiger-common/core';
import type {
    IEvent,
    IInterviewWithId,
    IUser,
    IUserWithId,
    IStudentResponse,
    IProgram,
    IProgramWithId
} from '@taiger-common/model';

import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { getMyInterviews, getAllInterviews } from '@/api';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import { convertDate, showTimezoneOffset } from '@utils/contants';
import { InterviewsTable } from './InterviewsTable';

import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { MRT_ColumnDef } from 'material-react-table';

interface InterviewTrainingState {
    error: string;
    isLoaded: boolean;
    data: IInterviewWithId[] | null;
    success: boolean;
    interviewslist: IInterviewWithId[];
    student?: IStudentResponse;
    program_id: string;
    category: string;
    available_interview_request_programs: { key: string; value: string }[];
    res_status: number;
    res_modal_message: string;
    res_modal_status: number;
}

const InterviewTraining = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [interviewTrainingState, setInterviewTrainingState] =
        useState<InterviewTrainingState>({
            error: '',
            isLoaded: false,
            data: null,
            success: false,
            interviewslist: [],
            program_id: '',
            category: '',
            available_interview_request_programs: [],
            res_status: 0,
            res_modal_message: '',
            res_modal_status: 0
        });

    const {
        res_status,
        isLoaded,
        res_modal_status,
        res_modal_message,
        interviewslist
    } = interviewTrainingState;

    useEffect(() => {
        if (is_TaiGer_role(user as IUser)) {
            getAllInterviews().then(
                (resp) => {
                    const { data, success } = resp.data;
                    const student = (resp.data as Record<string, unknown>)
                        .student as IStudentResponse | undefined;
                    const { status } = resp;
                    if (success) {
                        setInterviewTrainingState((prevState) => ({
                            ...prevState,
                            isLoaded: true,
                            interviewslist:
                                (data as unknown as IInterviewWithId[]) ?? [],
                            student,
                            success: success,
                            res_status: status
                        }));
                    } else {
                        setInterviewTrainingState((prevState) => ({
                            ...prevState,
                            isLoaded: true,
                            res_status: status
                        }));
                    }
                },
                (error) => {
                    setInterviewTrainingState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        error,
                        res_status: 500
                    }));
                }
            );
        } else {
            getMyInterviews().then(
                (resp) => {
                    const { data, success } = resp.data;
                    const student = (resp.data as Record<string, unknown>)
                        .student as IStudentResponse | undefined;
                    const { status } = resp;
                    if (success) {
                        const available_interview_request_programs =
                            student?.applications
                                ?.filter(
                                    (application) =>
                                        isProgramDecided(application) &&
                                        !isProgramAdmitted(application) &&
                                        !isProgramRejected(application) &&
                                        !(
                                            (data as unknown as IInterviewWithId[]) ||
                                            []
                                        ).find(
                                            (interview) =>
                                                (
                                                    interview.program_id as unknown as IProgramWithId
                                                )?._id?.toString() ===
                                                application.programId?._id?.toString()
                                        )
                                )
                                ?.map((application) => ({
                                    key:
                                        application.programId?._id?.toString() ??
                                        '',
                                    value: `${application.programId?.school ?? ''} ${application.programId?.program_name ?? ''} ${application.programId?.degree ?? ''} ${application.programId?.semester ?? ''}`
                                })) || [];
                        setInterviewTrainingState((prevState) => ({
                            ...prevState,
                            isLoaded: true,
                            interviewslist:
                                (data as unknown as IInterviewWithId[]) ?? [],
                            student,
                            available_interview_request_programs,
                            success: success,
                            res_status: status
                        }));
                    } else {
                        setInterviewTrainingState((prevState) => ({
                            ...prevState,
                            isLoaded: true,
                            res_status: status
                        }));
                    }
                },
                (error) => {
                    setInterviewTrainingState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        error,
                        res_status: 500
                    }));
                }
            );
        }
    }, [user]);

    const handleClick = () => {
        navigate(`${DEMO.INTERVIEW_ADD_LINK}`);
    };

    const ConfirmError = () => {
        setInterviewTrainingState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    TabTitle('Interview training');
    const columns: Array<MRT_ColumnDef<Record<string, unknown>>> = [
        {
            accessorKey: 'status',
            filterVariant: 'multi-select',
            header: t('Status', { ns: 'common' }),
            size: 180
        },
        {
            accessorKey: 'isDuplicate',
            filterVariant: 'select',
            filterSelectOptions: [
                { value: true, label: t('Yes', { ns: 'common' }) },
                { value: false, label: t('No', { ns: 'common' }) }
            ],
            filterFn: (row, id, filterValue) => {
                return row.getValue(id) === filterValue;
            },
            header: t('Duplicate', { ns: 'common' }),
            size: 150,
            Cell: ({ cell }) =>
                cell.getValue() ? <ErrorIcon color="warning" /> : ''
        },
        {
            accessorKey: 'surveySubmitted',
            filterVariant: 'select',
            filterSelectOptions: [
                { value: true, label: t('Closed', { ns: 'common' }) },
                { value: false, label: t('Pending', { ns: 'common' }) }
            ],
            filterFn: (row, id, filterValue) => {
                return row.getValue(id) === filterValue;
            },
            header: t('Survey', { ns: 'common' }),
            size: 150,
            Cell: ({ cell }) =>
                cell.getValue() ? (
                    <CheckCircleIcon color="success" />
                ) : (
                    <ErrorIcon color="error" />
                )
        },
        {
            accessorKey: 'firstname_lastname',
            header: t('First-/ Last Name', { ns: 'common' }),
            size: 200,
            Cell: (params) => {
                const { row } = params;
                const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                    row.original.student_id as string,
                    DEMO.PROFILE_HASH
                )}`;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        title={row.original.firstname_lastname as string}
                        to={linkUrl}
                        underline="hover"
                    >
                        {row.original.firstname_lastname as string}
                    </Link>
                );
            }
        },
        {
            accessorKey: 'trainer_name',
            header: t('Trainer', { ns: 'common' }),
            size: 150
        },
        {
            accessorKey: 'start',
            header: `${t('Training Time', { ns: 'interviews' })} (${
                Intl.DateTimeFormat().resolvedOptions().timeZone
            } ${showTimezoneOffset()})`,
            filterFn: 'contains',
            size: 280,
            Cell: (params) => {
                const { row } = params;
                return row.original.start as string;
            }
        },
        {
            accessorKey: 'interview_date',
            header: t('Official Interview Time', { ns: 'interviews' }),
            filterFn: 'contains',
            size: 220,
            Cell: (params) => {
                const { row } = params;
                return row.original.interview_date as string;
            }
        },
        {
            accessorKey: 'program_name',
            header: t('Interview', { ns: 'interviews' }),
            size: 400,
            Cell: (params) => {
                const { row } = params;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        title={row.original.program_name as string}
                        to={DEMO.INTERVIEW_SINGLE_LINK(
                            row.original.id as string
                        )}
                        underline="hover"
                    >
                        {row.original.program_name as string}
                    </Link>
                );
            }
        }
    ];
    const transform = (interviews: IInterviewWithId[]) => {
        const result: Record<string, unknown>[] = [];
        if (!interviews) {
            return [];
        }

        // Count occurrences of each student_id
        const studentIdCounts: Record<string, number> = {};
        for (const interview of interviews) {
            const studentId = (
                interview.student_id as unknown as IStudentResponse
            )._id;
            studentIdCounts[studentId] =
                (studentIdCounts[studentId] || 0) + 1;
        }

        for (const interview of interviews) {
            const studentId = (
                interview.student_id as unknown as IStudentResponse
            )._id;
            const eventStart = (
                interview.event_id as unknown as IEvent | undefined
            )?.start;
            const programId =
                interview.program_id as unknown as IProgram;
            const student =
                interview.student_id as unknown as IStudentResponse;
            result.push({
                ...interview,
                id: `${interview._id}`,
                start:
                    (eventStart &&
                        convertDate(eventStart ?? new Date())) ||
                    '',
                interview_date:
                    (interview.interview_date &&
                        convertDate(interview.interview_date)) ||
                    '',
                student_id: studentId,
                isDuplicate: studentIdCounts[studentId] > 1,
                trainer_name:
                    (
                        interview.trainer_id as unknown as IUserWithId[]
                    )
                        ?.map((trainer) => trainer.firstname)
                        ?.join(', ') || '',
                program_name: `${programId.school} ${programId.program_name} ${programId.degree} ${programId.semester}`,
                firstname_lastname: `${student.firstname} ${student.lastname}`
            });
        }
        return result;
    };
    // const memoizedColumns = useMemo(() => column, [column]);

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    const rows = isLoaded ? transform(interviewslist) : undefined;

    return (
        <Box>
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}

            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Typography color="text.primary">
                    {t('All Students', { ns: 'common' })}
                </Typography>
                <Typography color="text.primary">
                    {t('Interview Center', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <Box
                alignItems="center"
                display="flex"
                justifyContent="space-between"
                sx={{ my: 1 }}
            >
                <Typography variant="h6">
                    {is_TaiGer_role(user as IUser)
                        ? t('All Interviews', { ns: 'interviews' })
                        : t('My Interviews', { ns: 'interviews' })}
                </Typography>
                {/* Button on the right */}
                <Box>
                    {!is_TaiGer_role(user as IUser) &&
                    interviewTrainingState.available_interview_request_programs
                        ?.length > 0 ? (
                        <Button
                            color="primary"
                            onClick={handleClick}
                            sx={{ my: 1 }}
                            variant="contained"
                        >
                            {t('Add', { ns: 'common' })}
                        </Button>
                    ) : null}
                    {is_TaiGer_role(user as IUser) ? (
                        <Button
                            color="primary"
                            onClick={handleClick}
                            sx={{ my: 1 }}
                            variant="contained"
                        >
                            {t('Add', { ns: 'common' })}
                        </Button>
                    ) : null}
                </Box>
            </Box>
            <InterviewsTable
                columns={columns}
                data={rows}
                isLoading={!isLoaded}
            />
        </Box>
    );
};

export default InterviewTraining;
