import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    // Chip,
    Button,
    LinearProgress,
    Stack,
    Grid,
    IconButton

    // Checkbox
} from '@mui/material';
// import SchoolIcon from '@mui/icons-material/School';
// import AttachFileIcon from '@mui/icons-material/AttachFile';
// import DoneIcon from '@mui/icons-material/Done';
import ApplicationProgressCardBody from '../../components/ApplicationProgressCard/ApplicationProgressCardBody';
import {
    isProgramDecided,
    isProgramSubmitted,
    isProgramWithdraw
} from '@taiger-common/core';
import {
    application_deadline_calculator,
    progressBarCounter
} from '../Utils/checking-functions';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LanguageIcon from '@mui/icons-material/Language';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import InterpreterModeIcon from '@mui/icons-material/InterpreterMode';
const DecidedSubmittedButtons = () => (
    <Stack direction="row" mt="auto" spacing={1}>
        <Button color="primary" startIcon={<DoneIcon />} variant="contained">
            Get Admission
        </Button>
        <Button color="primary" startIcon={<CancelIcon />} variant="outlined">
            Get Rejection
        </Button>
        <Button
            color="success"
            startIcon={<InterpreterModeIcon />}
            variant="contained"
        >
            Request Interview Training
        </Button>
    </Stack>
);

const DecidedWithdrawnButtons = () => (
    <Stack direction="row" mt="auto" spacing={1}>
        <Button color="primary" startIcon={<DoneIcon />} variant="contained">
            Re-apply
        </Button>
        <Button color="primary" startIcon={<CancelIcon />} variant="outlined">
            Withdraw
        </Button>
    </Stack>
);

const DecidedUnsubmittedButtons = () => (
    <Stack direction="row" mt="auto" spacing={1}>
        <Button color="primary" startIcon={<DoneIcon />} variant="contained">
            Mark as Complete
        </Button>
        <Button color="primary" startIcon={<CancelIcon />} variant="outlined">
            Mark as Withdrawn
        </Button>
    </Stack>
);

const UndecidedButtons = () => (
    <Stack direction="row" mt="auto" spacing={1}>
        <Button color="primary" startIcon={<DoneIcon />} variant="contained">
            Decide
        </Button>
        <Button color="primary" startIcon={<CancelIcon />} variant="outlined">
            Do not want
        </Button>
    </Stack>
);

const DynamicButtons = ({ application }) => {
    const isDecided = isProgramDecided(application);
    const isSubmitted = isProgramSubmitted(application);
    const isWithdrawn = isProgramWithdraw(application);

    // --- Conditional rendering ---
    const renderButtons = () => {
        if (!isDecided) return <UndecidedButtons />;
        if (isSubmitted) return <DecidedSubmittedButtons />;
        if (isWithdrawn) return <DecidedWithdrawnButtons />;
        return <DecidedUnsubmittedButtons />;
    };

    return <Box>{renderButtons()}</Box>;
};

export default function ApplicationCard({ application, student }) {
    const { programId } = application;
    // const completedItems = checklist.filter((item) => item.completed).length;
    const progress = isProgramSubmitted(application)
        ? 100
        : progressBarCounter(student, application);

    return (
        <Card
            sx={{
                borderLeft: '6px solid orange',
                maxWidth: 800,
                bgcolor: 'background.paper',
                color: 'text.primary',
                my: 1
            }}
        >
            <Grid container spacing={0}>
                {/* LEFT: School Info */}
                <Grid item sm={5} xs={12}>
                    <Box height="100%" p={2}>
                        <Typography
                            color="primary"
                            fontWeight="bold"
                            variant="h6"
                        >
                            {programId?.school || 'ETH Zurich'}
                        </Typography>
                        <Typography
                            color="text.secondary"
                            gutterBottom
                            variant="body2"
                        >
                            {programId?.degree || 'M. Sc.'} –{' '}
                            <strong>{programId?.program_name}</strong>
                        </Typography>

                        <Box mt={2}>
                            {/* I need icon for each of the following: Deadline, Semester, Language
                             */}
                            <Stack alignItems="center" direction="row">
                                <IconButton>
                                    <CalendarMonthIcon fontSize="small" />
                                </IconButton>
                                <Typography variant="body2">
                                    <strong>Deadline:</strong>{' '}
                                    {application_deadline_calculator(
                                        student,
                                        application
                                    )}
                                </Typography>
                            </Stack>
                            <Stack alignItems="center" direction="row">
                                <IconButton>
                                    <CalendarMonthIcon fontSize="small" />
                                </IconButton>
                                <Typography variant="body2">
                                    <strong>Semester:</strong>{' '}
                                    {application.programId.semester}
                                </Typography>
                            </Stack>
                            <Stack alignItems="center" direction="row">
                                <IconButton>
                                    <LanguageIcon fontSize="small" />
                                </IconButton>
                                <Typography variant="body2">
                                    <strong>Language:</strong>{' '}
                                    {application.programId.lang}
                                </Typography>
                            </Stack>
                        </Box>
                    </Box>
                </Grid>
                {/* RIGHT: Progress + Actions */}
                <Grid item sm={7} xs={12}>
                    <CardContent
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%'
                        }}
                    >
                        {/* Checklist Section */}
                        <Box sx={{ height: '240px', overflow: 'auto' }}>
                            <ApplicationProgressCardBody
                                application={application}
                                student={student}
                            />
                        </Box>
                    </CardContent>
                </Grid>
                <Grid item sm={12} xs={12}>
                    <Box pb={2} px={2}>
                        {/* Progress Bar */}
                        <Box mb={1}>
                            <LinearProgress
                                value={isNaN(progress) ? 0 : progress}
                                variant="determinate"
                            />
                            <Typography variant="caption">
                                {isNaN(progress) ? '0' : Math.round(progress)}%
                                application complete
                            </Typography>
                        </Box>
                        {/* Buttons */}
                        <DynamicButtons
                            application={application}
                            color="primary"
                            startIcon={<DoneIcon />}
                            variant="contained"
                        />
                    </Box>
                </Grid>
            </Grid>
        </Card>
    );
}
