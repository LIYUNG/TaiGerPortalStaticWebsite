import {
    Box,
    Chip,
    InputAdornment,
    Stack,
    TextField,
    Tooltip
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FilterListIcon from '@mui/icons-material/FilterList';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useTranslation } from 'react-i18next';
import type { ReactElement } from 'react';

import {
    APPLICATION_STATUS_COLOR,
    APPLICATION_STATUS_LABEL,
    APPLICATION_STATUS_ORDER,
    type ApplicationStatus
} from './applicationStatus';

export type ApplicationStatusFilter = ApplicationStatus | 'all';

/** One glyph per stage so the row reads as a funnel, not a wall of text. */
const APPLICATION_STATUS_ICON: Record<ApplicationStatus, ReactElement> = {
    pending: <RadioButtonUncheckedIcon />,
    decided: <TaskAltIcon />,
    inProgress: <PendingActionsIcon />,
    submitted: <SendIcon />,
    admitted: <EmojiEventsIcon />,
    rejected: <CancelIcon />,
    enrolled: <SchoolIcon />,
    withdrawn: <RemoveCircleOutlineIcon />
};

/** Spells out the nesting, which the counts alone can make look like a bug. */
const APPLICATION_STATUS_HINT: Record<ApplicationStatus, string> = {
    pending: 'Programs not decided yet',
    decided: 'Decided programs, including submitted and finished ones',
    inProgress: 'Decided but not submitted yet, excluding withdrawn',
    submitted: 'Submitted programs, including those with an offer result',
    admitted: 'Programs with an offer, including final enrolment',
    rejected: 'Programs rejected by the university',
    enrolled: 'The program the student finally enrolled in',
    withdrawn: 'Programs withdrawn before submission'
};

export interface ApplicationsTableToolbarProps {
    counts: Record<ApplicationStatus, number>;
    total: number;
    visibleCount: number;
    statusFilter: ApplicationStatusFilter;
    onStatusFilterChange: (status: ApplicationStatusFilter) => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
}

/**
 * Status tally + filters above the applications table. Each chip doubles as the
 * answer ("6 submitted") and the filter for drilling into it, which is what
 * makes a 20-row table readable without scrolling every column.
 */
const ApplicationsTableToolbar = ({
    counts,
    total,
    visibleCount,
    statusFilter,
    onStatusFilterChange,
    searchTerm,
    onSearchTermChange
}: ApplicationsTableToolbarProps) => {
    const { t } = useTranslation();

    // Empty buckets are noise — only offer a filter that would return rows.
    const visibleStatuses = APPLICATION_STATUS_ORDER.filter(
        (status) => counts[status] > 0
    );

    const isFiltered = statusFilter !== 'all' || searchTerm.trim() !== '';

    // Count sits in its own pill so the eye can scan numbers down the row
    // without re-reading each label.
    const chipLabel = (label: string, count: number, selected: boolean) => (
        <Box
            component="span"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
        >
            <Box component="span">{label}</Box>
            <Box
                component="span"
                sx={{
                    px: 0.75,
                    borderRadius: 1,
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    bgcolor: selected
                        ? 'rgba(255, 255, 255, 0.28)'
                        : 'action.selected'
                }}
            >
                {count}
            </Box>
        </Box>
    );

    return (
        <Stack spacing={1} sx={{ mb: 1 }}>
            <Stack
                alignItems={{ xs: 'stretch', md: 'center' }}
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={1}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.75,
                        alignItems: 'center'
                    }}
                >
                    <Chip
                        aria-label={`${t('All', { ns: 'common' })} ${total}`}
                        aria-pressed={statusFilter === 'all'}
                        color={statusFilter === 'all' ? 'primary' : 'default'}
                        icon={<FilterListIcon />}
                        label={chipLabel(
                            t('All', { ns: 'common' }),
                            total,
                            statusFilter === 'all'
                        )}
                        onClick={() => onStatusFilterChange('all')}
                        size="small"
                        sx={{ fontWeight: 500 }}
                        variant={statusFilter === 'all' ? 'filled' : 'outlined'}
                    />
                    {visibleStatuses.map((status) => {
                        const selected = statusFilter === status;
                        const label = t(APPLICATION_STATUS_LABEL[status], {
                            ns: 'common'
                        });
                        return (
                            <Tooltip
                                arrow
                                key={status}
                                title={t(APPLICATION_STATUS_HINT[status], {
                                    ns: 'common'
                                })}
                            >
                                <Chip
                                    aria-label={`${label} ${counts[status]}`}
                                    aria-pressed={selected}
                                    // Keep the semantic colour even when
                                    // unselected: an all-grey row loses the
                                    // green/red signal that makes it scannable.
                                    color={APPLICATION_STATUS_COLOR[status]}
                                    icon={APPLICATION_STATUS_ICON[status]}
                                    label={chipLabel(
                                        label,
                                        counts[status],
                                        selected
                                    )}
                                    onClick={() =>
                                        // Clicking the active chip clears it, so
                                        // the filter never becomes a trap.
                                        onStatusFilterChange(
                                            selected ? 'all' : status
                                        )
                                    }
                                    size="small"
                                    sx={{ fontWeight: 500 }}
                                    variant={selected ? 'filled' : 'outlined'}
                                />
                            </Tooltip>
                        );
                    })}
                </Box>
                <TextField
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        )
                    }}
                    inputProps={{ 'aria-label': 'search applications' }}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                    placeholder={t('Search school or program', {
                        ns: 'common'
                    })}
                    size="small"
                    sx={{ minWidth: { xs: '100%', md: 260 } }}
                    value={searchTerm}
                />
            </Stack>
            {isFiltered ? (
                <Stack alignItems="center" direction="row" spacing={1}>
                    <Chip
                        label={t('Showing {{visible}} of {{total}}', {
                            ns: 'common',
                            visible: visibleCount,
                            total,
                            defaultValue: `Showing ${visibleCount} of ${total}`
                        })}
                        size="small"
                        variant="outlined"
                    />
                    <Chip
                        color="secondary"
                        deleteIcon={<ClearIcon />}
                        label={t('Clear filters', { ns: 'common' })}
                        onClick={() => {
                            onStatusFilterChange('all');
                            onSearchTermChange('');
                        }}
                        onDelete={() => {
                            onStatusFilterChange('all');
                            onSearchTermChange('');
                        }}
                        size="small"
                        variant="outlined"
                    />
                </Stack>
            ) : null}
        </Stack>
    );
};

export default ApplicationsTableToolbar;
