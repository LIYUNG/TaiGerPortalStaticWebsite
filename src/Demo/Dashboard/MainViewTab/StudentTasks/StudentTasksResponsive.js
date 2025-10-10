import React from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Card,
    Chip,
    Grid,
    Stack,
    Typography
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { isProgramDecided } from '@taiger-common/core';

import DEMO from '../../../../store/constant';
import { convertDate } from '../../../../utils/contants';
import {
    check_academic_background_filled,
    check_application_preference_filled,
    check_languages_filled,
    check_applications_to_decided,
    is_all_uni_assist_vpd_uploaded,
    are_base_documents_missing,
    to_register_application_portals,
    is_personal_data_filled,
    all_applications_results_updated,
    has_admissions
} from '../../../Utils/checking-functions';
import { appConfig } from '../../../../config';

const StudentTasksResponsive = (props) => {
    const { t } = useTranslation();
    let taskCounter = 0;
    const tasks = [];

    // Document threads - general docs
    if (props.student.generaldocs_threads) {
        props.student.generaldocs_threads.forEach((generaldocs_threads, i) => {
            if (
                !generaldocs_threads.isFinalVersion &&
                generaldocs_threads.latest_message_left_by_id !==
                    props.student._id.toString()
            ) {
                taskCounter++;
                tasks.push(
                    <Card
                        key={`general_${i}`}
                        sx={{
                            p: 2,
                            transition: 'all 0.3s',
                            '&:hover': {
                                boxShadow: 2,
                                transform: 'translateY(-2px)'
                            }
                        }}
                        variant="outlined"
                    >
                        <Grid alignItems="center" container spacing={2}>
                            <Grid item md={8} xs={12}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 1,
                                        mb: 1
                                    }}
                                >
                                    <Chip
                                        color="error"
                                        label={taskCounter}
                                        size="small"
                                        sx={{
                                            fontWeight: 'bold',
                                            minWidth: 32
                                        }}
                                    />
                                    <Typography
                                        sx={{ fontWeight: 'bold', flex: 1 }}
                                        variant="subtitle1"
                                    >
                                        {
                                            generaldocs_threads.doc_thread_id
                                                .file_type
                                        }
                                    </Typography>
                                </Box>
                                <Typography
                                    color="text.secondary"
                                    sx={{ ml: 5 }}
                                    variant="body2"
                                >
                                    {t('Respond to Editor Feedback', {
                                        ns: 'dashboard'
                                    })}{' '}
                                    - My{' '}
                                    {
                                        generaldocs_threads.doc_thread_id
                                            .file_type
                                    }
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    sx={{ ml: 5, display: 'block', mt: 0.5 }}
                                    variant="caption"
                                >
                                    {t('Last update', { ns: 'common' })}:{' '}
                                    {convertDate(generaldocs_threads.updatedAt)}
                                </Typography>
                            </Grid>
                            <Grid
                                item
                                md={4}
                                sx={{ textAlign: { xs: 'left', md: 'right' } }}
                                xs={12}
                            >
                                <Button
                                    component={LinkDom}
                                    endIcon={<LaunchIcon />}
                                    size="small"
                                    to={DEMO.DOCUMENT_MODIFICATION_LINK(
                                        generaldocs_threads.doc_thread_id._id
                                    )}
                                    variant="contained"
                                >
                                    {t('View Feedback', { ns: 'common' })}
                                </Button>
                            </Grid>
                        </Grid>
                    </Card>
                );
            }
        });
    }
    // Document threads - application specific
    if (props.student.applications?.length > 0) {
        props.student.applications
            .filter((application) => isProgramDecided(application))
            .forEach((application) => {
                application.doc_modification_thread.forEach(
                    (application_doc_thread, idx) => {
                        if (
                            !application_doc_thread.isFinalVersion &&
                            application_doc_thread.latest_message_left_by_id !==
                                props.student._id.toString()
                        ) {
                            taskCounter++;
                            tasks.push(
                                <Card
                                    key={`app_${application.programId._id}_${idx}`}
                                    sx={{
                                        p: 2,
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            boxShadow: 2,
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                    variant="outlined"
                                >
                                    <Grid
                                        alignItems="center"
                                        container
                                        spacing={2}
                                    >
                                        <Grid item md={8} xs={12}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 1,
                                                    mb: 1
                                                }}
                                            >
                                                <Chip
                                                    color="error"
                                                    label={taskCounter}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        minWidth: 32
                                                    }}
                                                />
                                                <Typography
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        flex: 1
                                                    }}
                                                    variant="subtitle1"
                                                >
                                                    {
                                                        application_doc_thread
                                                            .doc_thread_id
                                                            .file_type
                                                    }
                                                </Typography>
                                            </Box>
                                            <Typography
                                                color="text.secondary"
                                                sx={{ ml: 5 }}
                                                variant="body2"
                                            >
                                                {application.programId.school} -{' '}
                                                {
                                                    application.programId
                                                        .program_name
                                                }
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    ml: 5,
                                                    display: 'block',
                                                    mt: 0.5
                                                }}
                                                variant="caption"
                                            >
                                                {t('Last update', {
                                                    ns: 'common'
                                                })}
                                                :{' '}
                                                {convertDate(
                                                    application_doc_thread.updatedAt
                                                )}
                                            </Typography>
                                        </Grid>
                                        <Grid
                                            item
                                            md={4}
                                            sx={{
                                                textAlign: {
                                                    xs: 'left',
                                                    md: 'right'
                                                }
                                            }}
                                            xs={12}
                                        >
                                            <Button
                                                component={LinkDom}
                                                endIcon={<LaunchIcon />}
                                                size="small"
                                                to={DEMO.DOCUMENT_MODIFICATION_LINK(
                                                    application_doc_thread
                                                        .doc_thread_id._id
                                                )}
                                                variant="contained"
                                            >
                                                {t('View Feedback', {
                                                    ns: 'common'
                                                })}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Card>
                            );
                        }
                    }
                );
            });
    }

    // Profile completion task
    if (
        !check_academic_background_filled(props.student.academic_background) ||
        !check_application_preference_filled(
            props.student.application_preference
        ) ||
        !check_languages_filled(props.student.academic_background)
    ) {
        taskCounter++;
        tasks.push(
            <Card
                key="profile"
                sx={{
                    p: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)'
                    }
                }}
                variant="outlined"
            >
                <Grid alignItems="center" container spacing={2}>
                    <Grid item md={8} xs={12}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1,
                                mb: 1
                            }}
                        >
                            <Chip
                                color="warning"
                                label={taskCounter}
                                size="small"
                                sx={{ fontWeight: 'bold', minWidth: 32 }}
                            />
                            <Typography
                                sx={{ fontWeight: 'bold', flex: 1 }}
                                variant="subtitle1"
                            >
                                {t('Profile', { ns: 'common' })}
                            </Typography>
                        </Box>
                        <Typography
                            color="text.secondary"
                            sx={{ ml: 5 }}
                            variant="body2"
                        >
                            {t(
                                'Please complete Profile so that your agent can understand your situation',
                                { ns: 'dashboard' }
                            )}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        md={4}
                        sx={{ textAlign: { xs: 'left', md: 'right' } }}
                        xs={12}
                    >
                        <Button
                            color="warning"
                            component={LinkDom}
                            endIcon={<LaunchIcon />}
                            size="small"
                            to={DEMO.SURVEY_LINK}
                            variant="contained"
                        >
                            {t('Go to Profile', { ns: 'common' })}
                        </Button>
                    </Grid>
                </Grid>
            </Card>
        );
    }

    // Courses task
    if (
        !props.isCoursesFilled &&
        (props.student.academic_background?.university?.isGraduated ===
            'pending' ||
            props.student.academic_background?.university?.isGraduated ===
                'Yes')
    ) {
        taskCounter++;
        tasks.push(
            <Card
                key="courses"
                sx={{
                    p: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)'
                    }
                }}
                variant="outlined"
            >
                <Grid alignItems="center" container spacing={2}>
                    <Grid item md={8} xs={12}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1,
                                mb: 1
                            }}
                        >
                            <Chip
                                color="warning"
                                label={taskCounter}
                                size="small"
                                sx={{ fontWeight: 'bold', minWidth: 32 }}
                            />
                            <Typography
                                sx={{ fontWeight: 'bold', flex: 1 }}
                                variant="subtitle1"
                            >
                                {t('My Courses', { ns: 'common' })}
                            </Typography>
                        </Box>
                        <Typography
                            color="text.secondary"
                            sx={{ ml: 5 }}
                            variant="body2"
                        >
                            {t(
                                'Please complete My Courses table. The agent will provide you with course analysis and courses suggestion.',
                                { ns: 'courses' }
                            )}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        md={4}
                        sx={{ textAlign: { xs: 'left', md: 'right' } }}
                        xs={12}
                    >
                        <Button
                            color="warning"
                            component={LinkDom}
                            endIcon={<LaunchIcon />}
                            size="small"
                            to={DEMO.COURSES_LINK}
                            variant="contained"
                        >
                            {t('My Courses', { ns: 'common' })}
                        </Button>
                    </Grid>
                </Grid>
            </Card>
        );
    }

    // Applications decision task
    if (!check_applications_to_decided(props.student)) {
        taskCounter++;
        tasks.push(
            <Card
                key="applications"
                sx={{
                    p: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)'
                    }
                }}
                variant="outlined"
            >
                <Grid alignItems="center" container spacing={2}>
                    <Grid item md={8} xs={12}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1,
                                mb: 1
                            }}
                        >
                            <Chip
                                color="warning"
                                label={taskCounter}
                                size="small"
                                sx={{ fontWeight: 'bold', minWidth: 32 }}
                            />
                            <Typography
                                sx={{ fontWeight: 'bold', flex: 1 }}
                                variant="subtitle1"
                            >
                                {t('My Applications', { ns: 'common' })}
                            </Typography>
                        </Box>
                        <Typography
                            color="text.secondary"
                            sx={{ ml: 5 }}
                            variant="body2"
                        >
                            {t(
                                "Please refer to the programs provided by the agent and visit the school's program website for detailed information. Complete the school selection before the start of the application season.",
                                { ns: 'courses' }
                            )}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        md={4}
                        sx={{ textAlign: { xs: 'left', md: 'right' } }}
                        xs={12}
                    >
                        <Button
                            color="warning"
                            component={LinkDom}
                            endIcon={<LaunchIcon />}
                            size="small"
                            to={DEMO.STUDENT_APPLICATIONS_LINK}
                            variant="contained"
                        >
                            {t('View Programs', { ns: 'common' })}
                        </Button>
                    </Grid>
                </Grid>
            </Card>
        );
    }

    // Application results task
    if (!all_applications_results_updated(props.student)) {
        taskCounter++;
        tasks.push(
            <Card
                key="app_results"
                sx={{
                    p: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)'
                    }
                }}
                variant="outlined"
            >
                <Grid alignItems="center" container spacing={2}>
                    <Grid item md={8} xs={12}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1,
                                mb: 1
                            }}
                        >
                            <Chip
                                color="info"
                                label={taskCounter}
                                size="small"
                                sx={{ fontWeight: 'bold', minWidth: 32 }}
                            />
                            <Typography
                                sx={{ fontWeight: 'bold', flex: 1 }}
                                variant="subtitle1"
                            >
                                {t('Application Results', { ns: 'common' })}
                            </Typography>
                        </Box>
                        <Typography
                            color="text.secondary"
                            sx={{ ml: 5 }}
                            variant="body2"
                        >
                            {t(
                                'Please update your applications results to the corresponding program in this page below',
                                { ns: 'common' }
                            )}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        md={4}
                        sx={{ textAlign: { xs: 'left', md: 'right' } }}
                        xs={12}
                    >
                        <Button
                            color="info"
                            component={LinkDom}
                            endIcon={<LaunchIcon />}
                            size="small"
                            to={DEMO.STUDENT_APPLICATIONS_LINK}
                            variant="contained"
                        >
                            {t('Update', { ns: 'common' })}
                        </Button>
                    </Grid>
                </Grid>
            </Card>
        );
    }

    // Visa task
    if (has_admissions(props.student)) {
        taskCounter++;
        tasks.push(
            <Card
                key="visa"
                sx={{
                    p: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)'
                    }
                }}
                variant="outlined"
            >
                <Grid alignItems="center" container spacing={2}>
                    <Grid item md={8} xs={12}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1,
                                mb: 1
                            }}
                        >
                            <Chip
                                color="success"
                                label={taskCounter}
                                size="small"
                                sx={{ fontWeight: 'bold', minWidth: 32 }}
                            />
                            <Typography
                                sx={{ fontWeight: 'bold', flex: 1 }}
                                variant="subtitle1"
                            >
                                {t('Visa', { ns: 'common' })}
                            </Typography>
                        </Box>
                        <Typography
                            color="text.secondary"
                            sx={{ ml: 5 }}
                            variant="body2"
                        >
                            {t(
                                'Please consider working on visa, if you decide the offer.',
                                { ns: 'visa' }
                            )}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        md={4}
                        sx={{ textAlign: { xs: 'left', md: 'right' } }}
                        xs={12}
                    >
                        <Button
                            color="success"
                            component={LinkDom}
                            endIcon={<LaunchIcon />}
                            size="small"
                            to={DEMO.VISA_DOCS_LINK}
                            variant="contained"
                        >
                            {t('Visa', { ns: 'common' })}
                        </Button>
                    </Grid>
                </Grid>
            </Card>
        );
    }

    // Uni-Assist task
    if (appConfig.vpdEnable && !is_all_uni_assist_vpd_uploaded(props.student)) {
        taskCounter++;
        tasks.push(
            <Card
                key="uniassist"
                sx={{
                    p: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)'
                    }
                }}
                variant="outlined"
            >
                <Grid alignItems="center" container spacing={2}>
                    <Grid item md={8} xs={12}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1,
                                mb: 1
                            }}
                        >
                            <Chip
                                color="warning"
                                label={taskCounter}
                                size="small"
                                sx={{ fontWeight: 'bold', minWidth: 32 }}
                            />
                            <Typography
                                sx={{ fontWeight: 'bold', flex: 1 }}
                                variant="subtitle1"
                            >
                                Uni-Assist
                            </Typography>
                        </Box>
                        <Typography
                            color="text.secondary"
                            sx={{ ml: 5 }}
                            variant="body2"
                        >
                            {t(
                                'Please go to the Uni-Assist section, follow the instructions to complete',
                                { ns: 'courses' }
                            )}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        md={4}
                        sx={{ textAlign: { xs: 'left', md: 'right' } }}
                        xs={12}
                    >
                        <Button
                            color="warning"
                            component={LinkDom}
                            endIcon={<LaunchIcon />}
                            size="small"
                            to={DEMO.UNI_ASSIST_LINK}
                            variant="contained"
                        >
                            {t('Go to Uni-Assist', { ns: 'common' })}
                        </Button>
                    </Grid>
                </Grid>
            </Card>
        );
    }

    // Personal data task
    if (!is_personal_data_filled(props.student)) {
        taskCounter++;
        tasks.push(
            <Card
                key="personal_data"
                sx={{
                    p: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)'
                    }
                }}
                variant="outlined"
            >
                <Grid alignItems="center" container spacing={2}>
                    <Grid item md={8} xs={12}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1,
                                mb: 1
                            }}
                        >
                            <Chip
                                color="warning"
                                label={taskCounter}
                                size="small"
                                sx={{ fontWeight: 'bold', minWidth: 32 }}
                            />
                            <Typography
                                sx={{ fontWeight: 'bold', flex: 1 }}
                                variant="subtitle1"
                            >
                                {t('Personal Data', { ns: 'common' })}
                            </Typography>
                        </Box>
                        <Typography
                            color="text.secondary"
                            sx={{ ml: 5 }}
                            variant="body2"
                        >
                            {t(
                                'Please be sure to update your Chinese and English names, as well as your date of birth information. This will affect the preparation of formal documents by the editor for you.',
                                { ns: 'courses' }
                            )}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        md={4}
                        sx={{ textAlign: { xs: 'left', md: 'right' } }}
                        xs={12}
                    >
                        <Button
                            color="warning"
                            component={LinkDom}
                            endIcon={<LaunchIcon />}
                            size="small"
                            to={DEMO.PROFILE}
                            variant="contained"
                        >
                            {t('Profile', { ns: 'common' })}
                        </Button>
                    </Grid>
                </Grid>
            </Card>
        );
    }

    // Base documents task
    if (are_base_documents_missing(props.student)) {
        taskCounter++;
        tasks.push(
            <Card
                key="base_docs"
                sx={{
                    p: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)'
                    }
                }}
                variant="outlined"
            >
                <Grid alignItems="center" container spacing={2}>
                    <Grid item md={8} xs={12}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1,
                                mb: 1
                            }}
                        >
                            <Chip
                                color="warning"
                                label={taskCounter}
                                size="small"
                                sx={{ fontWeight: 'bold', minWidth: 32 }}
                            />
                            <Typography
                                sx={{ fontWeight: 'bold', flex: 1 }}
                                variant="subtitle1"
                            >
                                {t('My Documents', { ns: 'common' })}
                            </Typography>
                        </Box>
                        <Typography
                            color="text.secondary"
                            sx={{ ml: 5 }}
                            variant="body2"
                        >
                            {t(
                                'Please upload documents as soon as possible. The agent needs them to understand your academic background.',
                                { ns: 'courses' }
                            )}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        md={4}
                        sx={{ textAlign: { xs: 'left', md: 'right' } }}
                        xs={12}
                    >
                        <Button
                            color="warning"
                            component={LinkDom}
                            endIcon={<LaunchIcon />}
                            size="small"
                            to={DEMO.BASE_DOCUMENTS_LINK}
                            variant="contained"
                        >
                            {t('Upload Documents', { ns: 'common' })}
                        </Button>
                    </Grid>
                </Grid>
            </Card>
        );
    }

    // Portal registration task
    if (to_register_application_portals(props.student)) {
        taskCounter++;
        tasks.push(
            <Card
                key="portals"
                sx={{
                    p: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)'
                    }
                }}
                variant="outlined"
            >
                <Grid alignItems="center" container spacing={2}>
                    <Grid item md={8} xs={12}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1,
                                mb: 1
                            }}
                        >
                            <Chip
                                color="info"
                                label={taskCounter}
                                size="small"
                                sx={{ fontWeight: 'bold', minWidth: 32 }}
                            />
                            <Typography
                                sx={{ fontWeight: 'bold', flex: 1 }}
                                variant="subtitle1"
                            >
                                {t('Portals Management', { ns: 'common' })}
                            </Typography>
                        </Box>
                        <Typography
                            color="text.secondary"
                            sx={{ ml: 5 }}
                            variant="body2"
                        >
                            {t(
                                "Please go to each school's website to create an account and provide your login credentials. This will facilitate the agent in conducting pre-submission checks for you in the future.",
                                { ns: 'courses' }
                            )}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        md={4}
                        sx={{ textAlign: { xs: 'left', md: 'right' } }}
                        xs={12}
                    >
                        <Button
                            color="info"
                            component={LinkDom}
                            endIcon={<LaunchIcon />}
                            size="small"
                            to={DEMO.PORTALS_MANAGEMENT_LINK}
                            variant="contained"
                        >
                            {t('Portals Management', { ns: 'common' })}
                        </Button>
                    </Grid>
                </Grid>
            </Card>
        );
    }

    return <Stack spacing={2}>{tasks}</Stack>;
};

export default StudentTasksResponsive;
