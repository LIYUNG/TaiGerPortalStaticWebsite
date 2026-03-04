import { Link as LinkDom } from 'react-router-dom';
import {
    AccordionSummary,
    Box,
    Grid,
    IconButton,
    Link,
    Tooltip,
    Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LaunchIcon from '@mui/icons-material/Launch';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
    isProgramDecided,
    isProgramSubmitted,
    isProgramWithdraw
} from '@taiger-common/core';
import type { Application } from '@/api/types';
import ApplicationLockControl from '@components/ApplicationLockControl/ApplicationLockControl';
import {
    application_deadline_V2_calculator,
    calculateApplicationLockStatus,
    calculateProgramLockStatus
} from '../../Utils/util_functions';
import { FILE_OK_SYMBOL } from '@utils/contants';
import DEMO from '@store/constant';
import i18next from 'i18next';

export interface ApplicationAccordionSummaryProps {
    application: Application;
    onStudentUpdate?: () => void;
    student?: unknown;
}

const ApplicationAccordionSummary = ({
    application
}: ApplicationAccordionSummaryProps) => {
    let lockStatus = null;
    if (application && application.programId) {
        lockStatus = calculateApplicationLockStatus(application);
    } else {
        lockStatus = application?.programId
            ? calculateProgramLockStatus(application.programId)
            : calculateProgramLockStatus({});
    }
    const isLocked = lockStatus.isLocked;

    const getStatusText = () => {
        if (isProgramSubmitted(application)) {
            return null;
        }

        if (application.decided === '-') {
            return (
                <Typography color="grey" variant="body1">
                    Undecided
                </Typography>
            );
        }

        if (application.decided === 'X') {
            return (
                <Typography color="grey" variant="body1">
                    Not wanted
                </Typography>
            );
        }

        if (isProgramWithdraw(application)) {
            return (
                <Typography fontWeight="bold">
                    {i18next.t('WITHDRAW', { ns: 'common' })}
                </Typography>
            );
        }

        return (
            <Typography fontWeight="bold">
                {i18next.t('In Progress', { ns: 'common' })}
            </Typography>
        );
    };

    const statusNode = (() => {
        if (isProgramSubmitted(application)) {
            return <IconButton>{FILE_OK_SYMBOL}</IconButton>;
        }

        const statusText = getStatusText();
        const lockIcon = isLocked ? (
            <Tooltip
                title={i18next.t(
                    'Program is locked. Contact your agent to unlock this task.',
                    { ns: 'common' }
                )}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        color: 'warning.main',
                        mb: 0.5
                    }}
                >
                    <LockOutlinedIcon fontSize="small" />
                </Box>
            </Tooltip>
        ) : null;

        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {lockIcon}
                {statusText}
            </Box>
        );
    })();

    const progressColor = isLocked
        ? 'text.disabled'
        : isProgramDecided(application)
          ? isProgramSubmitted(application)
              ? 'success.light'
              : 'error.main'
          : 'grey';

    return (
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container spacing={2}>
                <Grid item md={1} xs={1}>
                    {statusNode}
                </Grid>
                <Grid item md={1} xs={1}>
                    <Typography
                        color={progressColor}
                        sx={{ mr: 2 }}
                        variant="body1"
                    >
                        {
                            (
                                application.doc_modification_thread as
                                    | { isFinalVersion?: boolean }[]
                                    | undefined
                            )?.filter((doc) => doc.isFinalVersion).length
                        }
                        /{application.doc_modification_thread?.length || 0}
                    </Typography>
                </Grid>
                <Grid item md={8} xs={8}>
                    <Box sx={{ display: 'flex' }}>
                        <Typography
                            color={progressColor}
                            sx={{ mr: 2 }}
                            variant="body1"
                        >
                            <b>
                                {application.programId?.school} -{' '}
                                {application.programId?.degree} -{' '}
                                {application.programId?.program_name}
                            </b>
                        </Typography>
                        <Link
                            component={LinkDom}
                            target="_blank"
                            to={DEMO.SINGLE_PROGRAM_LINK(
                                String(application.programId?._id ?? '')
                            )}
                        >
                            <LaunchIcon />
                        </Link>
                    </Box>
                </Grid>
                <Grid item md={2} xs={2}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1
                        }}
                    >
                        <Typography>
                            Deadline:{' '}
                            {application_deadline_V2_calculator(application)}
                        </Typography>
                        <ApplicationLockControl application={application} />
                    </Box>
                </Grid>
            </Grid>
        </AccordionSummary>
    );
};

export default ApplicationAccordionSummary;
