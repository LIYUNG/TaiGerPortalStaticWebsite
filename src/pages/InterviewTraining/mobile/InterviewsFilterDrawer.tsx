import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    MenuItem,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import type { MRT_ColumnFiltersState } from 'material-react-table';

import { getFilterValue, setFilterValue } from './interviewMobileFilters';

const STATUS_OPTIONS = [
    'Open',
    'Scheduled',
    'Trained',
    'Interviewed',
    'Closed',
    'N/A'
];

export interface InterviewsFilterDrawerProps {
    open: boolean;
    onClose: () => void;
    columnFilters: MRT_ColumnFiltersState;
    setColumnFilters: (next: MRT_ColumnFiltersState) => void;
    globalFilter: string;
    setGlobalFilter: (value: string) => void;
}

export const InterviewsFilterDrawer = ({
    open,
    onClose,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter
}: InterviewsFilterDrawerProps) => {
    const { t } = useTranslation();

    const update = (id: string, value: unknown) =>
        setColumnFilters(setFilterValue(columnFilters, id, value));

    const statusValue =
        (getFilterValue(columnFilters, 'status') as string[] | undefined) ?? [];
    const toggleStatus = (status: string) => {
        const next = statusValue.includes(status)
            ? statusValue.filter((entry) => entry !== status)
            : [...statusValue, status];
        update('status', next);
    };

    const textValue = (id: string) =>
        (getFilterValue(columnFilters, id) as string | undefined) ?? '';
    const selectValue = (id: string) =>
        (getFilterValue(columnFilters, id) as string | undefined) ?? '';

    const dateRange = (id: string): [string, string] => {
        const value = getFilterValue(columnFilters, id) as
            | (string | undefined)[]
            | undefined;
        return [value?.[0] ?? '', value?.[1] ?? ''];
    };
    const setDateRange = (id: string, index: 0 | 1, raw: string) => {
        const current = dateRange(id);
        const next: [string | undefined, string | undefined] = [...current];
        next[index] = raw || undefined;
        update(id, next);
    };

    const clearAll = () => {
        setColumnFilters([]);
        setGlobalFilter('');
    };

    return (
        <Drawer anchor="bottom" onClose={onClose} open={open}>
            <Box sx={{ maxHeight: '85vh', overflowY: 'auto', p: 2 }}>
                <Box
                    sx={{
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1
                    }}
                >
                    <Typography variant="h6">
                        {t('Filters', { ns: 'common' })}
                    </Typography>
                    <Button onClick={clearAll} size="small">
                        {t('Clear', { ns: 'common' })}
                    </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        label={t('Search', { ns: 'common' })}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        size="small"
                        value={globalFilter}
                    />

                    <Box>
                        <Typography
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5 }}
                            variant="caption"
                        >
                            {t('Status', { ns: 'common' })}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {STATUS_OPTIONS.map((status) => (
                                <Chip
                                    color={
                                        statusValue.includes(status)
                                            ? 'primary'
                                            : 'default'
                                    }
                                    key={status}
                                    label={status}
                                    onClick={() => toggleStatus(status)}
                                    size="small"
                                    variant={
                                        statusValue.includes(status)
                                            ? 'filled'
                                            : 'outlined'
                                    }
                                />
                            ))}
                        </Box>
                    </Box>

                    <TextField
                        fullWidth
                        label={t('Survey', { ns: 'common' })}
                        onChange={(e) =>
                            update('surveySubmitted', e.target.value)
                        }
                        select
                        size="small"
                        value={selectValue('surveySubmitted')}
                    >
                        <MenuItem value="">
                            {t('All', { ns: 'common' })}
                        </MenuItem>
                        <MenuItem value="true">
                            {t('Closed', { ns: 'common' })}
                        </MenuItem>
                        <MenuItem value="false">
                            {t('Pending', { ns: 'common' })}
                        </MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        label={t('Duplicate', { ns: 'common' })}
                        onChange={(e) => update('isDuplicate', e.target.value)}
                        select
                        size="small"
                        value={selectValue('isDuplicate')}
                    >
                        <MenuItem value="">
                            {t('All', { ns: 'common' })}
                        </MenuItem>
                        <MenuItem value="true">
                            {t('Yes', { ns: 'common' })}
                        </MenuItem>
                        <MenuItem value="false">
                            {t('No', { ns: 'common' })}
                        </MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        label={t('First-/ Last Name', { ns: 'common' })}
                        onChange={(e) =>
                            update('firstname_lastname', e.target.value)
                        }
                        size="small"
                        value={textValue('firstname_lastname')}
                    />
                    <TextField
                        fullWidth
                        label={t('Trainer', { ns: 'common' })}
                        onChange={(e) => update('trainer_name', e.target.value)}
                        size="small"
                        value={textValue('trainer_name')}
                    />
                    <TextField
                        fullWidth
                        label={t('Interview', { ns: 'interviews' })}
                        onChange={(e) => update('program_name', e.target.value)}
                        size="small"
                        value={textValue('program_name')}
                    />

                    <Box>
                        <Typography
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5 }}
                            variant="caption"
                        >
                            {t('Training Time', { ns: 'interviews' })}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <TextField
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                label={t('From', { ns: 'common' })}
                                onChange={(e) =>
                                    setDateRange('start', 0, e.target.value)
                                }
                                size="small"
                                type="date"
                                value={dateRange('start')[0]}
                            />
                            <TextField
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                label={t('To', { ns: 'common' })}
                                onChange={(e) =>
                                    setDateRange('start', 1, e.target.value)
                                }
                                size="small"
                                type="date"
                                value={dateRange('start')[1]}
                            />
                        </Stack>
                    </Box>

                    <Box>
                        <Typography
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5 }}
                            variant="caption"
                        >
                            {t('Official Interview Time', { ns: 'interviews' })}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <TextField
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                label={t('From', { ns: 'common' })}
                                onChange={(e) =>
                                    setDateRange(
                                        'interview_date',
                                        0,
                                        e.target.value
                                    )
                                }
                                size="small"
                                type="date"
                                value={dateRange('interview_date')[0]}
                            />
                            <TextField
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                label={t('To', { ns: 'common' })}
                                onChange={(e) =>
                                    setDateRange(
                                        'interview_date',
                                        1,
                                        e.target.value
                                    )
                                }
                                size="small"
                                type="date"
                                value={dateRange('interview_date')[1]}
                            />
                        </Stack>
                    </Box>
                </Stack>

                <Button
                    fullWidth
                    onClick={onClose}
                    sx={{ mt: 3 }}
                    variant="contained"
                >
                    {t('Show results', { ns: 'common' })}
                </Button>
            </Box>
        </Drawer>
    );
};

export default InterviewsFilterDrawer;
