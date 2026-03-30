import React, { useState } from 'react';
import { Link as LinkDom, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    OpenInNew as OpenInNewIcon,
    LockOutlined as LockOutlinedIcon,
    LockOpen as LockOpenIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

import {
    Alert,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    Link,
    Typography
} from '@mui/material';
import {
    is_TaiGer_Admin,
    is_TaiGer_AdminAgent,
    is_TaiGer_Agent,
    is_TaiGer_Editor,
    is_TaiGer_Manager,
    is_TaiGer_role,
    is_TaiGer_Student
} from '@taiger-common/core';
import { calculateProgramLockStatus } from '../Utils/util_functions';
import DEMO from '@store/constant';
import ProgramReport from './ProgramReport';
import { appConfig } from '../../config';
import { useAuth } from '@components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { getSameProgramStudentsQuery } from '@/api/query';
import type { IUser } from '@taiger-common/model';
import ProgramInfoTabs, { type ProgramInfoTabsProps } from './components/ProgramInfoTabs';
import SameProgramStudentsCard from './components/SameProgramStudentsCard';
import ProgramUnlockDialog from './components/ProgramUnlockDialog';

/** Program shape in SingleProgramView (school, program_name, country + fields from programField2Label) */
export interface SingleProgramViewProgram {
    school?: string;
    program_name?: string;
    country?: string;
    [fieldKey: string]: string | number | boolean | undefined;
}

/** Student row in Same Program students tab */
export interface SingleProgramViewStudent {
    _id?: string | { toString(): string };
    firstname?: string;
    lastname?: string;
    agents?: Array<{ _id?: string; firstname?: string; lastname?: string }>;
    editors?: Array<{ _id?: string; firstname?: string; lastname?: string }>;
    application_year?: string | number;
    admission?: string;
}

export interface SingleProgramViewProps {
    program?: SingleProgramViewProgram;
    versions?: {
        [versionId: string]: { [k: string]: string | number | boolean };
    };
    students?: SingleProgramViewStudent[];
    isRefreshing?: boolean;
    onRefreshProgram?: () => void;
    programListAssistant?: unknown;
    setDeleteProgramWarningOpen?: (open: boolean) => void;
    setDiffModalShow?: () => void;
    setModalShowAssignWindow?: (open: boolean) => void;
    user?: IUser | null;
}

const SingleProgramView = (props: SingleProgramViewProps) => {
    const { programId } = useParams();
    const { user } = useAuth();
    const { t } = useTranslation();
    const typedUser = user as IUser;
    const [value, setValue] = useState(0);
    const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
    const program = props.program || ({} as SingleProgramViewProgram);
    const versions = props?.versions || {};
    const lockStatus = calculateProgramLockStatus(
        program as Parameters<typeof calculateProgramLockStatus>[0]
    );
    const isProgramLocked = lockStatus.isLocked;
    const canViewUnlockedChip =
        is_TaiGer_Admin(typedUser) ||
        is_TaiGer_Manager(typedUser) ||
        is_TaiGer_Agent(typedUser) ||
        is_TaiGer_Editor(typedUser);
    const { data, isLoading } = useQuery(
        getSameProgramStudentsQuery({
            programId: programId ?? '',
            enabled:
                is_TaiGer_Admin(typedUser) ||
                is_TaiGer_Agent(typedUser) ||
                is_TaiGer_Editor(typedUser)
        })
    );
    const students: SingleProgramViewStudent[] =
        (data as SingleProgramViewStudent[]) || props.students || [];

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <>
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                {is_TaiGer_role(typedUser) ? (
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.PROGRAMS}`}
                        underline="hover"
                    >
                        {t('Program List', { ns: 'common' })}
                    </Link>
                ) : (
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.STUDENT_APPLICATIONS_ID_LINK(user?._id?.toString() ?? '')}`}
                        underline="hover"
                    >
                        {t('Applications')}
                    </Link>
                )}
                <Typography
                    component="div"
                    color="text.primary"
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                    {`${program.school}-${program.program_name}`}
                    {isProgramLocked ? (
                        <Chip
                            color="warning"
                            icon={<LockOutlinedIcon fontSize="small" />}
                            label={t('Locked', { ns: 'common' })}
                            size="small"
                        />
                    ) : canViewUnlockedChip ? (
                        <Chip
                            color="success"
                            icon={<LockOpenIcon fontSize="small" />}
                            label={t('Unlocked', { ns: 'common' })}
                            size="small"
                            variant="outlined"
                        />
                    ) : null}
                </Typography>
            </Breadcrumbs>
            <Box sx={{ my: 1 }}>
                <Alert severity="info">
                    {`${appConfig.companyName} Portal 網站上的學程資訊主要為管理申請進度為主，學校學程詳細資訊仍以學校網站為主。`}
                </Alert>
            </Box>

            {isProgramLocked ? (
                <Alert
                    icon={<LockOutlinedIcon fontSize="small" />}
                    severity="warning"
                    sx={{ mb: 2 }}
                >
                    {lockStatus.reason === 'STALE_DATA'
                        ? t(
                              'Program is locked due to stale data (≥9 months old). Please refresh the program to unlock.',
                              { ns: 'common' }
                          )
                        : t(
                              'Program tasks are locked. Please contact an agent or manager to unlock.',
                              { ns: 'common' }
                          )}
                </Alert>
            ) : null}

            <Grid container spacing={2}>
                <Grid item md={8} xs={12}>
                    <ProgramInfoTabs
                        handleChange={handleChange}
                        program={program}
                        setDiffModalShow={props.setDiffModalShow}
                        user={typedUser}
                        value={value}
                        versions={versions as ProgramInfoTabsProps['versions']}
                    />
                </Grid>
                <Grid item md={4} xs={12}>
                    {is_TaiGer_role(typedUser) ? (
                        <Grid alignItems="center" container spacing={1}>
                            {is_TaiGer_AdminAgent(typedUser) ? (
                                <Grid item>
                                    <Button
                                        color="primary"
                                        fullWidth
                                        onClick={() =>
                                            props.setModalShowAssignWindow?.(true)
                                        }
                                        variant="outlined"
                                    >
                                        {t('Assign', { ns: 'common' })}
                                    </Button>
                                </Grid>
                            ) : null}
                            <Grid item>
                                <Button
                                    color="info"
                                    component={LinkDom}
                                    to={DEMO.PROGRAM_EDIT(
                                        props.program?._id?.toString() ?? ''
                                    )}
                                    variant="contained"
                                >
                                    {t('Edit', { ns: 'common' })}
                                </Button>
                            </Grid>
                            {!is_TaiGer_Student(typedUser) ? (
                                <Grid item>
                                    <Button
                                        color="secondary"
                                        disabled={
                                            !isProgramLocked ||
                                            (props.isRefreshing ?? false)
                                        }
                                        onClick={() =>
                                            setUnlockDialogOpen(true)
                                        }
                                        startIcon={<RefreshIcon />}
                                        title={
                                            !isProgramLocked
                                                ? t(
                                                      'Program is already unlocked',
                                                      {
                                                          ns: 'common'
                                                      }
                                                  )
                                                : t('Unlock program manually', {
                                                      ns: 'common'
                                                  })
                                        }
                                        variant="outlined"
                                    >
                                        {t('Unlock', { ns: 'common' })}
                                    </Button>
                                </Grid>
                            ) : null}
                            {is_TaiGer_Admin(typedUser) ? (
                                <Grid item>
                                    <Button
                                        color="error"
                                        onClick={() =>
                                            props.setDeleteProgramWarningOpen?.(
                                                true
                                            )
                                        }
                                        variant="outlined"
                                    >
                                        {t('Delete', { ns: 'common' })}
                                    </Button>
                                </Grid>
                            ) : null}
                        </Grid>
                    ) : null}
                    <Box sx={{ my: 2 }}>
                        <Link
                            component={LinkDom}
                            target="_blank"
                            to={`https://www.google.com/search?q=${program.school?.replace(
                                '&',
                                'and'
                            )}+${program.program_name?.replace('&', 'and')}+${
                                program.degree ?? ''
                            }`}
                        >
                            <Button
                                color="primary"
                                endIcon={<OpenInNewIcon />}
                                fullWidth
                                variant="contained"
                            >
                                {t('Find in Google', { ns: 'programList' })}
                            </Button>
                        </Link>
                    </Box>
                    {is_TaiGer_role(typedUser) ? (
                        <>
                            <SameProgramStudentsCard
                                isLoading={isLoading}
                                students={students}
                            />
                            <Card>
                                <CardContent>
                                    <Typography>
                                        {appConfig.companyName}{' '}
                                        {t('Program Assistant', {
                                            ns: 'programList'
                                        })}
                                    </Typography>
                                    <Button
                                        color="primary"
                                        disabled={isProgramLocked}
                                        onClick={props.programListAssistant as React.MouseEventHandler<HTMLButtonElement> | undefined}
                                        size="small"
                                        variant="contained"
                                    >
                                        {t('Fetch', { ns: 'common' })}
                                    </Button>
                                </CardContent>
                            </Card>
                        </>
                    ) : null}
                    <Card className="card-with-scroll">
                        <CardContent className="card-scrollable-body">
                            <Typography>
                                {t('Provide Feedback', { ns: 'programList' })}
                            </Typography>
                            <ProgramReport
                                program_id={props.program?._id?.toString() ?? ''}
                                program_name={props.program?.program_name ?? ''}
                                uni_name={props.program?.school ?? ''}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <ProgramUnlockDialog
                isRefreshing={props.isRefreshing ?? false}
                onClose={() => setUnlockDialogOpen(false)}
                onConfirmUnlock={props.onRefreshProgram ?? (() => {})}
                open={unlockDialogOpen}
                programId={props.program?._id?.toString() ?? ''}
            />
        </>
    );
};

export default SingleProgramView;
