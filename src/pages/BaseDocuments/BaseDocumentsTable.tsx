import React, { useState, useMemo, useCallback } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    CircularProgress,
    Link,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Card,
    CardContent,
    Typography,
    Grid,
    Avatar
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DocumentStatusType, PROFILE_NAME } from '@taiger-common/core';
import {
    MaterialReactTable,
    useMaterialReactTable
} from 'material-react-table';
import {
    CheckCircleOutline as CheckCircleIcon,
    HourglassEmpty as HourglassIcon,
    Cancel as CancelIcon,
    Description as DescriptionIcon,
    Person as PersonIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

import {
    FILE_DONT_CARE_SYMBOL,
    FILE_MISSING_SYMBOL,
    FILE_NOT_OK_SYMBOL,
    FILE_OK_SYMBOL,
    FILE_UPLOADED_SYMBOL
} from '@utils/contants';
import { updateProfileDocumentStatus } from '@api';
import DEMO from '@store/constant';
import AcceptProfileFileModel from './AcceptedFilePreviewModal';

/** Profile document entry for a student */
export interface BaseDocumentProfileItem {
    name: string;
    status?: string;
    path?: string;
    [key: string]: unknown;
}

/** Agent reference in student row */
export interface BaseDocumentAgent {
    _id: { toString(): string };
    firstname?: string;
    lastname?: string;
}

/** Student row with profile documents and agents */
export interface BaseDocumentStudentRow {
    _id: { toString(): string };
    profile: BaseDocumentProfileItem[];
    firstname?: string;
    lastname?: string;
    firstname_chinese?: string;
    lastname_chinese?: string;
    agents?: BaseDocumentAgent[];
}

/** Table row original (id, studentName, agents + profile keys as BaseDocumentProfileItem) */
export interface BaseDocumentsTableRowOriginal {
    id: string;
    studentName: string;
    agents?: BaseDocumentAgent[];
    [profileKey: string]: string | BaseDocumentProfileItem | BaseDocumentAgent[] | undefined;
}

export interface BaseDocumentsTableProps {
    students: BaseDocumentStudentRow[];
}

interface BaseDocumentsTableState {
    students: BaseDocumentStudentRow[];
    isLoaded: boolean | Record<string, boolean>;
    rejectProfileFileModel: boolean;
    preview_path: string;
    doc_key: string;
    showPreview: boolean;
    acceptProfileFileModel: boolean;
    student_id: string;
    status: string;
    category: string;
    feedback: string;
    error?: unknown;
    success?: boolean;
    res_modal_status?: number;
    res_modal_message?: string;
}

export const BaseDocumentsTable = ({ students }: BaseDocumentsTableProps) => {
    const { t } = useTranslation();

    const [baseDocumentsTableState, setBaseDocumentsTableState] = useState<BaseDocumentsTableState>({
        students: students,
        isLoaded: true,
        rejectProfileFileModel: false,
        preview_path: '',
        doc_key: '',
        showPreview: false,
        acceptProfileFileModel: false,
        student_id: '',
        status: '', //reject, accept... etc
        category: '',
        feedback: ''
    });

    const onUpdateProfileFilefromstudent = (
        e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
    ) => {
        e?.preventDefault();
        setBaseDocumentsTableState((prevState) => ({
            ...prevState,
            isLoaded: false
        }));
        updateProfileDocumentStatus(
            baseDocumentsTableState.category,
            baseDocumentsTableState.student_id,
            baseDocumentsTableState.status,
            baseDocumentsTableState.feedback
        ).then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success) {
                    const students_temp: BaseDocumentStudentRow[] = [...baseDocumentsTableState.students];
                    const student_index = students_temp.findIndex(
                        (student) =>
                            String(student._id) === baseDocumentsTableState.student_id
                    );
                    if (student_index === -1) return;
                    const profile = students_temp[student_index].profile;
                    const profile_idx = Array.isArray(profile)
                        ? profile.findIndex(
                            (p: BaseDocumentProfileItem) => p.name === baseDocumentsTableState.category
                        )
                        : -1;
                    if (profile_idx === -1) return;
                    students_temp[student_index].profile[profile_idx] = data as BaseDocumentProfileItem;
                    setBaseDocumentsTableState((prevState) => ({
                        ...prevState,
                        students: students_temp,
                        success,
                        acceptProfileFileModel: false,
                        rejectProfileFileModel: false,
                        showPreview: false,
                        isLoaded: true,
                        res_modal_status: status
                    }));
                } else {
                    const { message } = resp.data;
                    setBaseDocumentsTableState((prevState) => ({
                        ...prevState,
                        showPreview: false,
                        acceptProfileFileModel: false,
                        rejectProfileFileModel: false,
                        isLoaded: true,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error) => {
                setBaseDocumentsTableState((prevState) => {
                    const prevLoaded = prevState.isLoaded;
                    const isLoadedObj = typeof prevLoaded === 'object' && prevLoaded !== null
                        ? { ...(prevLoaded as Record<string, boolean>), [baseDocumentsTableState.category]: true }
                        : { [baseDocumentsTableState.category]: true };
                    return {
                        ...prevState,
                        isLoaded: isLoadedObj,
                        error,
                        showPreview: false,
                        rejectProfileFileModel: false,
                        res_modal_status: 500,
                        res_modal_message: ''
                    };
                });
            }
        );
    };

    const closePreviewWindow = () => {
        setBaseDocumentsTableState((prevState) => ({
            ...prevState,
            showPreview: false
        }));
    };

    const closeRejectWarningWindow = () => {
        setBaseDocumentsTableState((prevState) => ({
            ...prevState,
            rejectProfileFileModel: false,
            feedback: ''
        }));
    };

    const handleRejectMessage = (
        e: React.FormEvent<HTMLFormElement> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        rejectmessage: string
    ) => {
        if ('preventDefault' in e) e.preventDefault();
        setBaseDocumentsTableState((prevState) => ({
            ...prevState,
            feedback: rejectmessage
        }));
    };

    const showPreview = (
        e: React.MouseEvent<HTMLElement>,
        path: string,
        doc_key: string,
        category: string,
        student_id: string
    ) => {
        e.preventDefault();
        setBaseDocumentsTableState((prevState) => ({
            ...prevState,
            showPreview: true,
            preview_path: path,
            doc_key: doc_key,
            category,
            student_id
        }));
    };

    const onUpdateProfileDocStatus = (
        e: React.MouseEvent<HTMLElement>,
        category: string,
        student_id: string,
        status: string
    ) => {
        e.preventDefault();
        if (status === DocumentStatusType.Accepted) {
            setBaseDocumentsTableState((prevState) => ({
                ...prevState,
                student_id,
                category,
                status,
                acceptProfileFileModel: true
            }));
        } else {
            setBaseDocumentsTableState((prevState) => ({
                ...prevState,
                student_id,
                category,
                status,
                rejectProfileFileModel: true
            }));
        }
    };

    // Calculate statistics
    const statistics = useMemo(() => {
        const totalStudents = baseDocumentsTableState.students.length;
        const profileKeys = Object.keys(PROFILE_NAME);
        const totalDocuments = totalStudents * profileKeys.length;

        let uploaded = 0;
        let accepted = 0;
        let rejected = 0;
        let missing = 0;
        let notNeeded = 0;

        baseDocumentsTableState.students.forEach((student: BaseDocumentStudentRow) => {
            (student.profile ?? []).forEach((doc: BaseDocumentProfileItem) => {
                if (doc.status === DocumentStatusType.Uploaded) {
                    uploaded++;
                } else if (doc.status === DocumentStatusType.Accepted) {
                    accepted++;
                } else if (doc.status === DocumentStatusType.Rejected) {
                    rejected++;
                } else if (doc.status === DocumentStatusType.NotNeeded) {
                    notNeeded++;
                } else {
                    missing++;
                }
            });
        });

        const completionRate =
            totalDocuments > 0
                ? ((accepted / (totalDocuments - notNeeded)) * 100).toFixed(1)
                : 0;

        return {
            totalStudents,
            totalDocuments,
            uploaded,
            accepted,
            rejected,
            missing,
            notNeeded,
            completionRate,
            needsReview: uploaded
        };
    }, [baseDocumentsTableState.students]);

    // Transform students data for the table
    const tableData = useMemo(() => {
        return baseDocumentsTableState.students.map((student: BaseDocumentStudentRow) => ({
            id: student._id.toString(),
            studentName: `${student?.lastname_chinese || ''}${
                student?.firstname_chinese || ''
            } ${student.firstname} ${student.lastname}`,
            agents: student.agents,
            ...(student.profile ?? []).reduce((acc: Record<string, BaseDocumentProfileItem>, curr: BaseDocumentProfileItem) => {
                acc[curr.name] = curr;
                return acc;
            }, {})
        }));
    }, [baseDocumentsTableState.students]);

    // Helper function to render document status cell
    const renderDocumentStatusCell = useCallback((
        params: { row: { original: BaseDocumentsTableRowOriginal } },
        profileKey: string
    ) => {
        const value = params.row.original[profileKey] as BaseDocumentProfileItem | undefined;

        if (value?.status === DocumentStatusType.Uploaded) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small">{FILE_UPLOADED_SYMBOL}</IconButton>
                    {`${value?.status || ''}`}
                </Box>
            );
        } else if (value?.status === DocumentStatusType.Accepted) {
            const document_split = (value?.path ?? '').toString().replace(/\\/g, '/');
            const document_name = document_split.split('/')[1];
            return (
                <Box
                    onClick={(e) => {
                        showPreview(
                            e,
                            document_name,
                            value?.name ?? '',
                            document_name,
                            String(params.row.original.id ?? '')
                        );
                    }}
                    style={{
                        textDecoration: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <IconButton size="small">{FILE_OK_SYMBOL}</IconButton>{' '}
                    {`${value?.status || ''}`}
                </Box>
            );
        } else if (value?.status === DocumentStatusType.Rejected) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small">{FILE_NOT_OK_SYMBOL}</IconButton>{' '}
                    {`${value?.status || ''}`}
                </Box>
            );
        } else if (value?.status === DocumentStatusType.NotNeeded) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton size="small">
                        {FILE_DONT_CARE_SYMBOL}
                    </IconButton>
                    {`${value?.status || ''}`}
                </Box>
            );
        } else {
            return <IconButton size="small">{FILE_MISSING_SYMBOL}</IconButton>;
        }
    }, [showPreview]);

    // Build profile document columns dynamically
    const profileColumns = useMemo(() => {
        const profileArray = Object.entries(PROFILE_NAME).map(
            ([key, value]) => [key, value]
        );

        return profileArray.map((baseDoc) => ({
            accessorKey: baseDoc[0],
            header: t(baseDoc[1], { ns: 'common' }),
            size: 150,
            Cell: (params: { row: { original: BaseDocumentsTableRowOriginal } }) => renderDocumentStatusCell(params, baseDoc[0])
        }));
    }, [t, renderDocumentStatusCell]);

    // Define table columns
    const columns = useMemo(
        () => [
            {
                accessorKey: 'studentName',
                header: t('First / Last Name', { ns: 'common' }),
                size: 200,
                Cell: (params: { row: { original: BaseDocumentsTableRowOriginal } }) => {
                    const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                        params.row.original.id,
                        DEMO.PROFILE_HASH
                    )}`;
                    const studentName = params.row.original.studentName;
                    return (
                        <Link
                            component={LinkDom}
                            target="_blank"
                            title={studentName}
                            to={linkUrl}
                            underline="hover"
                        >
                            {studentName}
                        </Link>
                    );
                }
            },
            {
                accessorKey: 'agents',
                header: t('Agents', { ns: 'common' }),
                size: 150,
                accessorFn: (row: BaseDocumentsTableRowOriginal) =>
                    row.agents
                        ?.map((agent) => `${agent.firstname ?? ''} ${agent.lastname ?? ''}`.trim())
                        .join(', ') || '',
                Cell: (params: { row: { original: BaseDocumentsTableRowOriginal } }) => {
                    const agents = params.row.original.agents;
                    return agents?.map((agent, idx) => (
                        <Link
                            component={LinkDom}
                            key={`${String(agent._id)}-${idx}`}
                            target="_blank"
                            title={`${agent.firstname ?? ''} ${agent.lastname ?? ''}`}
                            to={DEMO.TEAM_AGENT_LINK(String(agent._id))}
                            underline="hover"
                        >
                            {`${agent.firstname ?? ''}${
                                agents && idx < agents.length - 1
                                    ? ', '
                                    : ''
                            }`}
                        </Link>
                    ));
                }
            },
            ...profileColumns
        ],
        [t, profileColumns]
    );

    // Configure Material React Table
    const table = useMaterialReactTable({
        columns,
        data: tableData,
        enableColumnFilterModes: true,
        enableColumnOrdering: true,
        enableColumnPinning: true,
        enableColumnResizing: true,
        enableStickyHeader: true,
        enableDensityToggle: true,
        initialState: {
            showColumnFilters: true,
            showGlobalFilter: true,
            density: 'compact',
            columnPinning: {
                left: ['studentName']
            },
            pagination: { pageSize: 10, pageIndex: 0 }
        },
        paginationDisplayMode: 'pages',
        muiSearchTextFieldProps: {
            size: 'small',
            variant: 'outlined',
            placeholder: t('Search students...', { ns: 'common' })
        },
        muiPaginationProps: {
            color: 'secondary',
            rowsPerPageOptions: [10, 20, 50, 100],
            shape: 'rounded',
            variant: 'outlined'
        }
    });

    return (
        <Box>
            {/* Statistics Overview Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item lg={2} md={4} sm={6} xs={12}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ height: '100%' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Box>
                                    <Typography
                                        color="textSecondary"
                                        gutterBottom
                                        variant="overline"
                                    >
                                        {t('Total Students')}
                                    </Typography>
                                    <Typography
                                        sx={{ fontWeight: 'bold' }}
                                        variant="h4"
                                    >
                                        {statistics.totalStudents}
                                    </Typography>
                                </Box>
                                <Avatar
                                    sx={{
                                        bgcolor: '#e3f2fd',
                                        color: '#1976d2',
                                        width: 56,
                                        height: 56
                                    }}
                                >
                                    <PersonIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item lg={2} md={4} sm={6} xs={12}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ height: '100%' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    height: '100%'
                                }}
                            >
                                <Box>
                                    <Typography
                                        color="textSecondary"
                                        gutterBottom
                                        variant="overline"
                                    >
                                        {t('Needs Review')}
                                    </Typography>
                                    <Typography
                                        sx={{ fontWeight: 'bold' }}
                                        variant="h4"
                                    >
                                        {statistics.needsReview}
                                    </Typography>
                                    <Typography
                                        color="error.main"
                                        sx={{ fontSize: '0.75rem' }}
                                        variant="caption"
                                    >
                                        {t('Pending approval')}
                                    </Typography>
                                </Box>
                                <Avatar
                                    sx={{
                                        bgcolor: '#fff3e0',
                                        color: '#ff9800',
                                        width: 56,
                                        height: 56
                                    }}
                                >
                                    <HourglassIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item lg={2} md={4} sm={6} xs={12}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ height: '100%' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    height: '100%'
                                }}
                            >
                                <Box>
                                    <Typography
                                        color="textSecondary"
                                        gutterBottom
                                        variant="overline"
                                    >
                                        {t('Accepted')}
                                    </Typography>
                                    <Typography
                                        sx={{ fontWeight: 'bold' }}
                                        variant="h4"
                                    >
                                        {statistics.accepted}
                                    </Typography>
                                    <Typography
                                        color="success.main"
                                        sx={{ fontSize: '0.75rem' }}
                                        variant="caption"
                                    >
                                        {t('Approved documents')}
                                    </Typography>
                                </Box>
                                <Avatar
                                    sx={{
                                        bgcolor: '#e8f5e9',
                                        color: '#4caf50',
                                        width: 56,
                                        height: 56
                                    }}
                                >
                                    <CheckCircleIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item lg={2} md={4} sm={6} xs={12}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ height: '100%' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    height: '100%'
                                }}
                            >
                                <Box>
                                    <Typography
                                        color="textSecondary"
                                        gutterBottom
                                        variant="overline"
                                    >
                                        {t('Rejected')}
                                    </Typography>
                                    <Typography
                                        sx={{ fontWeight: 'bold' }}
                                        variant="h4"
                                    >
                                        {statistics.rejected}
                                    </Typography>
                                    <Typography
                                        color="error.main"
                                        sx={{ fontSize: '0.75rem' }}
                                        variant="caption"
                                    >
                                        {t('Needs resubmission')}
                                    </Typography>
                                </Box>
                                <Avatar
                                    sx={{
                                        bgcolor: '#ffebee',
                                        color: '#d32f2f',
                                        width: 56,
                                        height: 56
                                    }}
                                >
                                    <CancelIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item lg={2} md={4} sm={6} xs={12}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ height: '100%' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    height: '100%'
                                }}
                            >
                                <Box>
                                    <Typography
                                        color="textSecondary"
                                        gutterBottom
                                        variant="overline"
                                    >
                                        {t('Missing')}
                                    </Typography>
                                    <Typography
                                        sx={{ fontWeight: 'bold' }}
                                        variant="h4"
                                    >
                                        {statistics.missing}
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        sx={{ fontSize: '0.75rem' }}
                                        variant="caption"
                                    >
                                        {t('Not yet uploaded')}
                                    </Typography>
                                </Box>
                                <Avatar
                                    sx={{
                                        bgcolor: '#fafafa',
                                        color: '#757575',
                                        width: 56,
                                        height: 56
                                    }}
                                >
                                    <DescriptionIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item lg={2} md={4} sm={6} xs={12}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ height: '100%' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    height: '100%'
                                }}
                            >
                                <Box>
                                    <Typography
                                        color="textSecondary"
                                        gutterBottom
                                        variant="overline"
                                    >
                                        {t('Completion')}
                                    </Typography>
                                    <Typography
                                        sx={{ fontWeight: 'bold' }}
                                        variant="h4"
                                    >
                                        {statistics.completionRate}%
                                    </Typography>
                                    <Typography
                                        color="primary.main"
                                        sx={{ fontSize: '0.75rem' }}
                                        variant="caption"
                                    >
                                        {t('Overall progress')}
                                    </Typography>
                                </Box>
                                <Avatar
                                    sx={{
                                        bgcolor: '#e8eaf6',
                                        color: '#3f51b5',
                                        width: 56,
                                        height: 56
                                    }}
                                >
                                    <TrendingUpIcon />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Material React Table */}
            <MaterialReactTable table={table} />

            <AcceptProfileFileModel
                closePreviewWindow={closePreviewWindow}
                isLoaded={baseDocumentsTableState.isLoaded}
                k={baseDocumentsTableState.doc_key}
                onUpdateProfileDocStatus={onUpdateProfileDocStatus}
                path={baseDocumentsTableState.preview_path}
                preview_path={baseDocumentsTableState.preview_path}
                showPreview={baseDocumentsTableState.showPreview}
                student_id={baseDocumentsTableState.student_id}
            />

            <Dialog
                aria-labelledby="contained-modal-title-vcenter"
                onClose={closeRejectWarningWindow}
                open={baseDocumentsTableState.rejectProfileFileModel}
            >
                <DialogTitle>{t('Warning', { ns: 'common' })}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please give a reason why the uploaded{' '}
                        {baseDocumentsTableState.category} is invalid?
                    </DialogContentText>
                    <TextField
                        fullWidth
                        multiline
                        onChange={(e) => handleRejectMessage(e, e.target.value)}
                        placeholder="ex. Poor scanned quality."
                        rows={3}
                        sx={{ mt: 2 }}
                        type="text"
                        value={baseDocumentsTableState.feedback}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closeRejectWarningWindow}
                        variant="outlined"
                    >
                        {t('No', { ns: 'common' })}
                    </Button>
                    <Button
                        color="primary"
                        disabled={
                            baseDocumentsTableState.feedback === '' ||
                            !baseDocumentsTableState.isLoaded
                        }
                        onClick={(e) => onUpdateProfileFilefromstudent(e)}
                        variant="contained"
                    >
                        {!baseDocumentsTableState.isLoaded ? (
                            <CircularProgress size={24} />
                        ) : (
                            t('Yes', { ns: 'common' })
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
