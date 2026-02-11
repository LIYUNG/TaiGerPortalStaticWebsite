import { Link as LinkDom } from 'react-router-dom';
import {
    Box,
    Button,
    Stack,
    Autocomplete,
    TextField,
    Chip
} from '@mui/material';
import {
    MRT_GlobalFilterTextField as MRTGlobalFilterTextField,
    MRT_ToggleFiltersButton as MRTToggleFiltersButton
} from 'material-react-table';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { PROGRAM_SUBJECTS, SCHOOL_TAGS } from '@taiger-common/core';

import DEMO from '@store/constant';
import { useTranslation } from 'react-i18next';

interface SubjectGroupOption {
    code: string;
    label: string;
    category: string;
}

interface TopToolbarProps {
    table: {
        setColumnFilters: (
            updater: (
                prev: { id: string; value: unknown[] }[]
            ) => { id: string; value: unknown[] }[]
        ) => void;
        getSelectedRowModel: () => { rows: unknown[] };
    };
    toolbarStyle?: object;
    onAssignClick: () => void;
}

export const TopToolbar = ({
    table,
    toolbarStyle,
    onAssignClick
}: TopToolbarProps) => {
    const { t } = useTranslation();

    const subjectGroups: SubjectGroupOption[] = Object.entries(
        PROGRAM_SUBJECTS
    ).map(([code, { label, category }]) => ({
        code,
        label,
        category
    }));

    const tags: SubjectGroupOption[] = Object.entries(SCHOOL_TAGS).map(
        ([code, { label, category }]) => ({
            code,
            label,
            category
        })
    );

    const handleSubjectGroupChange = (
        _event: React.SyntheticEvent,
        newValue: SubjectGroupOption[]
    ) => {
        const selectedCodes = newValue.map((item) => item.code);
        table.setColumnFilters((prev) => {
            const existingTagsFilter = prev.find(
                (f) => f.id === 'programSubjects'
            );
            if (existingTagsFilter) {
                return prev.map((f) =>
                    f.id === 'programSubjects'
                        ? { ...f, value: selectedCodes }
                        : f
                );
            }
            return [...prev, { id: 'programSubjects', value: selectedCodes }];
        });
    };

    const handleTagChange = (
        _event: React.SyntheticEvent,
        newValue: SubjectGroupOption[]
    ) => {
        const selectedCodes = newValue.map((item) => item.code);
        table.setColumnFilters((prev) => {
            const existingTagsFilter = prev.find((f) => f.id === 'tags');
            if (existingTagsFilter) {
                return prev.map((f) =>
                    f.id === 'tags' ? { ...f, value: selectedCodes } : f
                );
            }
            return [...prev, { id: 'tags', value: selectedCodes }];
        });
    };

    return (
        <Box sx={toolbarStyle}>
            <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <MRTGlobalFilterTextField table={table} />
                <MRTToggleFiltersButton sx={{ height: '40px' }} table={table} />
                <Autocomplete
                    getOptionLabel={(option: SubjectGroupOption) =>
                        `${option.code} (${option.label})`
                    }
                    multiple
                    onChange={handleSubjectGroupChange}
                    options={subjectGroups}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={t('Filter by Subject Groups', {
                                ns: 'common'
                            })}
                            sx={{ minWidth: 200 }}
                        />
                    )}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip
                                key={option.code}
                                label={option.code}
                                size="small"
                                {...getTagProps({ index })}
                            />
                        ))
                    }
                    size="small"
                />
                <Autocomplete
                    getOptionLabel={(option: SubjectGroupOption) =>
                        `${option.code} (${option.label})`
                    }
                    multiple
                    onChange={handleTagChange}
                    options={tags}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={t('Filter by Tags', {
                                ns: 'common'
                            })}
                            sx={{ minWidth: 200 }}
                        />
                    )}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip
                                key={option.code}
                                label={option.code}
                                size="small"
                                {...getTagProps({ index })}
                            />
                        ))
                    }
                    size="small"
                />
            </Box>
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button
                    color="success"
                    disabled={
                        (table.getSelectedRowModel().rows?.length || 0) === 0
                    }
                    onClick={onAssignClick}
                    startIcon={<PersonAddIcon />}
                    sx={{ mr: 1 }}
                    variant="contained"
                >
                    {t('Assign', { ns: 'common' })}
                </Button>
                <Button
                    color="primary"
                    component={LinkDom}
                    sx={{ mr: 1 }}
                    to={DEMO.PROGRAM_ANALYSIS}
                    variant="outlined"
                >
                    {t('Program Requirements', { ns: 'common' })}
                </Button>
                <Button
                    color="primary"
                    component={LinkDom}
                    sx={{ mr: 1 }}
                    to={DEMO.SCHOOL_CONFIG}
                    variant="outlined"
                >
                    {t('School Configuration', { ns: 'common' })}
                </Button>
                <Button
                    color="primary"
                    component={LinkDom}
                    to={DEMO.NEW_PROGRAM}
                    variant="contained"
                >
                    {t('Add New Program')}
                </Button>
            </Stack>
        </Box>
    );
};
