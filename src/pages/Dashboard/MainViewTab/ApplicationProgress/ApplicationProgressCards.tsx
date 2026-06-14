import { Link as LinkDom } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Link,
    Stack,
    Typography
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import { useTranslation } from 'react-i18next';
import { differenceInDays } from 'date-fns';
import {
    isProgramAdmitted,
    isProgramDecided,
    isProgramSubmitted,
    isProgramWithdraw
} from '@taiger-common/core';

import { application_deadline_V2_calculator } from '../../../Utils/util_functions';
import DEMO from '@store/constant';
import type {
    IApplicationPopulated,
    IStudentResponse
} from '@taiger-common/model';

type StatusState = 'ok' | 'no' | 'unknown';

const StatusChip = ({
    label,
    state
}: {
    label: string;
    state: StatusState;
}) => {
    const icon =
        state === 'ok' ? (
            <CheckCircleIcon />
        ) : state === 'no' ? (
            <CancelIcon />
        ) : (
            <HelpIcon />
        );
    const color =
        state === 'ok' ? 'success' : state === 'no' ? 'error' : 'default';
    return (
        <Chip
            color={color}
            icon={icon}
            label={label}
            size="small"
            variant="outlined"
        />
    );
};

const MetaItem = ({ label, value }: { label: string; value?: string }) =>
    value ? (
        <Box sx={{ minWidth: 0 }}>
            <Typography color="text.secondary" variant="caption">
                {label}
            </Typography>
            <Typography noWrap variant="body2">
                {value}
            </Typography>
        </Box>
    ) : null;

/**
 * Mobile card view for a student's application progress — the same data the
 * (wide, 11-column) desktop table shows, laid out one card per application so it
 * reads without horizontal scroll. Decided applications are listed first.
 */
function ApplicationProgressCards({ student }: { student: IStudentResponse }) {
    const { t } = useTranslation();
    const today = new Date();
    const apps = student.applications ?? [];

    if (apps.length === 0) {
        return (
            <Typography color="text.secondary" sx={{ py: 2 }}>
                {t('No applications', { ns: 'common' })}
            </Typography>
        );
    }

    const applications = [
        ...apps.filter((app) => isProgramDecided(app)),
        ...apps.filter((app) => !isProgramDecided(app))
    ];

    return (
        <Stack spacing={1.5} sx={{ mt: 1 }}>
            {applications.map((application: IApplicationPopulated, i) => {
                const program = application.programId;
                const decided = isProgramDecided(application);
                const submitted = isProgramSubmitted(application);
                const link = DEMO.SINGLE_PROGRAM_LINK(
                    program?._id?.toString() ?? ''
                );
                const deadline = submitted
                    ? '-'
                    : program?.application_deadline
                      ? String(application_deadline_V2_calculator(application))
                      : '-';
                const daysLeft = submitted
                    ? '-'
                    : program?.application_deadline
                      ? String(
                            differenceInDays(
                                application_deadline_V2_calculator(application),
                                today
                            )
                        )
                      : '-';

                const decidedState: StatusState = decided
                    ? 'ok'
                    : application.decided === 'X'
                      ? 'no'
                      : 'unknown';
                const submittedState: StatusState = submitted
                    ? 'ok'
                    : isProgramWithdraw(application)
                      ? 'no'
                      : 'unknown';
                const admittedState: StatusState = isProgramAdmitted(
                    application
                )
                    ? 'ok'
                    : application.admission === 'X'
                      ? 'no'
                      : 'unknown';

                return (
                    <Card
                        key={i}
                        sx={{
                            borderColor: decided ? 'success.light' : 'divider'
                        }}
                        variant="outlined"
                    >
                        <CardContent
                            sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}
                        >
                            <Link
                                component={LinkDom}
                                sx={{ fontWeight: 700 }}
                                target="_blank"
                                to={link}
                                underline="hover"
                                variant="subtitle2"
                            >
                                {program?.school}
                            </Link>
                            <Typography sx={{ mb: 1 }} variant="body2">
                                {[program?.degree, program?.program_name]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </Typography>

                            <Box
                                sx={{
                                    display: 'grid',
                                    gap: 1,
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    mb: 1
                                }}
                            >
                                <MetaItem
                                    label={t('Semester', { ns: 'common' })}
                                    value={program?.semester}
                                />
                                <MetaItem
                                    label={t('TOEFL', { ns: 'common' })}
                                    value={program?.toefl || '-'}
                                />
                                <MetaItem
                                    label={t('IELTS', { ns: 'common' })}
                                    value={program?.ielts || '-'}
                                />
                                <MetaItem
                                    label={t('Deadline', { ns: 'common' })}
                                    value={deadline}
                                />
                                <MetaItem
                                    label={t('Days left', { ns: 'common' })}
                                    value={daysLeft}
                                />
                            </Box>

                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ flexWrap: 'wrap', gap: 1 }}
                                useFlexGap
                            >
                                <StatusChip
                                    label={t('Decided', { ns: 'common' })}
                                    state={decidedState}
                                />
                                <StatusChip
                                    label={t('Submitted', { ns: 'common' })}
                                    state={submittedState}
                                />
                                <StatusChip
                                    label={t('Admitted', { ns: 'common' })}
                                    state={admittedState}
                                />
                                <StatusChip
                                    label={t('Final Enrolment', {
                                        ns: 'common'
                                    })}
                                    state={
                                        application.finalEnrolment
                                            ? 'ok'
                                            : 'unknown'
                                    }
                                />
                            </Stack>
                        </CardContent>
                    </Card>
                );
            })}
        </Stack>
    );
}

export default ApplicationProgressCards;
