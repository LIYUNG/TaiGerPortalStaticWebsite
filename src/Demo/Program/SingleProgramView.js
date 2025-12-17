import React, { Fragment, useState } from 'react';
import { Link as LinkDom, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Compare as CompareIcon,
    OpenInNew as OpenInNewIcon,
    Info as InfoIcon,
    LockOutlined as LockOutlinedIcon,
    LockOpen as LockOpenIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Link,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    Tabs,
    Tab,
    Breadcrumbs,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import {
    is_TaiGer_Admin,
    is_TaiGer_AdminAgent,
    is_TaiGer_Agent,
    is_TaiGer_Editor,
    is_TaiGer_Manager,
    is_TaiGer_role,
    is_TaiGer_Student,
    isProgramWithdraw
} from '@taiger-common/core';

import {
    isApplicationOpen,
    LinkableNewlineText,
    calculateProgramLockStatus
} from '../Utils/checking-functions';
import {
    IS_DEV,
    convertDate,
    COUNTRIES_MAPPING,
    english_test_hand_after,
    german_test_hand_after,
    program_fields_application_dates,
    program_fields_english_languages_test,
    program_fields_other_test,
    program_fields_others,
    program_fields_overview,
    program_fields_special_documents,
    program_fields_special_notes,
    programField2Label
} from '../../utils/contants';
import { HighlightTextDiff } from '../Utils/diffChecker';
import Banner from '../../components/Banner/Banner';
import DEMO from '../../store/constant';
import ProgramReport from './ProgramReport';
import { appConfig } from '../../config';
import { useAuth } from '../../components/AuthProvider';
import { a11yProps, CustomTabPanel } from '../../components/Tabs';
import { useQuery } from '@tanstack/react-query';
import { getSameProgramStudentsQuery } from '../../api/query';

const SingleProgramView = (props) => {
    const { programId } = useParams();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [value, setValue] = useState(0);
    const [studentsTabValue, setStudentsTabValue] = useState(0);
    const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
    const program = props.program || {};
    const versions = props?.versions || {};
    const lockStatus = calculateProgramLockStatus(program);
    const isProgramLocked = lockStatus.isLocked;
    const canViewUnlockedChip =
        is_TaiGer_Admin(user) ||
        is_TaiGer_Manager(user) ||
        is_TaiGer_Agent(user) ||
        is_TaiGer_Editor(user);
    const { data, isLoading } = useQuery(
        getSameProgramStudentsQuery({
            programId,
            enabled:
                is_TaiGer_Admin(user) ||
                is_TaiGer_Agent(user) ||
                is_TaiGer_Editor(user)
        })
    );
    const students = data || props.students || [];
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleStudentsTabChange = (event, newValue) => {
        setStudentsTabValue(newValue);
    };

    const convertToText = (value) => {
        if (!value) return ''; // undefined or null
        if (typeof value === 'string') return value;
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (Array.isArray(value)) return value.join(', ');
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
                {is_TaiGer_role(user) ? (
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
                        to={`${DEMO.STUDENT_APPLICATIONS_ID_LINK(user._id.toString())}`}
                        underline="hover"
                    >
                        {t('Applications')}
                    </Link>
                )}
                <Typography
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
                <Banner
                    ReadOnlyMode={true}
                    bg="primary"
                    link_name=""
                    notification_key={undefined}
                    removeBanner={() => {}}
                    text={`${appConfig.companyName} Portal 網站上的學程資訊主要為管理申請進度為主，學校學程詳細資訊仍以學校網站為主。`}
                    title="info"
                    to={`${DEMO.BASE_DOCUMENTS_LINK}`}
                />
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
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            aria-label="basic tabs example"
                            onChange={handleChange}
                            scrollButtons="auto"
                            value={value}
                            variant="scrollable"
                        >
                            <Tab
                                label={t('Overview')}
                                {...a11yProps(value, 0)}
                            />
                            <Tab
                                label={t('Application Deadline', {
                                    ns: 'common'
                                })}
                                {...a11yProps(value, 1)}
                            />
                            <Tab
                                label={t('Specific Requirements', {
                                    ns: 'common'
                                })}
                                {...a11yProps(value, 2)}
                            />
                            <Tab
                                label={t('Special Documents', { ns: 'common' })}
                                {...a11yProps(value, 3)}
                            />
                            <Tab label={t('Others')} {...a11yProps(value, 4)} />
                            {versions?.changes?.length > 0 ? (
                                <Tab
                                    label={t('Edit History', { ns: 'common' })}
                                    {...a11yProps(value, 5)}
                                />
                            ) : null}
                        </Tabs>
                    </Box>
                    <CustomTabPanel index={0} value={value}>
                        <Card>
                            <Grid container spacing={2} sx={{ p: 2 }}>
                                {program_fields_overview.map(
                                    (program_field, i) => (
                                        <Fragment key={i}>
                                            <Grid item md={4} xs={12}>
                                                <Typography fontWeight="bold">
                                                    {t(
                                                        `${program_field.name}`,
                                                        { ns: 'common' }
                                                    )}
                                                </Typography>
                                            </Grid>
                                            <Grid item md={8} xs={12}>
                                                <LinkableNewlineText
                                                    text={props.program[
                                                        program_field.prop
                                                    ]?.toString()}
                                                />
                                            </Grid>
                                        </Fragment>
                                    )
                                )}
                            </Grid>
                        </Card>
                    </CustomTabPanel>
                    <CustomTabPanel index={1} value={value}>
                        <Card>
                            <Grid container spacing={2} sx={{ p: 2 }}>
                                {program_fields_application_dates.map(
                                    (program_field, i) => (
                                        <Fragment key={i}>
                                            <Grid item md={4} xs={12}>
                                                <Typography fontWeight="bold">
                                                    {t(
                                                        `${program_field.name}`,
                                                        { ns: 'common' }
                                                    )}
                                                </Typography>
                                            </Grid>
                                            <Grid item md={8} xs={12}>
                                                <LinkableNewlineText
                                                    text={
                                                        props.program[
                                                            program_field.prop
                                                        ]
                                                    }
                                                />
                                            </Grid>
                                        </Fragment>
                                    )
                                )}
                            </Grid>
                        </Card>
                    </CustomTabPanel>
                    <CustomTabPanel index={2} value={value}>
                        <Card>
                            <Grid container spacing={2} sx={{ p: 2 }}>
                                {[...english_test_hand_after].map(
                                    (program_field, i) => (
                                        <Fragment key={i}>
                                            <Grid item md={4} xs={6}>
                                                <Typography fontWeight="bold">
                                                    {t(
                                                        `${program_field.name}`,
                                                        { ns: 'common' }
                                                    )}
                                                </Typography>
                                            </Grid>
                                            <Grid item md={8} xs={6}>
                                                <LinkableNewlineText
                                                    text={props.program[
                                                        program_field.prop
                                                    ]?.toString()}
                                                />
                                            </Grid>
                                        </Fragment>
                                    )
                                )}
                                {program_fields_english_languages_test.map(
                                    (program_field, i) => (
                                        <Fragment key={i}>
                                            <Grid item md={2} xs={6}>
                                                <Typography fontWeight="bold">
                                                    {t(
                                                        `${program_field.name}`,
                                                        { ns: 'common' }
                                                    )}
                                                </Typography>
                                            </Grid>
                                            <Grid item md={2} xs={6}>
                                                <LinkableNewlineText
                                                    text={
                                                        props.program[
                                                            program_field.prop
                                                        ]
                                                    }
                                                />
                                            </Grid>
                                            <Grid item md={2} xs={3}>
                                                {props.program[
                                                    `${program_field.prop}_reading`
                                                ] ? (
                                                    <Typography fontWeight="bold">
                                                        {t('Reading', {
                                                            ns: 'common'
                                                        })}
                                                        :{' '}
                                                        {
                                                            props.program[
                                                                `${program_field.prop}_reading`
                                                            ]
                                                        }
                                                    </Typography>
                                                ) : null}{' '}
                                            </Grid>
                                            <Grid item md={2} xs={3}>
                                                {props.program[
                                                    `${program_field.prop}_listening`
                                                ] ? (
                                                    <Typography fontWeight="bold">
                                                        {t('Listening', {
                                                            ns: 'common'
                                                        })}
                                                        :{' '}
                                                        {
                                                            props.program[
                                                                `${program_field.prop}_listening`
                                                            ]
                                                        }
                                                    </Typography>
                                                ) : null}{' '}
                                            </Grid>
                                            <Grid item md={2} xs={3}>
                                                {props.program[
                                                    `${program_field.prop}_speaking`
                                                ] ? (
                                                    <Typography fontWeight="bold">
                                                        {t('Speaking', {
                                                            ns: 'common'
                                                        })}
                                                        :{' '}
                                                        {
                                                            props.program[
                                                                `${program_field.prop}_speaking`
                                                            ]
                                                        }
                                                    </Typography>
                                                ) : null}{' '}
                                            </Grid>
                                            <Grid item md={2} xs={3}>
                                                {props.program[
                                                    `${program_field.prop}_writing`
                                                ] ? (
                                                    <Typography fontWeight="bold">
                                                        {t('Writing', {
                                                            ns: 'common'
                                                        })}
                                                        :{' '}
                                                        {
                                                            props.program[
                                                                `${program_field.prop}_writing`
                                                            ]
                                                        }
                                                    </Typography>
                                                ) : null}
                                            </Grid>
                                        </Fragment>
                                    )
                                )}
                                {[
                                    ...german_test_hand_after,
                                    ...program_fields_other_test,
                                    ...program_fields_special_notes
                                ].map((program_field, i) => (
                                    <Fragment key={i}>
                                        <Grid item md={4} xs={12}>
                                            <Typography fontWeight="bold">
                                                {t(`${program_field.name}`, {
                                                    ns: 'common'
                                                })}
                                            </Typography>
                                        </Grid>
                                        <Grid item md={8} xs={12}>
                                            <LinkableNewlineText
                                                text={props.program[
                                                    program_field.prop
                                                ]?.toString()}
                                            />
                                        </Grid>
                                    </Fragment>
                                ))}
                            </Grid>
                        </Card>
                    </CustomTabPanel>
                    <CustomTabPanel index={3} value={value}>
                        <Card>
                            <Grid container spacing={2} sx={{ p: 2 }}>
                                {program_fields_special_documents.map(
                                    (program_field, i) => (
                                        <Fragment key={i}>
                                            <Grid item md={4} xs={12}>
                                                <Typography fontWeight="bold">
                                                    {t(
                                                        `${program_field.name}`,
                                                        { ns: 'common' }
                                                    )}
                                                </Typography>
                                            </Grid>
                                            <Grid item md={8} xs={12}>
                                                <LinkableNewlineText
                                                    text={convertToText(
                                                        props.program[
                                                            program_field.prop
                                                        ]
                                                    )}
                                                />
                                            </Grid>
                                        </Fragment>
                                    )
                                )}
                            </Grid>
                        </Card>
                    </CustomTabPanel>
                    <CustomTabPanel index={4} value={value}>
                        <Card>
                            <Grid container spacing={2} sx={{ p: 2 }}>
                                {program_fields_others.map(
                                    (program_field, i) => (
                                        <Fragment key={i}>
                                            <Grid item md={4} xs={12}>
                                                <Typography fontWeight="bold">
                                                    {t(
                                                        `${program_field.name}`,
                                                        { ns: 'common' }
                                                    )}
                                                </Typography>
                                            </Grid>
                                            <Grid item md={8} xs={12}>
                                                <LinkableNewlineText
                                                    text={
                                                        props.program[
                                                            program_field.prop
                                                        ]
                                                    }
                                                />
                                            </Grid>
                                        </Fragment>
                                    )
                                )}
                                <Grid item md={4} xs={12}>
                                    <Typography fontWeight="bold">
                                        {t(`Country`, { ns: 'common' })}
                                    </Typography>
                                </Grid>
                                <Grid item md={8} xs={12}>
                                    <span>
                                        <img
                                            alt="Logo"
                                            src={`/assets/logo/country_logo/svg/${props.program.country}.svg`}
                                            style={{
                                                maxWidth: '32px',
                                                maxHeight: '32px'
                                            }}
                                            title={
                                                COUNTRIES_MAPPING[
                                                    props.program.country
                                                ]
                                            }
                                        />
                                    </span>
                                </Grid>
                                {props.program.application_portal_a ? (
                                    <>
                                        <Grid item md={4} xs={12}>
                                            <Typography fontWeight="bold">
                                                Portal Link 1
                                            </Typography>
                                        </Grid>
                                        <Grid item md={8} xs={12}>
                                            <LinkableNewlineText
                                                text={
                                                    props.program
                                                        .application_portal_a
                                                }
                                            />
                                        </Grid>

                                        <Grid item md={4} xs={12}>
                                            <Typography fontWeight="bold">
                                                Portal Instructions 1
                                            </Typography>
                                        </Grid>
                                        <Grid item md={8} xs={12}>
                                            <LinkableNewlineText
                                                text={
                                                    props.program
                                                        .application_portal_a_instructions
                                                }
                                            />
                                        </Grid>
                                    </>
                                ) : null}
                                {props.program.application_portal_b ? (
                                    <>
                                        <Grid item md={4} xs={12}>
                                            <Typography fontWeight="bold">
                                                Portal Link 2
                                            </Typography>
                                        </Grid>
                                        <Grid item md={8} xs={12}>
                                            <LinkableNewlineText
                                                text={
                                                    props.program
                                                        .application_portal_b
                                                }
                                            />
                                        </Grid>
                                        <Grid item md={4} xs={12}>
                                            <Typography fontWeight="bold">
                                                Portal Instructions 2
                                            </Typography>
                                        </Grid>
                                        <Grid item md={8} xs={12}>
                                            <LinkableNewlineText
                                                text={
                                                    props.program
                                                        .application_portal_b_instructions
                                                }
                                            />
                                        </Grid>
                                    </>
                                ) : null}
                                <Grid item md={4} xs={12}>
                                    <Typography fontWeight="bold">
                                        {t('Last update', { ns: 'common' })}
                                    </Typography>
                                </Grid>
                                <Grid item md={8} xs={12}>
                                    <Typography fontWeight="bold">
                                        {convertDate(props.program.updatedAt)}
                                    </Typography>
                                </Grid>
                                {is_TaiGer_AdminAgent(user) ? (
                                    <>
                                        <Grid item md={4} xs={12}>
                                            <Typography>
                                                {t('Updated by', {
                                                    ns: 'common'
                                                })}
                                            </Typography>
                                        </Grid>
                                        <Grid item md={8} xs={12}>
                                            <Typography>
                                                {props.program.whoupdated}
                                            </Typography>
                                        </Grid>
                                        <Grid item md={4} xs={12}>
                                            <Typography>
                                                {t('Group', { ns: 'common' })}
                                            </Typography>
                                        </Grid>
                                    </>
                                ) : null}
                            </Grid>
                        </Card>
                    </CustomTabPanel>
                    {versions?.changes?.length > 0 ? (
                        <CustomTabPanel
                            index={5}
                            style={{ width: '100%', overflowY: 'auto' }}
                            value={value}
                        >
                            {IS_DEV ? (
                                <Button
                                    onClick={() => props.setDiffModalShow()}
                                >
                                    <CompareIcon fontSize="small" /> Incoming
                                    changes - Compare
                                </Button>
                            ) : null}
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <strong>
                                                {t('#', { ns: 'common' })}
                                            </strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>
                                                {t('Changed By', {
                                                    ns: 'common'
                                                })}
                                            </strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>
                                                {t('Field', { ns: 'common' })}
                                            </strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>
                                                {t('Content', { ns: 'common' })}
                                            </strong>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {versions.changes
                                        .slice()
                                        .reverse()
                                        .map((change, index) => {
                                            const reverseIndex = versions
                                                .changes.length
                                                ? versions.changes.length -
                                                  index
                                                : index;
                                            const keys = Object.keys({
                                                ...change.originalValues,
                                                ...change.updatedValues
                                            });
                                            return (
                                                <Fragment key={index}>
                                                    <TableRow />
                                                    <TableRow>
                                                        <TableCell
                                                            rowSpan={
                                                                (keys?.length ||
                                                                    0) + 1
                                                            }
                                                        >
                                                            <Typography>
                                                                {reverseIndex}{' '}
                                                                {change?.changeRequest ? (
                                                                    <div
                                                                        title={`from change request ${change?.changeRequest}`}
                                                                    >
                                                                        <InfoIcon fontSize="small" />
                                                                    </div>
                                                                ) : null}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell
                                                            rowSpan={
                                                                (keys?.length ||
                                                                    0) + 1
                                                            }
                                                        >
                                                            <div>
                                                                {
                                                                    change.changedBy
                                                                }
                                                            </div>
                                                            <div>
                                                                {convertDate(
                                                                    change.changedAt
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                    {keys.map((key, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell>
                                                                {t(
                                                                    programField2Label?.[
                                                                        key
                                                                    ] || key,
                                                                    {
                                                                        ns: 'common'
                                                                    }
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <HighlightTextDiff
                                                                    original={
                                                                        change
                                                                            ?.originalValues?.[
                                                                            key
                                                                        ]
                                                                    }
                                                                    updated={
                                                                        change
                                                                            ?.updatedValues?.[
                                                                            key
                                                                        ]
                                                                    }
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </Fragment>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                        </CustomTabPanel>
                    ) : null}
                </Grid>
                <Grid item md={4} xs={12}>
                    {is_TaiGer_role(user) ? (
                        <Grid alignItems="center" container spacing={1}>
                            {is_TaiGer_AdminAgent(user) ? (
                                <Grid item>
                                    <Button
                                        color="primary"
                                        fullWidth
                                        onClick={() =>
                                            props.setModalShowAssignWindow(true)
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
                                        props.program._id?.toString()
                                    )}
                                    variant="contained"
                                >
                                    {t('Edit', { ns: 'common' })}
                                </Button>
                            </Grid>
                            {!is_TaiGer_Student(user) ? (
                                <Grid item>
                                    <Button
                                        color="secondary"
                                        disabled={
                                            !isProgramLocked ||
                                            props.isRefreshing
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
                            {is_TaiGer_Admin(user) ? (
                                <Grid item>
                                    <Button
                                        color="error"
                                        onClick={() =>
                                            props.setDeleteProgramWarningOpen(
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
                                program.degree
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
                    {is_TaiGer_role(user) ? (
                        <>
                            <Card className="card-with-scroll" sx={{ p: 2 }}>
                                <div className="card-scrollable-body">
                                    <Tabs
                                        aria-label="basic tabs example"
                                        onChange={handleStudentsTabChange}
                                        scrollButtons="auto"
                                        value={studentsTabValue}
                                        variant="scrollable"
                                    >
                                        <Tab
                                            label="In Progress"
                                            {...a11yProps(value, 0)}
                                        />
                                        <Tab
                                            label="Closed"
                                            {...a11yProps(value, 1)}
                                        />
                                    </Tabs>
                                    <CustomTabPanel
                                        index={0}
                                        value={studentsTabValue}
                                    >
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>
                                                        {t('Name', {
                                                            ns: 'common'
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {t('Agent', {
                                                            ns: 'common'
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {t('Editor', {
                                                            ns: 'common'
                                                        })}
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {isLoading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3}>
                                                            <Skeleton
                                                                height={40}
                                                                variant="text"
                                                                width="100%"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    students
                                                        ?.filter((student) =>
                                                            isApplicationOpen(
                                                                student
                                                            )
                                                        )
                                                        .map((student, i) => (
                                                            <TableRow key={i}>
                                                                <TableCell>
                                                                    <Link
                                                                        component={
                                                                            LinkDom
                                                                        }
                                                                        to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                                                            student._id?.toString(),
                                                                            DEMO.PROFILE_HASH
                                                                        )}`}
                                                                    >
                                                                        {
                                                                            student.firstname
                                                                        }{' '}
                                                                        {
                                                                            student.lastname
                                                                        }
                                                                    </Link>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {student.agents?.map(
                                                                        (
                                                                            agent
                                                                        ) => (
                                                                            <Link
                                                                                component={
                                                                                    LinkDom
                                                                                }
                                                                                key={
                                                                                    agent._id
                                                                                }
                                                                                sx={{
                                                                                    mr: 1
                                                                                }}
                                                                                to={`${DEMO.TEAM_AGENT_LINK(
                                                                                    agent._id?.toString()
                                                                                )}`}
                                                                            >
                                                                                {
                                                                                    agent.firstname
                                                                                }
                                                                            </Link>
                                                                        )
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {student.editors?.map(
                                                                        (
                                                                            editor
                                                                        ) => (
                                                                            <Link
                                                                                component={
                                                                                    LinkDom
                                                                                }
                                                                                key={
                                                                                    editor._id
                                                                                }
                                                                                sx={{
                                                                                    mr: 1
                                                                                }}
                                                                                to={`${DEMO.TEAM_EDITOR_LINK(
                                                                                    editor._id?.toString()
                                                                                )}`}
                                                                            >
                                                                                {
                                                                                    editor.firstname
                                                                                }
                                                                            </Link>
                                                                        )
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CustomTabPanel>
                                    <CustomTabPanel
                                        index={1}
                                        value={studentsTabValue}
                                    >
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>
                                                        {t('Name', {
                                                            ns: 'common'
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {t('Year', {
                                                            ns: 'common'
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {t('Admission', {
                                                            ns: 'admissions'
                                                        })}
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {isLoading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3}>
                                                            <Skeleton
                                                                height={40}
                                                                variant="text"
                                                                width="100%"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    students
                                                        ?.filter(
                                                            (student) =>
                                                                !isApplicationOpen(
                                                                    student
                                                                )
                                                        )
                                                        .map((student, i) => (
                                                            <TableRow key={i}>
                                                                <TableCell>
                                                                    <Link
                                                                        component={
                                                                            LinkDom
                                                                        }
                                                                        to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                                                            student._id?.toString(),
                                                                            DEMO.PROFILE_HASH
                                                                        )}`}
                                                                    >
                                                                        {
                                                                            student.firstname
                                                                        }{' '}
                                                                        {
                                                                            student.lastname
                                                                        }
                                                                    </Link>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {student.application_year
                                                                        ? student.application_year
                                                                        : '-'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {isProgramWithdraw(
                                                                        student
                                                                    )
                                                                        ? 'WITHDREW'
                                                                        : student.admission}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                )}
                                            </TableBody>
                                        </Table>
                                        <Typography
                                            sx={{ mt: 2 }}
                                            variant="string"
                                        >
                                            O: admitted, X: rejected, -: not
                                            confirmed{' '}
                                        </Typography>
                                    </CustomTabPanel>
                                </div>
                            </Card>
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
                                        onClick={props.programListAssistant}
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
                                program_id={props.program._id?.toString()}
                                program_name={props.program.program_name}
                                uni_name={props.program.school}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Dialog
                aria-describedby="unlock-dialog-description"
                aria-labelledby="unlock-dialog-title"
                onClose={() => setUnlockDialogOpen(false)}
                open={unlockDialogOpen}
            >
                <DialogTitle id="unlock-dialog-title">
                    {t('Unlock Program Manually', { ns: 'common' })}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="unlock-dialog-description">
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography
                                sx={{ fontWeight: 'bold', mb: 1 }}
                                variant="body1"
                            >
                                {t('Important: Verify Program Information', {
                                    ns: 'common'
                                })}
                            </Typography>
                            <Typography variant="body2">
                                {t(
                                    'Before manually unlocking this program, please ensure that all required information in the program list has been reviewed and updated, including:',
                                    { ns: 'common' }
                                )}
                            </Typography>
                            <Box component="ul" sx={{ mt: 1, mb: 1, pl: 3 }}>
                                <Typography component="li" variant="body2">
                                    {t('Application deadlines and dates', {
                                        ns: 'common'
                                    })}
                                </Typography>
                                <Typography component="li" variant="body2">
                                    {t(
                                        'Language requirements and test scores',
                                        { ns: 'common' }
                                    )}
                                </Typography>
                                <Typography component="li" variant="body2">
                                    {t(
                                        'Required documents and special requirements',
                                        { ns: 'common' }
                                    )}
                                </Typography>
                                <Typography component="li" variant="body2">
                                    {t(
                                        'Any other program-specific information',
                                        { ns: 'common' }
                                    )}
                                </Typography>
                            </Box>
                            <Typography sx={{ mt: 1 }} variant="body2">
                                {t(
                                    'Manually unlocking will update the program timestamp and reset the automatic locking mechanism. Only proceed if you have confirmed that all program information is current and accurate.',
                                    { ns: 'common' }
                                )}
                            </Typography>
                        </Alert>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="inherit"
                        onClick={() => setUnlockDialogOpen(false)}
                    >
                        {t('Cancel', { ns: 'common' })}
                    </Button>
                    <Button
                        color="primary"
                        component={LinkDom}
                        disabled={props.isRefreshing}
                        to={DEMO.PROGRAM_EDIT(
                            props.program._id?.toString() || props.program._id
                        )}
                        variant="outlined"
                    >
                        {t('Edit', { ns: 'common' })}
                    </Button>
                    <Button
                        color="secondary"
                        disabled={props.isRefreshing}
                        onClick={() => {
                            setUnlockDialogOpen(false);
                            props.onRefreshProgram();
                        }}
                        startIcon={<RefreshIcon />}
                        variant="contained"
                    >
                        {props.isRefreshing
                            ? t('Unlocking...', { ns: 'common' })
                            : t('Confirm Unlock', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
export default SingleProgramView;
