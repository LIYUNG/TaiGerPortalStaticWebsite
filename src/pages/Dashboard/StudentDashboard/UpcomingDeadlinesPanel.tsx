import { Link as LinkDom } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Link,
    Stack,
    Typography
} from '@mui/material';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useTranslation } from 'react-i18next';
import { differenceInCalendarDays, isValid } from 'date-fns';
import {
    isProgramDecided,
    isProgramSubmitted,
    isProgramWithdraw
} from '@taiger-common/core';
import type { Application } from '@/api/types';

import { application_deadline_V2_calculator } from '@pages/Utils/util_functions';
import DEMO from '@store/constant';

/** Only the nearest few fit before the panel needs its own scrollbar. */
const MAX_ITEMS = 5;
const URGENT_DAYS = 14;
const SOON_DAYS = 30;

export interface UpcomingDeadlinesPanelProps {
    applications: Application[];
    studentId: string;
}

interface DeadlineEntry {
    application: Application;
    deadline: Date;
    daysLeft: number;
}

/**
 * Deadlines the student can still act on, soonest first.
 *
 * Deliberately narrow: an application that is already submitted has no deadline
 * left to miss, a withdrawn one is out of play, and an undecided one is not yet
 * committed to — surfacing any of those would bury the ones that actually need
 * work this week.
 */
const collectDeadlines = (applications: Application[]): DeadlineEntry[] =>
    applications
        .filter(
            (application) =>
                isProgramDecided(application) &&
                !isProgramSubmitted(application) &&
                !isProgramWithdraw(application) &&
                Boolean(application.programId?.application_deadline)
        )
        .map((application) => {
            const deadline = new Date(
                application_deadline_V2_calculator(application)
            );
            return {
                application,
                deadline,
                daysLeft: differenceInCalendarDays(deadline, new Date())
            };
        })
        // The calculator can yield a non-date sentinel (e.g. 'WITHDRAW'), which
        // would otherwise sort as NaN and poison the ordering.
        .filter((entry) => isValid(entry.deadline))
        .sort((a, b) => a.daysLeft - b.daysLeft);

/** Chip palette — 'default' is a valid Chip colour but not an icon one. */
const urgencyColor = (daysLeft: number): 'error' | 'warning' | 'default' => {
    if (daysLeft <= URGENT_DAYS) return 'error';
    if (daysLeft <= SOON_DAYS) return 'warning';
    return 'default';
};

/** Icon palette — SvgIcon has no 'default', so a neutral maps to 'action'. */
const urgencyIconColor = (daysLeft: number): 'error' | 'warning' | 'action' => {
    const color = urgencyColor(daysLeft);
    return color === 'default' ? 'action' : color;
};

/**
 * Right-rail companion to the applications list: what is due next, and the one
 * click that acts on it.
 */
const UpcomingDeadlinesPanel = ({
    applications,
    studentId
}: UpcomingDeadlinesPanelProps) => {
    const { t } = useTranslation();
    const entries = collectDeadlines(applications);
    const shown = entries.slice(0, MAX_ITEMS);

    return (
        // Matches MyApplicationsPanel: fills the grid cell so the two align,
        // with the entry list scrolling internally, and takes its full width
        // rather than shrinking to content inside the flex grid cell.
        <Card
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%'
            }}
            variant="outlined"
        >
            <CardContent
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                    p: 2,
                    '&:last-child': { pb: 2 }
                }}
            >
                <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mb: 1.5 }}
                >
                    <Typography fontWeight={700} variant="subtitle1">
                        {t('Upcoming Deadlines', { ns: 'common' })}
                    </Typography>
                    {entries.length > 0 ? (
                        <Chip
                            color={urgencyColor(shown[0].daysLeft)}
                            label={entries.length}
                            size="small"
                        />
                    ) : null}
                </Stack>

                {shown.length === 0 ? (
                    <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                        sx={{ py: 1 }}
                    >
                        <EventAvailableIcon color="success" fontSize="small" />
                        <Typography color="text.secondary" variant="body2">
                            {t('No deadlines coming up.', { ns: 'common' })}
                        </Typography>
                    </Stack>
                ) : (
                    <Stack
                        divider={<Divider flexItem />}
                        spacing={1.5}
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                            pr: 0.5
                        }}
                    >
                        {shown.map((entry) => {
                            const program = entry.application.programId;
                            const overdue = entry.daysLeft < 0;
                            return (
                                <Box key={String(entry.application._id)}>
                                    <Stack
                                        alignItems="flex-start"
                                        direction="row"
                                        justifyContent="space-between"
                                        spacing={1}
                                    >
                                        <Box sx={{ minWidth: 0 }}>
                                            <Link
                                                component={LinkDom}
                                                sx={{ fontWeight: 600 }}
                                                to={DEMO.SINGLE_PROGRAM_LINK(
                                                    program?._id?.toString() ??
                                                        ''
                                                )}
                                                underline="hover"
                                                variant="body2"
                                            >
                                                {program?.school}
                                            </Link>
                                            <Typography
                                                color="text.secondary"
                                                variant="caption"
                                                sx={{ display: 'block' }}
                                            >
                                                {program?.program_name}
                                            </Typography>
                                            <Stack
                                                alignItems="center"
                                                direction="row"
                                                spacing={0.75}
                                                sx={{ mt: 0.5 }}
                                            >
                                                <EventBusyIcon
                                                    color={urgencyIconColor(
                                                        entry.daysLeft
                                                    )}
                                                    fontSize="small"
                                                />
                                                <Typography variant="caption">
                                                    {application_deadline_V2_calculator(
                                                        entry.application
                                                    )}
                                                </Typography>
                                                <Chip
                                                    color={urgencyColor(
                                                        entry.daysLeft
                                                    )}
                                                    label={
                                                        overdue
                                                            ? t('Overdue', {
                                                                  ns: 'common'
                                                              })
                                                            : `${entry.daysLeft} ${t(
                                                                  'days left',
                                                                  {
                                                                      ns: 'common'
                                                                  }
                                                              )}`
                                                    }
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Stack>
                                        </Box>
                                        <Button
                                            component={LinkDom}
                                            size="small"
                                            sx={{ flexShrink: 0 }}
                                            to={DEMO.STUDENT_APPLICATIONS_ID_LINK(
                                                studentId
                                            )}
                                            variant="outlined"
                                        >
                                            {t('Open', { ns: 'common' })}
                                        </Button>
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                )}

                {entries.length > MAX_ITEMS ? (
                    <Typography
                        color="text.secondary"
                        sx={{ display: 'block', mt: 1.5 }}
                        variant="caption"
                    >
                        {`+${entries.length - MAX_ITEMS} ${t('more', { ns: 'common' })}`}
                    </Typography>
                ) : null}
            </CardContent>
        </Card>
    );
};

export default UpcomingDeadlinesPanel;
