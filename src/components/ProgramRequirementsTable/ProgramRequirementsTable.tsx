import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    FormControlLabel,
    InputLabel,
    lighten,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    SelectChangeEvent,
    Stack,
    Tooltip,
    useMediaQuery,
    useTheme,
    Chip,
    Autocomplete,
    TextField
} from '@mui/material';
import { PROGRAM_SUBJECTS } from '@taiger-common/core';
import i18next from 'i18next';
import {
    MaterialReactTable,
    MRT_GlobalFilterTextField as MRTGlobalFilterTextField,
    MRT_ToggleFiltersButton as MRTToggleFiltersButton,
    useMaterialReactTable
} from 'material-react-table';
import { useMemo, useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import InfoIcon from '@mui/icons-material/Info';
import AnalyticsIcon from '@mui/icons-material/Analytics';

import CourseAnalysisConfirmDialog from '../../pages/MyCourses/CourseAnalysisConfirmDialog';

export interface ProgramRequirementRow {
    _id: string;
    program_name?: string;
    lang?: string;
    country?: string;
    updatedAt?: string;
    attributes?: string[];
}

interface AttributeOption {
    code: string;
    label: string;
    category: string;
    groupBy: string;
}

export interface ProgramRequirementsTableProps {
    data: ProgramRequirementRow[];
    onAnalyseV2: (
        selectedIds: string[],
        language: string,
        factor: number
    ) => Promise<void>;
}

export const ProgramRequirementsTable = ({
    data,
    onAnalyseV2
}: ProgramRequirementsTableProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [language, setLanguage] = useState('zh');
    const [factor, setFactor] = useState<number>(1.5);
    const [isAnalysingV2, setIsAnalysingV2] = useState(false);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(
        {}
    );
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
    const [statedata, setStatedata] = useState({
        modalShowAssignWindow: false
    });

    const setModalHide = () => {
        setStatedata((state) => ({
            ...state,
            modalShowAssignWindow: false
        }));
    };

    const attributeOptions = useMemo<AttributeOption[]>(() => {
        const options: AttributeOption[] = [];
        Object.entries(PROGRAM_SUBJECTS).forEach(
            ([code, { label, category }]: [
                string,
                { label: string; category: string }
            ]) => {
                options.push({
                    code,
                    label,
                    category,
                    groupBy: category
                });
            }
        );
        return options;
    }, []);

    const filteredData = useMemo(() => {
        if (selectedAttributes.length === 0) return data;
        return data.filter((program) => {
            const attributes = program?.attributes;
            if (!attributes) return false;
            return selectedAttributes.some((selected) =>
                attributes.includes(selected)
            );
        });
    }, [data, selectedAttributes]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'program_name',
                header: i18next.t('Program Name', { ns: 'common' }),
                size: isMobile ? 200 : 450,
                Cell: ({
                    row
                }: {
                    row: { original: ProgramRequirementRow };
                }) => (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}
                    >
                        <Tooltip title={row.original.program_name}>
                            <span
                                style={{
                                    color: theme.palette.primary.main,
                                    cursor: 'pointer'
                                }}
                            >
                                {row.original.program_name}
                            </span>
                        </Tooltip>
                    </Box>
                )
            },
            {
                accessorKey: 'lang',
                filterVariant: 'autocomplete',
                header: i18next.t('Language', { ns: 'common' }),
                size: isMobile ? 100 : 120
            },
            {
                accessorKey: 'country',
                filterVariant: 'autocomplete',
                header: i18next.t('Country', { ns: 'common' }),
                size: isMobile ? 100 : 120
            },
            {
                accessorKey: 'updatedAt',
                header: 'updatedAt',
                size: 90
            }
        ],
        [isMobile, theme]
    );

    const onAnalyse = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsAnalysingV2(true);
        const tableInstance = table;
        const selectedRows = tableInstance.getSelectedRowModel().rows;
        await onAnalyseV2(
            selectedRows.map((row) => row.original._id),
            language,
            factor
        );
        setIsAnalysingV2(false);
        setModalHide();
    };

    const setModalShow2 = () => {
        setStatedata((state) => ({
            ...state,
            modalShowAssignWindow: true
        }));
    };

    const handleLanguageChange = (event: SelectChangeEvent<string>) => {
        setLanguage(event.target.value);
    };

    const renderTopToolbar = ({
        table: tbl
    }: {
        table: ReturnType<typeof useMaterialReactTable>;
    }) => {
        const selectedRowsCount = Object.keys(rowSelection).length;

        return (
            <Stack
                direction={isMobile ? 'column' : 'row'}
                spacing={2}
                sx={{
                    p: '16px',
                    backgroundColor: lighten(
                        theme.palette.background.default,
                        0.05
                    )
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <Stack alignItems="center" direction="row" spacing={1}>
                        <MRTGlobalFilterTextField table={tbl} />
                        <MRTToggleFiltersButton table={tbl} />
                    </Stack>
                </Box>
                <Stack
                    alignItems={isMobile ? 'stretch' : 'center'}
                    direction={isMobile ? 'column' : 'row'}
                    spacing={2}
                >
                    <Autocomplete
                        getOptionLabel={(option: AttributeOption) =>
                            `${option.code} (${option.label})`
                        }
                        multiple
                        onChange={(
                            _event: React.SyntheticEvent,
                            newValue: AttributeOption[]
                        ) => {
                            setSelectedAttributes(
                                newValue.map((item) => item.code)
                            );
                        }}
                        options={attributeOptions}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={i18next.t('Filter by Attributes', {
                                    ns: 'common'
                                })}
                                sx={{ minWidth: 250 }}
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
                        value={attributeOptions.filter((option) =>
                            selectedAttributes.includes(option.code)
                        )}
                    />
                    <FormControl size="small">
                        <InputLabel id="select-factor">
                            {i18next.t('Conversion factor', {
                                ns: 'common'
                            })}
                        </InputLabel>
                        <Select
                            id="convertFactor"
                            label={i18next.t('Conversion factor', {
                                ns: 'common'
                            })}
                            labelId="select-factor"
                            onChange={(e) => setFactor(Number(e.target.value))}
                            value={factor}
                        >
                            <MenuItem value={1}>1</MenuItem>
                            <MenuItem value={1.5}>1.5</MenuItem>
                            <MenuItem value={2}>2</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl component="fieldset">
                        <RadioGroup
                            onChange={handleLanguageChange}
                            row
                            value={language}
                        >
                            <FormControlLabel
                                control={<Radio size="small" />}
                                label="English"
                                value="en"
                            />
                            <FormControlLabel
                                control={<Radio size="small" />}
                                label="中文"
                                value="zh"
                            />
                        </RadioGroup>
                    </FormControl>
                    <Tooltip
                        title={
                            selectedRowsCount === 0
                                ? i18next.t(
                                      'Please select programs to analyze',
                                      { ns: 'common' }
                                  )
                                : i18next.t('Analyze selected programs', {
                                      ns: 'common'
                                  })
                        }
                    >
                        <span>
                            <Button
                                color="primary"
                                disabled={selectedRowsCount === 0}
                                endIcon={
                                    isAnalysingV2 ? (
                                        <CircularProgress size={20} />
                                    ) : (
                                        <AnalyticsIcon />
                                    )
                                }
                                fullWidth={isMobile}
                                onClick={setModalShow2}
                                variant="contained"
                            >
                                {isAnalysingV2
                                    ? i18next.t('Analysing', {
                                          ns: 'courses'
                                      })
                                    : i18next.t('Analyse V2', {
                                          ns: 'courses'
                                      })}
                                {selectedRowsCount > 0 &&
                                    ` (${selectedRowsCount})`}
                            </Button>
                        </span>
                    </Tooltip>
                </Stack>
            </Stack>
        );
    };

    const table = useMaterialReactTable({
        columns,
        data: filteredData,
        enableColumnFilterModes: true,
        enableColumnOrdering: true,
        enableColumnPinning: true,
        enableFacetedValues: true,
        enableRowSelection: true,
        initialState: {
            showColumnFilters: true,
            showGlobalFilter: true,
            columnPinning: {
                left: ['mrt-row-expand', 'mrt-row-select']
            },
            density: 'compact'
        },
        muiTableBodyRowProps: ({ row }) => ({
            onClick: row.getToggleSelectedHandler(),
            sx: {
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: lighten(theme.palette.primary.light, 0.9)
                }
            }
        }),
        onRowSelectionChange: setRowSelection,
        state: { rowSelection },
        paginationDisplayMode: 'pages',
        positionToolbarAlertBanner: 'bottom',
        muiSearchTextFieldProps: {
            size: 'small',
            variant: 'outlined',
            placeholder: i18next.t('Search programs...', { ns: 'common' }),
            sx: { minWidth: isMobile ? '100%' : 300 }
        },
        muiPaginationProps: {
            color: 'secondary',
            rowsPerPageOptions: [10, 20, 30],
            shape: 'rounded',
            variant: 'outlined'
        },
        renderTopToolbar
    });

    const isButtonDisable =
        isAnalysingV2 || !(Object.keys(rowSelection)?.length > 0);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ position: 'relative' }}>
                <MaterialReactTable table={table} />
                {data.length === 0 && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            color: theme.palette.text.secondary
                        }}
                    >
                        <InfoIcon sx={{ fontSize: 48, mb: 1 }} />
                        <Box>
                            {i18next.t('No programs available', {
                                ns: 'common'
                            })}
                        </Box>
                    </Box>
                )}
                <CourseAnalysisConfirmDialog
                    data={table
                        .getSelectedRowModel()
                        .rows.map((row) => row.original)}
                    isButtonDisable={isButtonDisable}
                    onAnalyse={onAnalyse}
                    setModalHide={setModalHide}
                    show={statedata.modalShowAssignWindow}
                />
            </Box>
        </LocalizationProvider>
    );
};
