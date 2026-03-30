import { useState } from 'react';
import { Link as LinkDom, useLocation } from 'react-router-dom';
import {
    Tabs,
    Tab,
    Box,
    Typography,
    Link,
    Tooltip,
    Chip,
    Alert
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { is_TaiGer_role } from '@taiger-common/core';
import type { IUser } from '@taiger-common/model';

import {
    ATTRIBUTES,
    COLORS,
    THREADS_TABLE_REVERSED_TABS,
    THREADS_TABLE_TABS
} from '@utils/contants';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { useAuth } from '@components/AuthProvider';
import { CustomTabPanel, a11yProps } from '@components/Tabs';
import { useTranslation } from 'react-i18next';
import { MuiDataGrid, type MuiDataGridColumn } from '@components/MuiDataGrid';
import DEMO from '@store/constant';
import { APPROVAL_COUNTRIES } from '../Utils/util_functions';
import type { OpenTaskRow } from '@/api/types';

type CellParams = { value: unknown; row: OpenTaskRow; field: string };

interface TaskAttribute {
    _id: string;
    name: string;
    value: number;
}

export interface CVMLRLOverviewProps {
    handleFavoriteToggle: (id: string) => void;
    new_message_tasks?: OpenTaskRow[];
    fav_message_tasks?: OpenTaskRow[];
    followup_tasks?: OpenTaskRow[];
    pending_progress_tasks?: OpenTaskRow[];
    closed_tasks?: OpenTaskRow[];
    isLoaded?: boolean;
    success?: boolean;
}

const CVMLRLOverview = (props: CVMLRLOverviewProps) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { hash } = useLocation();
    const [tabTag, setTabTag] = useState(
        THREADS_TABLE_TABS[
            hash.replace('#', '') as keyof typeof THREADS_TABLE_TABS
        ] ?? 0
    );
    const handleTabChange = (
        _event: React.SyntheticEvent,
        newValue: number
    ) => {
        setTabTag(newValue);
        window.location.hash =
            THREADS_TABLE_REVERSED_TABS[
                newValue as keyof typeof THREADS_TABLE_REVERSED_TABS
            ];
    };

    const [cVMLRLOverviewState, setCVMLRLOverviewState] = useState({
        error: '',
        data: null,
        student_id: '',
        status: '', //reject, accept... etc
        res_status: 0,
        res_modal_message: '',
        res_modal_status: 0
    });

    const ConfirmError = () => {
        setCVMLRLOverviewState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    const { res_modal_status, res_modal_message } = cVMLRLOverviewState;

    const commonColumn: MuiDataGridColumn<OpenTaskRow>[] = [
        {
            field: 'aged_days',
            headerName: 'Aged days',
            minWidth: 80
        },
        {
            field: 'number_input_from_editors',
            headerName: t('Editor Feedback (#Messages/#Files)', {
                ns: 'common'
            }),
            width: 80
        },
        {
            field: 'number_input_from_student',
            headerName: t('Student Feedback (#Messages/#Files)', {
                ns: 'common'
            }),
            width: 80
        },
        {
            field: 'latest_reply',
            headerName: t('Latest Reply', { ns: 'common' }),
            width: 100
        },
        {
            field: 'updatedAt',
            headerName: t('Last Update', { ns: 'common' }),
            width: 100
        }
    ];

    const c2: MuiDataGridColumn<OpenTaskRow>[] = [
        {
            field: 'firstname_lastname',
            headerName: t('First-, Last Name', { ns: 'common' }),
            align: 'left',
            headerAlign: 'left',
            minWidth: 200,
            renderCell: (params: CellParams) => {
                const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                    String(params.row.student_id ?? ''),
                    DEMO.PROFILE_HASH
                )}`;
                const val = params.value as string;
                return (
                    <>
                        <IconButton
                            onClick={() =>
                                props.handleFavoriteToggle(params.row.id)
                            }
                        >
                            {params.row.flag_by_user_id?.includes(
                                user?._id.toString() ?? ''
                            ) ? (
                                <StarRoundedIcon
                                    color={val ? 'primary' : 'action'}
                                />
                            ) : (
                                <StarBorderRoundedIcon
                                    color={val ? 'primary' : 'action'}
                                />
                            )}
                        </IconButton>
                        <Link
                            component={LinkDom}
                            target="_blank"
                            title={val}
                            to={linkUrl}
                            underline="hover"
                        >
                            {val}
                        </Link>
                    </>
                );
            }
        },
        {
            field: 'deadline',
            headerName: t('Deadline', { ns: 'common' }),
            minWidth: 100
        },
        {
            field: 'days_left',
            headerName: t('Days left', { ns: 'common' }),
            minWidth: 80
        },
        {
            field: 'lang',
            headerName: t('Program Language', { ns: 'common' }),
            minWidth: 80
        },
        {
            field: 'status',
            headerName: t('Status', { ns: 'common' }),
            minWidth: 110,
            renderCell: (params: CellParams) => {
                const isLocked =
                    (params.row?.isApplicationLocked as boolean) === true ||
                    (params.row?.isProgramLocked as boolean) === true;
                return isLocked ? (
                    <Chip
                        color="warning"
                        icon={<LockOutlinedIcon fontSize="small" />}
                        label={t('Locked', { ns: 'common' })}
                        size="small"
                    />
                ) : (
                    <Chip
                        icon={<LockOpenIcon fontSize="small" />}
                        label={t('Unlocked', { ns: 'common' })}
                        size="small"
                        variant="outlined"
                    />
                );
            }
        },
        {
            field: 'document_name',
            headerName: t('Document name', { ns: 'common' }),
            minWidth: 380,
            renderCell: (params: CellParams) => {
                const linkUrl = `${DEMO.DOCUMENT_MODIFICATION_LINK(
                    params.row.thread_id as string
                )}`;
                // Check if program is from non-approval country
                const programId = params.row?.program_id as
                    | Record<string, unknown>
                    | undefined;
                const programCountry =
                    programId?.country || params.row?.country;
                const isNonApprovalCountry = programCountry
                    ? !APPROVAL_COUNTRIES.includes(
                          String(programCountry).toLowerCase()
                      )
                    : false;
                const attributes = (params.row?.attributes ??
                    []) as TaskAttribute[];
                const val = params.value as string;

                return (
                    <Box>
                        {attributes
                            .filter((attribute: TaskAttribute) =>
                                [1, 3, 9, 10, 11].includes(attribute.value)
                            )
                            .map((attribute: TaskAttribute) => (
                                <Tooltip
                                    key={attribute._id}
                                    title={`${attribute.name}: ${
                                        ATTRIBUTES[attribute.value - 1]
                                            .definition
                                    }`}
                                >
                                    <Chip
                                        color={COLORS[attribute.value]}
                                        data-testid={`chip-${attribute.name}`}
                                        label={attribute.name[0]}
                                        size="small"
                                    />
                                </Tooltip>
                            ))}
                        {isNonApprovalCountry && (
                            <Tooltip
                                title={t('Lack of experience country', {
                                    ns: 'common'
                                })}
                            >
                                <WarningAmberIcon
                                    fontSize="small"
                                    sx={{
                                        color: 'warning.main',
                                        ml: 0.5,
                                        mr: 0.5
                                    }}
                                />
                            </Tooltip>
                        )}
                        {
                            <>
                                <Link
                                    component={LinkDom}
                                    target="_blank"
                                    title={val}
                                    to={linkUrl}
                                    underline="hover"
                                >
                                    {params.row.file_type as string}{' '}
                                    {params.row.program_id
                                        ? ' - ' +
                                          (params.row.program_name as string) +
                                          ' - ' +
                                          (params.row.degree as string)
                                        : ''}
                                </Link>
                                <Typography
                                    color="text.secondary"
                                    sx={{ display: 'block', mt: 0.25 }}
                                    variant="caption"
                                >
                                    {params.row.school as string}
                                </Typography>
                            </>
                        }
                    </Box>
                );
            }
        },
        ...commonColumn
    ];

    const c2Student: MuiDataGridColumn<OpenTaskRow>[] = [
        {
            field: 'firstname_lastname',
            headerName: t('First-, Last Name', { ns: 'common' }),
            align: 'left',
            headerAlign: 'left',
            width: 200,
            renderCell: (params: CellParams) => {
                const val = params.value as string;
                return (
                    <>
                        <IconButton
                            onClick={() =>
                                props.handleFavoriteToggle(params.row.id)
                            }
                        >
                            {params.row.flag_by_user_id?.includes(
                                user?._id.toString() ?? ''
                            ) ? (
                                <StarRoundedIcon
                                    color={val ? 'primary' : 'action'}
                                />
                            ) : (
                                <StarBorderRoundedIcon
                                    color={val ? 'primary' : 'action'}
                                />
                            )}
                        </IconButton>
                        <span title={val}>{val}</span>
                    </>
                );
            }
        },
        {
            field: 'deadline',
            headerName: t('Deadline', { ns: 'common' }),
            width: 120
        },
        {
            field: 'days_left',
            headerName: t('Days left', { ns: 'common' }),
            width: 80
        },
        {
            field: 'status',
            headerName: t('Status', { ns: 'common' }),
            minWidth: 110,
            renderCell: (params: CellParams) => {
                const isLocked =
                    (params.row?.isApplicationLocked as boolean) === true ||
                    (params.row?.isProgramLocked as boolean) === true;
                return isLocked ? (
                    <Chip
                        color="warning"
                        icon={<LockOutlinedIcon fontSize="small" />}
                        label={t('Locked', { ns: 'common' })}
                        size="small"
                    />
                ) : (
                    <Chip
                        icon={<LockOpenIcon fontSize="small" />}
                        label={t('Unlocked', { ns: 'common' })}
                        size="small"
                        variant="outlined"
                    />
                );
            }
        },
        {
            field: 'document_name',
            headerName: t('Document name', { ns: 'common' }),
            width: 450,
            renderCell: (params: CellParams) => {
                const linkUrl = `${DEMO.DOCUMENT_MODIFICATION_LINK(
                    params.row.thread_id as string
                )}`;
                const val = params.value as string;

                return (
                    <Box>
                        <Link
                            component={LinkDom}
                            target="_blank"
                            title={val}
                            to={linkUrl}
                            underline="hover"
                        >
                            {params.row.file_type as string}{' '}
                            {params.row.program_id
                                ? ' - ' +
                                  (params.row.program_name as string) +
                                  ' - ' +
                                  (params.row.degree as string)
                                : ''}
                        </Link>
                        <Typography
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.25 }}
                            variant="caption"
                        >
                            {params.row.school as string}
                        </Typography>
                    </Box>
                );
            }
        },
        ...commonColumn
    ];

    const memoizedColumns = is_TaiGer_role(user as IUser) ? c2 : c2Student;

    return (
        <>
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    aria-label="basic tabs example"
                    onChange={handleTabChange}
                    scrollButtons="auto"
                    value={tabTag}
                    variant="scrollable"
                >
                    <Tab
                        label={`${t('TODO', { ns: 'common' })} (${
                            props.new_message_tasks?.length || 0
                        }) `}
                        {...a11yProps(tabTag, 0)}
                    />
                    <Tab
                        label={`${t('My Favorites', { ns: 'common' })} (${
                            props.fav_message_tasks?.length || 0
                        })`}
                        {...a11yProps(tabTag, 1)}
                    />
                    <Tab
                        label={`${t('Follow up', { ns: 'common' })} (${
                            props.followup_tasks?.length || 0
                        })`}
                        {...a11yProps(tabTag, 2)}
                    />
                    <Tab
                        label={`${t('No Action', { ns: 'common' })} (${
                            props.pending_progress_tasks?.length || 0
                        })`}
                        {...a11yProps(tabTag, 3)}
                    />
                    <Tab
                        label={`${t('Closed', { ns: 'common' })} (${
                            props.closed_tasks?.length || 0
                        })`}
                        {...a11yProps(tabTag, 4)}
                    />
                </Tabs>
            </Box>
            <CustomTabPanel index={0} value={tabTag}>
                <Alert severity="warning" data-testid="banner">
                    {' '}
                    Please reply:{' '}
                </Alert>
                <MuiDataGrid
                    columnVisibilityModel={{
                        number_input_from_editors: false,
                        number_input_from_student: false
                    }}
                    columns={memoizedColumns}
                    rows={props.new_message_tasks ?? []}
                />
            </CustomTabPanel>
            <CustomTabPanel index={1} value={tabTag}>
                <MuiDataGrid
                    columnVisibilityModel={{
                        number_input_from_editors: false,
                        number_input_from_student: false
                    }}
                    columns={memoizedColumns}
                    rows={props.fav_message_tasks ?? []}
                />
            </CustomTabPanel>
            <CustomTabPanel index={2} value={tabTag}>
                <Alert severity="info"> Follow up </Alert>
                <MuiDataGrid
                    columnVisibilityModel={{
                        number_input_from_editors: false,
                        number_input_from_student: false
                    }}
                    columns={memoizedColumns}
                    rows={props.followup_tasks ?? []}
                />
            </CustomTabPanel>
            <CustomTabPanel index={3} value={tabTag}>
                <Alert severity="info">
                    {is_TaiGer_role(user as IUser)
                        ? 'Waiting inputs. No action needed'
                        : 'Please provide input as soon as possible'}
                </Alert>
                <MuiDataGrid
                    columnVisibilityModel={{
                        number_input_from_editors: false,
                        number_input_from_student: false
                    }}
                    columns={memoizedColumns}
                    rows={props.pending_progress_tasks ?? []}
                />
            </CustomTabPanel>
            <CustomTabPanel index={4} value={tabTag}>
                <Alert severity="success"> These tasks are closed. </Alert>
                <MuiDataGrid
                    columnVisibilityModel={{
                        number_input_from_editors: false,
                        number_input_from_student: false
                    }}
                    columns={memoizedColumns}
                    rows={props.closed_tasks ?? []}
                />
                <Typography variant="body2">
                    {t(
                        'Note: if the documents are not closed but locate here, it is because the applications are already submitted. The documents can safely closed eventually.',
                        { ns: 'cvmlrl' }
                    )}
                </Typography>
            </CustomTabPanel>
        </>
    );
};

export default CVMLRLOverview;
