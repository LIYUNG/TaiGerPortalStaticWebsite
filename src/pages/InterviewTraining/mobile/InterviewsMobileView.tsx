import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Badge,
    Box,
    CircularProgress,
    IconButton,
    InputAdornment,
    Pagination,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import type {
    MRT_ColumnFiltersState,
    MRT_PaginationState
} from 'material-react-table';

import { InterviewCard, type InterviewRow } from './InterviewCard';
import { InterviewsFilterDrawer } from './InterviewsFilterDrawer';
import { countActiveFilters } from './interviewMobileFilters';

export interface InterviewsMobileViewProps {
    rows: InterviewRow[];
    total: number;
    isLoading: boolean;
    pagination: MRT_PaginationState;
    setPagination: (next: MRT_PaginationState) => void;
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
    columnFilters: MRT_ColumnFiltersState;
    setColumnFilters: (next: MRT_ColumnFiltersState) => void;
    canAssign: boolean;
    onAssign: (interview: InterviewRow) => void;
}

export const InterviewsMobileView = ({
    rows,
    total,
    isLoading,
    pagination,
    setPagination,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
    canAssign,
    onAssign
}: InterviewsMobileViewProps) => {
    const { t } = useTranslation();
    const [filtersOpen, setFiltersOpen] = useState(false);

    const activeFilters = countActiveFilters(columnFilters, globalFilter);
    const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize));

    return (
        <Box>
            <Box
                sx={{
                    bgcolor: 'background.default',
                    pb: 1,
                    position: 'sticky',
                    top: 0,
                    zIndex: 2
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    <TextField
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            )
                        }}
                        fullWidth
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder={t('Search', { ns: 'common' })}
                        size="small"
                        value={globalFilter}
                    />
                    <IconButton
                        aria-label={t('Filters', { ns: 'common' })}
                        onClick={() => setFiltersOpen(true)}
                    >
                        <Badge badgeContent={activeFilters} color="primary">
                            <FilterListIcon />
                        </Badge>
                    </IconButton>
                </Stack>
                <Typography
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}
                    variant="caption"
                >
                    {t('{{count}} interviews', {
                        count: total,
                        ns: 'interviews',
                        defaultValue: `${total} interviews`
                    })}
                </Typography>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : rows.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        {t('No interviews found', { ns: 'interviews' })}
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ mt: 1 }}>
                    {rows.map((interview) => (
                        <InterviewCard
                            canAssign={canAssign}
                            interview={interview}
                            key={String(interview.id ?? interview._id)}
                            onAssign={onAssign}
                        />
                    ))}
                </Box>
            )}

            {pageCount > 1 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <Pagination
                        color="primary"
                        count={pageCount}
                        onChange={(_e, page) =>
                            setPagination({
                                ...pagination,
                                pageIndex: page - 1
                            })
                        }
                        page={pagination.pageIndex + 1}
                        siblingCount={0}
                        size="small"
                    />
                </Box>
            ) : null}

            <InterviewsFilterDrawer
                columnFilters={columnFilters}
                globalFilter={globalFilter}
                onClose={() => setFiltersOpen(false)}
                open={filtersOpen}
                setColumnFilters={setColumnFilters}
                setGlobalFilter={setGlobalFilter}
            />
        </Box>
    );
};

export default InterviewsMobileView;
