import type { SelectChangeEvent } from '@mui/material';
import {
    Box,
    Button,
    Drawer,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import i18next from 'i18next';

import ExampleWithLocalizationProvider from '../../components/MaterialReactTable';
import {
    COUNTRIES_ARRAY_OPTIONS,
    SCHOOL_TAGS_DETAILED
} from '../../utils/contants';
import { updateSchoolAttributes } from '../../api';
import SearchableMultiSelect from '../../components/Input/searchableMuliselect';
import { useSnackBar } from '../../contexts/use-snack-bar';

export interface SchoolConfigEditCardData {
    school?: string;
    count?: number | string;
    tags?: string[];
    isPrivateSchool?: boolean;
    isPartnerSchool?: boolean;
    country?: string;
    schoolType?: string;
    [key: string]: string | number | boolean | string[] | undefined;
}

export interface SchoolConfigEditCardProps {
    data: SchoolConfigEditCardData;
    setDistinctSchoolsState: React.Dispatch<React.SetStateAction<SchoolConfigEditCardData[]>>;
}

const EditCard = (props: SchoolConfigEditCardProps) => {
    const [attributes, setAttributes] = useState<SchoolConfigEditCardData>(props.data);
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<unknown>,
        school: unknown
    ) => {
        if ('preventDefault' in e) e.preventDefault();
        const name = e.target.name;
        const raw = e.target.value as string;
        const value = (name === 'isPrivateSchool' || name === 'isPartnerSchool' ? raw === 'true' : raw) as string | boolean;
        setAttributes({
            ...attributes,
            school: school as string | undefined,
            [name]: value
        });
    };

    type SchoolAttributeValue = string | number | boolean | string[];

    const handleChangeByField = (field: string, school: SchoolConfigEditCardData | unknown) => (value: SchoolAttributeValue) => {
        const schoolObj: SchoolConfigEditCardData = school && typeof school === 'object' ? (school as SchoolConfigEditCardData) : {};
        const newState = { ...schoolObj };
        if (value === schoolObj[field] || (!schoolObj[field] && !value)) {
            delete newState[field];
        } else {
            newState[field] = value;
        }
        setAttributes({
            ...attributes,
            school: school as string | undefined,
            [field]: value
        });
    };

    const handleSave = async () => {
        props.setDistinctSchoolsState((prevState) => {
            // Check if the attributes object already exists in the state based on a unique key (e.g., id)
            const index = prevState.findIndex(
                (item) => item.school === attributes.school
            );

            if (index !== -1) {
                // If found, update the existing object
                return prevState.map((item, i) =>
                    i === index ? { ...item, ...attributes } : item
                );
            } else {
                // If not found, add the new object to the array
                return [...prevState, attributes];
            }
        });

        const resp = await updateSchoolAttributes(attributes);
        const { success } = resp.data;
        if (!success) {
            setSeverity('error');
            setMessage(
                resp.data?.message || 'An error occurred. Please try again.'
            );
            setOpenSnackbar(true);
            return;
        }
    };

    return (
        <Box>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <Typography variant="h6">
                    {i18next.t('School', { ns: 'common' })}: {String(attributes.school ?? '')}
                </Typography>
                <Typography sx={{ mb: 2 }} variant="subtitle1">
                    {i18next.t('Programs Count', { ns: 'common' })}:{' '}
                    {String(attributes.count ?? '')}
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel id="select-target-group">
                        {i18next.t('Is Private School', { ns: 'common' })}
                    </InputLabel>
                    <Select
                        defaultValue={String(attributes.isPrivateSchool ?? false)}
                        id="isPrivateSchool"
                        label={i18next.t('Is Private School', { ns: 'common' })}
                        labelId="isPrivateSchool"
                        name="isPrivateSchool"
                        onChange={(e) => handleChange(e, props.data.school)}
                    >
                        <MenuItem value="true">
                            {i18next.t('Yes', { ns: 'common' })}
                        </MenuItem>
                        <MenuItem value="false">
                            {i18next.t('No', { ns: 'common' })}
                        </MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel id="select-target-group">
                        {i18next.t('Is Partner School', { ns: 'common' })}
                    </InputLabel>
                    <Select
                        defaultValue={String(attributes.isPartnerSchool ?? false)}
                        id="isPartnerSchool"
                        label={i18next.t('Is Partner School', { ns: 'common' })}
                        labelId="isPartnerSchool"
                        name="isPartnerSchool"
                        onChange={(e) => handleChange(e, props.data.school)}
                    >
                        <MenuItem value="true">
                            {i18next.t('Yes', { ns: 'common' })}
                        </MenuItem>
                        <MenuItem value="false">
                            {i18next.t('No', { ns: 'common' })}
                        </MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel id="select-target-group">
                        {i18next.t('Country', { ns: 'common' })}
                    </InputLabel>
                    <Select
                        defaultValue={attributes.country ?? '-'}
                        id="country"
                        label={i18next.t('Country', { ns: 'common' })}
                        labelId="country"
                        name="country"
                        onChange={(e) => handleChange(e, props.data.school)}
                    >
                        {COUNTRIES_ARRAY_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel id="select-target-group">
                        {i18next.t('School Type', { ns: 'common' })}
                    </InputLabel>
                    <Select
                        defaultValue={attributes.schoolType ?? '-'}
                        id="schoolType"
                        label={i18next.t('School Type', { ns: 'common' })}
                        labelId="schoolType"
                        name="schoolType"
                        onChange={(e) => handleChange(e, props.data.school)}
                    >
                        <MenuItem value="-">
                            {i18next.t('Please Select', { ns: 'common' })}
                        </MenuItem>
                        <MenuItem value="University">
                            {i18next.t('University', { ns: 'common' })}
                        </MenuItem>
                        <MenuItem value="University_of_Applied_Sciences">
                            {i18next.t('University of Applied Sciences', {
                                ns: 'common'
                            })}
                        </MenuItem>
                    </Select>
                </FormControl>
                <SearchableMultiSelect
                    data={SCHOOL_TAGS_DETAILED}
                    label={undefined}
                    name="tags"
                    setValue={handleChangeByField('tags', props.data.school)}
                    value={Array.isArray(attributes.tags) ? attributes.tags : []}
                />
                {/* Additional configuration details go here */}
                <Button color="primary" type="submit" variant="contained">
                    {i18next.t('Update', { ns: 'common' })}
                </Button>
            </form>
        </Box>
    );
};

interface SchoolConfigContentProps {
    data: SchoolConfigEditCardData[];
}

const SchoolConfigContent = ({ data }: SchoolConfigContentProps) => {
    const c1_mrt: Array<{
        accessorKey: string;
        filterVariant?: 'autocomplete';
        filterFn?: string;
        header: string;
        size: number;
        Cell?: (params: { row: { original: SchoolConfigEditCardData } }) => React.ReactNode;
    }> = [
        {
            accessorKey: 'school',
            filterVariant: 'autocomplete',
            filterFn: 'contains',
            header: 'School',
            size: 240
        },
        {
            accessorKey: 'count',
            header: 'Count',
            size: 150,
            Cell: (params) => {
                return (
                    <Box
                        sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden'
                        }}
                    >
                        {String(params.row.original?.count ?? '')}
                    </Box>
                );
            }
        },
        {
            accessorKey: 'schoolType',
            header: 'School Type',
            size: 150,
            Cell: (params) => {
                return (
                    <Box
                        sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden'
                        }}
                    >
                        {String(params.row.original?.schoolType ?? '')}
                    </Box>
                );
            }
        },
        {
            accessorKey: 'isPrivateSchool',
            header: 'isPrivateSchool',
            size: 150,
            Cell: (params) => {
                return (
                    <Box
                        sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden'
                        }}
                    >
                        {params.row.original?.isPrivateSchool ? 'Yes' : 'No'}
                    </Box>
                );
            }
        },
        {
            accessorKey: 'isPartnerSchool',
            header: 'isPartnerSchool',
            size: 150,
            Cell: (params) => {
                return (
                    <Box
                        sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden'
                        }}
                    >
                        {params.row.original?.isPartnerSchool ? 'Yes' : 'No'}
                    </Box>
                );
            }
        },
        {
            accessorKey: 'country',
            header: 'Country',
            size: 150,
            Cell: (params) => {
                return (
                    <Box
                        sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden'
                        }}
                    >
                        {String(params.row.original?.country ?? '')}
                    </Box>
                );
            }
        }
    ];

    const [distinctSchoolsState, setDistinctSchoolsState] = useState<SchoolConfigEditCardData[]>(data);
    const memoizedColumnsMrt = useMemo(() => c1_mrt, [c1_mrt]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const handleDrawerClose = () => {
        setDrawerOpen(false);
    };

    const handleSchoolClick = (row: Record<string, boolean>) => {
        setRowSelection(row);
        if (isSmallScreen) {
            setDrawerOpen(true); // Open the Drawer on small screens
        }
    };

    return (
        <>
            <Grid container spacing={2}>
                {/* Left side: School list */}
                <Grid
                    item
                    md={
                        Object.keys(rowSelection) &&
                        Object.keys(rowSelection)[0]
                            ? 7
                            : 12
                    }
                    xs={12}
                >
                    <ExampleWithLocalizationProvider
                        col={memoizedColumnsMrt}
                        data={distinctSchoolsState}
                        enableMultiRowSelection={false}
                        enableRowSelection={true}
                        muiTableBodyRowProps={(params) => {
                            const row = params.row as unknown as { getToggleSelectedHandler: () => () => void };
                            return { onClick: row.getToggleSelectedHandler(), sx: { cursor: 'pointer' } };
                        }}
                        onRowSelectionChange={(updater) => {
                            const next = typeof updater === 'function' ? updater(rowSelection) : updater;
                            handleSchoolClick(next as Record<string, boolean>);
                        }}
                        rowSelection={rowSelection}
                    />
                </Grid>

                {/* Right side: Configuration panel */}
                {!isSmallScreen ? (
                    <Grid item md={5} xs={12}>
                        {Object.keys(rowSelection) &&
                        Object.keys(rowSelection)[0] ? (
                            <Paper style={{ padding: 16 }}>
                                <EditCard
                                    data={
                                        distinctSchoolsState[
                                            parseInt(
                                                Object.keys(rowSelection)[0]
                                            )
                                        ]
                                    }
                                    setDistinctSchoolsState={
                                        setDistinctSchoolsState
                                    }
                                />
                            </Paper>
                        ) : null}
                    </Grid>
                ) : null}
            </Grid>

            {/* Drawer for small screens */}
            <Drawer
                anchor="right"
                onClose={handleDrawerClose}
                open={drawerOpen}
            >
                <div style={{ width: 300, padding: 16 }}>
                    {Object.keys(rowSelection) &&
                    Object.keys(rowSelection)[0] ? (
                        <EditCard
                            data={
                                distinctSchoolsState[
                                    parseInt(Object.keys(rowSelection)[0])
                                ]
                            }
                            setDistinctSchoolsState={setDistinctSchoolsState}
                        />
                    ) : (
                        <Typography variant="h6">
                            Select a school to configure
                        </Typography>
                    )}
                    <Button
                        fullWidth
                        onClick={handleDrawerClose}
                        variant="contained"
                    >
                        Close
                    </Button>
                </div>
            </Drawer>
        </>
    );
};
export default SchoolConfigContent;
