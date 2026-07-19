import { useMemo, useState } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    Stack,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Application } from '@/api/types';
import type { IStudentResponse } from '@taiger-common/model';

import ApplicationProgressCard from '@components/ApplicationProgressCard/ApplicationProgressCard';
import {
    APPLICATION_STATUS_COLOR,
    APPLICATION_STATUS_LABEL,
    APPLICATION_STATUS_ORDER,
    countApplicationStatuses,
    matchesApplicationStatus,
    type ApplicationStatus
} from '@pages/StudentApplications/components/applicationStatus';
import DEMO from '@store/constant';

type StatusFilter = ApplicationStatus | 'all';

export interface MyApplicationsPanelProps {
    student: IStudentResponse;
}

/**
 * The dashboard's primary panel: every application the student has, filterable
 * by stage.
 *
 * Each entry is the existing ApplicationProgressCard, unchanged — it carries
 * the interview request, admission/rejection letter upload and status controls,
 * so wrapping rather than replacing it keeps all of that intact. This component
 * only adds the surrounding frame: a heading, the stage filter, and the counts.
 */
const MyApplicationsPanel = ({ student }: MyApplicationsPanelProps) => {
    const { t } = useTranslation();
    // Opens on Decided: the dashboard is about applications in flight, so a
    // programme the student has not committed to is not what they came here
    // for. Clicking the active chip still clears to the full list.
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('decided');

    const applications = useMemo(
        () => (student?.applications ?? []) as unknown as Application[],
        [student?.applications]
    );

    const counts = useMemo(
        () => countApplicationStatuses(applications),
        [applications]
    );

    const visible = useMemo(
        () =>
            applications.filter(
                (application) =>
                    statusFilter === 'all' ||
                    matchesApplicationStatus(application, statusFilter)
            ),
        [applications, statusFilter]
    );

    // 'pending' is hidden here: the dashboard is about applications in flight,
    // and an undecided program has no progress to filter on. Empty buckets are
    // dropped too — they would be dead filters.
    const availableStatuses = APPLICATION_STATUS_ORDER.filter(
        (status) => status !== 'pending' && counts[status] > 0
    );

    return (
        // Fills whatever height the dashboard grid gives it, so this panel and
        // its neighbour line up; the list inside scrolls rather than the card
        // growing without limit. width is explicit because the grid cell is a
        // flex container — without it the card would size to its content and
        // narrow whenever the student has only a few applications.
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
                    // Without this a flex child refuses to shrink below its
                    // content, and the inner overflow never engages.
                    minHeight: 0,
                    p: 2,
                    '&:last-child': { pb: 2 }
                }}
            >
                <Stack
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ mb: 1.5 }}
                >
                    <Typography fontWeight={700} variant="subtitle1">
                        {t('My Applications', { ns: 'common' })}
                    </Typography>
                    <Button
                        component={LinkDom}
                        size="small"
                        to={DEMO.STUDENT_APPLICATIONS_ID_LINK(
                            student?._id?.toString() ?? ''
                        )}
                        variant="text"
                    >
                        {t('View All', { ns: 'common' })}
                    </Button>
                </Stack>

                {applications.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">
                        {t('No applications', { ns: 'common' })}
                    </Typography>
                ) : (
                    <>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 0.75,
                                mb: 1.5
                            }}
                        >
                            {/* No explicit "All" chip: with none selected the
                                list is already unfiltered, and clicking the
                                active chip clears it, so a dedicated reset
                                would be a third way to express the same
                                state. */}
                            {availableStatuses.map((status) => {
                                const selected = statusFilter === status;
                                const label = `${t(
                                    APPLICATION_STATUS_LABEL[status],
                                    { ns: 'common' }
                                )} ${counts[status]}`;
                                return (
                                    <Chip
                                        aria-label={label}
                                        aria-pressed={selected}
                                        color={APPLICATION_STATUS_COLOR[status]}
                                        key={status}
                                        label={label}
                                        onClick={() =>
                                            // Clicking the active chip clears
                                            // it, so the filter is never a trap.
                                            setStatusFilter(
                                                selected ? 'all' : status
                                            )
                                        }
                                        size="small"
                                        variant={
                                            selected ? 'filled' : 'outlined'
                                        }
                                    />
                                );
                            })}
                        </Box>

                        {visible.length === 0 ? (
                            <Typography color="text.secondary" variant="body2">
                                {t(
                                    'No applications match the current filter.',
                                    { ns: 'common' }
                                )}
                            </Typography>
                        ) : (
                            <Grid
                                container
                                spacing={1.5}
                                sx={{
                                    flex: 1,
                                    minHeight: 0,
                                    overflowY: 'auto',
                                    // Room for the scrollbar so cards don't sit
                                    // flush against it.
                                    pr: 0.5
                                }}
                            >
                                {visible.map((application) => (
                                    <Grid
                                        item
                                        key={String(application._id)}
                                        lg={12}
                                        md={12}
                                        xs={12}
                                    >
                                        <ApplicationProgressCard
                                            application={
                                                application as unknown as Record<
                                                    string,
                                                    unknown
                                                >
                                            }
                                            student={
                                                student as unknown as Record<
                                                    string,
                                                    unknown
                                                >
                                            }
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default MyApplicationsPanel;
