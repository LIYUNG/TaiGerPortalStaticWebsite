import { useMemo, useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
    type MRT_VisibilityState
} from 'material-react-table';
import {
    Autocomplete,
    Box,
    Checkbox,
    FormControlLabel,
    Switch,
    TextField,
    Typography,
    Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { program_fields } from '@utils/contants';
import { LinkableNewlineText } from '../Utils/checking-functions';
import type {
    IApplicationPopulated,
    IProgramWithId
} from '@taiger-common/model';

/** Feature row: the field label plus one cell per application, keyed by app id. */
interface ComparisonRow {
    field: string;
    prop: string;
    [applicationId: string]: string | undefined;
}

/** Beyond this the table gets too wide to read, so we only preselect this many. */
const DEFAULT_VISIBLE_PROGRAMS = 4;

const FIELD_COLUMN_ID = 'field';

const getProgramValue = (
    application: IApplicationPopulated,
    prop: string
): string | undefined =>
    application.programId?.[prop as keyof IProgramWithId]?.toString();

const getProgramLabel = (application: IApplicationPopulated) =>
    [application.programId?.school, application.programId?.program_name]
        .filter(Boolean)
        .join(' - ');

const ProgramDetailsComparisonTable = ({
    applications
}: {
    applications: IApplicationPopulated[];
}) => {
    const { t } = useTranslation();
    const [hideIdenticalRows, setHideIdenticalRows] = useState(false);

    const features = useMemo(
        () => [
            ...program_fields,
            { name: t('Country', { ns: 'common' }), prop: 'country' }
        ],
        [t]
    );

    // Only the picked programs get a column. `null` means the user hasn't picked
    // yet, so we fall back to the first few programs — that keeps the selection
    // derived from `applications` (which can arrive or change after mount)
    // instead of having to sync it back into state.
    const [pickedProgramIds, setPickedProgramIds] = useState<string[] | null>(
        null
    );

    const visibleProgramIds = useMemo(() => {
        const availableIds = applications.map((application) =>
            String(application._id)
        );
        if (pickedProgramIds === null) {
            return availableIds.slice(0, DEFAULT_VISIBLE_PROGRAMS);
        }
        // A program the student dropped shouldn't linger in the picker.
        return pickedProgramIds.filter((id) => availableIds.includes(id));
    }, [applications, pickedProgramIds]);

    const selectedApplications = useMemo(
        () =>
            applications.filter((application) =>
                visibleProgramIds.includes(String(application._id))
            ),
        [applications, visibleProgramIds]
    );

    const columns = useMemo<MRT_ColumnDef<ComparisonRow>[]>(
        () => [
            {
                accessorKey: FIELD_COLUMN_ID,
                header: t('Field', { ns: 'common', defaultValue: 'Field' }),
                size: 240,
                enableHiding: false,
                enableColumnActions: false,
                muiTableBodyCellProps: {
                    sx: { fontWeight: 'bold' }
                }
            },
            ...applications.map<MRT_ColumnDef<ComparisonRow>>(
                (application) => ({
                    id: String(application._id),
                    accessorFn: (row) => row[String(application._id)] ?? '',
                    header: getProgramLabel(application),
                    size: 280,
                    enableSorting: false,
                    Cell: ({ cell }) => (
                        <LinkableNewlineText text={cell.getValue<string>()} />
                    )
                })
            )
        ],
        [applications, t]
    );

    const data = useMemo<ComparisonRow[]>(() => {
        const rows = features.map((feature) => {
            const row: ComparisonRow = {
                field: feature.name,
                prop: feature.prop
            };
            applications.forEach((application) => {
                row[String(application._id)] = getProgramValue(
                    application,
                    feature.prop
                );
            });
            return row;
        });

        if (!hideIdenticalRows || selectedApplications.length < 2) {
            return rows;
        }

        // A row only helps the comparison if the selected programs disagree.
        return rows.filter((row) => {
            const values = selectedApplications.map(
                (application) => row[String(application._id)] ?? ''
            );
            return values.some((value) => value !== values[0]);
        });
    }, [applications, features, hideIdenticalRows, selectedApplications]);

    const columnVisibility = useMemo<MRT_VisibilityState>(
        () =>
            applications.reduce<MRT_VisibilityState>((visibility, app) => {
                visibility[String(app._id)] = visibleProgramIds.includes(
                    String(app._id)
                );
                return visibility;
            }, {}),
        [applications, visibleProgramIds]
    );

    const table = useMaterialReactTable({
        columns,
        data,
        enablePagination: false,
        enableBottomToolbar: false,
        enableSorting: false,
        enableColumnFilters: false,
        enableColumnPinning: true,
        enableColumnResizing: true,
        enableColumnOrdering: true,
        enableStickyHeader: true,
        enableDensityToggle: false,
        state: { columnVisibility },
        // The picker owns the visibility state; MRT's own hide-column menu items
        // write back through the same list so both stay in sync.
        onColumnVisibilityChange: (updater) => {
            const next =
                typeof updater === 'function'
                    ? updater(columnVisibility)
                    : updater;
            setPickedProgramIds(
                applications
                    .map((application) => String(application._id))
                    .filter((id) => next[id] !== false)
            );
        },
        initialState: {
            density: 'compact',
            showGlobalFilter: true,
            columnPinning: { left: [FIELD_COLUMN_ID] }
        },
        muiTableContainerProps: { sx: { maxHeight: '70vh' } },
        muiSearchTextFieldProps: {
            placeholder: t('Search field', {
                ns: 'common',
                defaultValue: 'Search field'
            }),
            size: 'small',
            variant: 'outlined'
        },
        renderTopToolbarCustomActions: () => (
            <Box
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    p: 1,
                    width: '100%'
                }}
            >
                <Autocomplete
                    disableCloseOnSelect
                    getOptionLabel={(option) => getProgramLabel(option)}
                    isOptionEqualToValue={(option, value) =>
                        String(option._id) === String(value._id)
                    }
                    limitTags={3}
                    multiple
                    onChange={(_event, value) =>
                        setPickedProgramIds(
                            value.map((application) => String(application._id))
                        )
                    }
                    options={applications}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={t('Compare programs', {
                                ns: 'common',
                                defaultValue: 'Compare programs'
                            })}
                            size="small"
                        />
                    )}
                    renderOption={(props, option, { selected }) => {
                        const { key, ...optionProps } = props;
                        return (
                            <li key={key} {...optionProps}>
                                <Checkbox
                                    checked={selected}
                                    size="small"
                                    sx={{ mr: 1 }}
                                />
                                {getProgramLabel(option)}
                            </li>
                        );
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                            const { key, ...tagProps } = getTagProps({ index });
                            return (
                                <Chip
                                    key={key}
                                    label={getProgramLabel(option)}
                                    size="small"
                                    {...tagProps}
                                />
                            );
                        })
                    }
                    size="small"
                    sx={{ flex: 1, minWidth: 280 }}
                    value={selectedApplications}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={hideIdenticalRows}
                            onChange={(event) =>
                                setHideIdenticalRows(event.target.checked)
                            }
                            size="small"
                        />
                    }
                    label={t('Only differences', {
                        ns: 'common',
                        defaultValue: 'Only differences'
                    })}
                />
            </Box>
        )
    });

    if (applications.length === 0) {
        return (
            <Typography sx={{ p: 2 }} variant="body2">
                {t('No programs to compare', {
                    ns: 'common',
                    defaultValue: 'No programs to compare'
                })}
            </Typography>
        );
    }

    return <MaterialReactTable table={table} />;
};

export default ProgramDetailsComparisonTable;
