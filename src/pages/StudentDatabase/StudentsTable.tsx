import React, { useState } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    MaterialReactTable,
    useMaterialReactTable,
    createMRTColumnHelper,
    type MRT_RowData,
    type MRT_PaginationState,
    type MRT_SortingState,
    type MRT_ColumnFiltersState,
    type MRT_Updater
} from 'material-react-table';
import { getTableConfig, useTableStyles } from '@components/table';
import { useTranslation } from 'react-i18next';
import {
    Chip,
    Link,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControlLabel,
    Checkbox,
    CircularProgress
} from '@mui/material';
import { mkConfig, generateCsv, download } from 'export-to-csv';

import DEMO from '@store/constant';
import { convertDate } from '@utils/contants';
import { TopToolbar } from '@components/table/students-table/TopToolbar';
import EditAttributesSubpage from '@pages/Dashboard/MainViewTab/StudDocsOverview/EditAttributesSubpage';
import { is_User_Archived } from '../Utils/util_functions';
import EditUserListSubpage from '../Dashboard/MainViewTab/StudDocsOverview/EditUserListSubpage';
import type { IStudentResponse } from '@taiger-common/model';

const columnHelper = createMRTColumnHelper<MRT_RowData>();

/**
 * Opt-in server-side mode. When provided, the table reflects the controlled
 * state and forwards pagination/sort/filter changes to the parent (which
 * refetches). Omit for the default client-side behaviour.
 */
export interface StudentsTableServerMode {
    rowCount: number;
    pagination: MRT_PaginationState;
    onPaginationChange: (updater: MRT_Updater<MRT_PaginationState>) => void;
    sorting: MRT_SortingState;
    onSortingChange: (updater: MRT_Updater<MRT_SortingState>) => void;
    globalFilter: string;
    onGlobalFilterChange: (updater: MRT_Updater<string>) => void;
    columnFilters: MRT_ColumnFiltersState;
    onColumnFiltersChange: (
        updater: MRT_Updater<MRT_ColumnFiltersState>
    ) => void;
}

interface StudentsTableProps {
    isLoading: boolean;
    data: Record<string, unknown>[];
    /** When set, the table runs in server-side pagination/sort/filter mode. */
    serverMode?: StudentsTableServerMode;
    submitUpdateAgentlist: (
        e: React.SyntheticEvent,
        updateAgentList: Record<string, boolean>,
        student_id: string
    ) => void;
    submitUpdateEditorlist: (
        e: React.SyntheticEvent,
        updateEditorList: Record<string, boolean>,
        student_id: string
    ) => void;
    submitUpdateAttributeslist: (
        e: React.SyntheticEvent,
        updateAttributesList: unknown,
        student_id: string
    ) => void;
    updateStudentArchivStatus: (
        student_id: string,
        archiv: boolean,
        shouldInform: boolean
    ) => void;
}

export const StudentsTable = ({
    isLoading,
    data,
    serverMode,
    submitUpdateAgentlist,
    submitUpdateEditorlist,
    submitUpdateAttributeslist,
    updateStudentArchivStatus
}: StudentsTableProps) => {
    const customTableStyles = useTableStyles();
    const { t } = useTranslation();
    const tableConfig = getTableConfig(
        { tableHeadStyle: customTableStyles.tableHeadCellStyle },
        isLoading
    );
    const [isArchivLoading, setIsArchivLoading] = useState(false);
    const [shouldInform, setShouldInform] = useState(false);
    const [studentsAgentEditor, setStudentsAgentEditor] = useState({
        showAgentPage: false,
        showEditorPage: false,
        showAttributesPage: false,
        showArchivModalPage: false
    });
    const updateStudentArchivStatusLocal = (
        student_id: string,
        archiv: boolean,
        shouldInform: boolean
    ) => {
        setIsArchivLoading(true);
        updateStudentArchivStatus(student_id, archiv, shouldInform);
        setArchivModalhide();
        setIsArchivLoading(false);
        setShouldInform(false);
    };

    const setAgentModalhide = () => {
        setStudentsAgentEditor((prevState) => ({
            ...prevState,
            showAgentPage: false
        }));
    };

    const startEditingAgent = () => {
        setStudentsAgentEditor((prevState) => ({
            ...prevState,
            subpage: 1,
            showAgentPage: true
        }));
    };

    const setEditorModalhide = () => {
        setStudentsAgentEditor((prevState) => ({
            ...prevState,
            showEditorPage: false
        }));
    };

    const setAttributeModalhide = () => {
        setStudentsAgentEditor((prevState) => ({
            ...prevState,
            showAttributesPage: false
        }));
    };

    const setArchivModalOpen = () => {
        setStudentsAgentEditor((prevState) => ({
            ...prevState,
            subpage: 4,
            showArchivModalPage: true
        }));
    };

    const setArchivModalhide = () => {
        setStudentsAgentEditor((prevState) => ({
            ...prevState,
            showArchivModalPage: false
        }));
    };

    const startEditingEditor = () => {
        setStudentsAgentEditor((prevState) => ({
            ...prevState,
            subpage: 2,
            showEditorPage: true
        }));
    };

    const startEditingAttributes = () => {
        setStudentsAgentEditor((prevState) => ({
            ...prevState,
            subpage: 3,
            showAttributesPage: true
        }));
    };

    const submitUpdateAgentlistLocal = (
        e: React.SyntheticEvent,
        updateAgentList: Record<string, boolean>,
        student_id: string
    ) => {
        table.resetRowSelection();
        submitUpdateAgentlist(e, updateAgentList, student_id);
        setAgentModalhide();
    };

    const submitUpdateEditorlistLocal = (
        e: React.SyntheticEvent,
        updateEditorList: Record<string, boolean>,
        student_id: string
    ) => {
        table.resetRowSelection();
        setEditorModalhide();
        submitUpdateEditorlist(e, updateEditorList, student_id);
    };

    const submitUpdateAttributeslistLocal = (
        e: React.SyntheticEvent,
        updateAttributesList: unknown,
        student_id: string
    ) => {
        table.resetRowSelection();
        setAttributeModalhide();
        submitUpdateAttributeslist(e, updateAttributesList, student_id);
    };

    const columns = [
        columnHelper.accessor('name_zh', {
            header: t('Name', { ns: 'common' }),
            //   filterVariant: 'autocomplete',
            filterFn: 'contains',
            size: 80,
            Cell: (params) => {
                const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                    params.row.original._id,
                    DEMO.PROFILE_HASH
                )}`;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        to={linkUrl}
                        underline="hover"
                    >
                        {params.row.original.name_zh}
                    </Link>
                );
            }
        }),
        columnHelper.accessor('name_en', {
            header: t('Name', { ns: 'common' }),
            //   filterVariant: 'autocomplete',
            filterFn: 'contains',
            size: 150,
            Cell: (params) => {
                const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                    params.row.original._id,
                    DEMO.PROFILE_HASH
                )}`;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        to={linkUrl}
                        underline="hover"
                    >
                        {params.row.original.name_en}
                    </Link>
                );
            }
        }),

        columnHelper.accessor('archiv', {
            header: t('Archive', { ns: 'common' }),
            size: 90,
            // archiv is a base scoping param (not a server column filter).
            ...(serverMode ? { enableColumnFilter: false } : {}),
            Cell: (params) => {
                return params.row.original.archiv ? 'true' : 'false';
            }
        }),
        columnHelper.accessor('agentNames', {
            header: t('Agents', { ns: 'common' }),
            size: 90,
            Cell: (params) => {
                return params.row.original.agentNames;
            }
        }),
        columnHelper.accessor('editorNames', {
            header: t('Editors', { ns: 'common' }),
            size: 90,
            Cell: (params) => {
                return params.row.original.editorNames;
            }
        }),
        columnHelper.accessor('attributesString', {
            header: t('Attributes', { ns: 'common' }),
            // Backend can filter by attribute name but cannot sort by it.
            ...(serverMode ? { enableSorting: false } : {}),
            Cell: (params) => {
                return params.row.original.attributes?.map(
                    (attribute: { name: string }) => (
                        <Chip
                            color="secondary"
                            key={attribute.name}
                            label={attribute.name}
                            size="small"
                        />
                    )
                );
            },
            size: 100
        }),
        columnHelper.accessor('attended_university', {
            header: t('University', { ns: 'common' }),
            size: 150
        }),
        columnHelper.accessor('attended_university_program', {
            header: t('Program', { ns: 'common' }),
            size: 150
        }),
        columnHelper.accessor('application_year', {
            header: t('Application Year', { ns: 'common' }),
            size: 80
        }),
        columnHelper.accessor('target_degree', {
            header: t('Target Degree', { ns: 'common' }),
            size: 80
        }),
        columnHelper.accessor('application_semester', {
            header: t('Application Year', { ns: 'common' }),
            size: 80
        }),
        columnHelper.accessor('createdAt', {
            header: t('Created At', { ns: 'common' }),
            size: 120,
            // Backend supports sorting by createdAt but not filtering by it.
            ...(serverMode ? { enableColumnFilter: false } : {}),
            Cell: (params) =>
                params.row.original.createdAt
                    ? convertDate(params.row.original.createdAt)
                    : ''
        })
    ];

    const handleExportRows = (rows: unknown[]) => {
        console.log(columns);
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            decimalSeparator: '.',
            useKeysAsHeaders: true
        });

        const typedRows = rows as { original: Record<string, unknown> }[];
        const rowData = typedRows.map((row) => {
            const rowObj: Record<string, unknown> = {};
            columns.forEach((column) => {
                const key = column.accessorKey as string;
                if (key) {
                    rowObj[key] = row.original[key];
                }
            });
            return rowObj;
        });
        const csv = generateCsv(csvConfig)(
            rowData as Record<string, string | number | boolean | null>[]
        );
        download(csvConfig)(csv);
    };

    const table = useMaterialReactTable({
        ...(tableConfig as Record<string, unknown>),
        columns,
        getRowId: (row) => (row as { _id: string })._id,
        state: {
            isLoading,
            ...(serverMode
                ? {
                      pagination: serverMode.pagination,
                      sorting: serverMode.sorting,
                      globalFilter: serverMode.globalFilter,
                      columnFilters: serverMode.columnFilters
                  }
                : {})
        },
        data: data || [],
        ...(serverMode
            ? {
                  manualPagination: true,
                  manualSorting: true,
                  manualFiltering: true,
                  rowCount: serverMode.rowCount,
                  onPaginationChange: serverMode.onPaginationChange,
                  onSortingChange: serverMode.onSortingChange,
                  onGlobalFilterChange: serverMode.onGlobalFilterChange,
                  onColumnFiltersChange: serverMode.onColumnFiltersChange
              }
            : {})
    });

    table.options.renderTopToolbar = (
        <TopToolbar
            onAgentClick={startEditingAgent}
            onArchiveClick={setArchivModalOpen}
            onAttributesClick={startEditingAttributes}
            onEditorClick={startEditingEditor}
            onExportClick={handleExportRows}
            table={table}
            toolbarStyle={customTableStyles.toolbarStyle}
        />
    );

    const student = table.getSelectedRowModel().rows?.map((row) => {
        const orig = row.original as Record<string, unknown>;
        return {
            _id: orig._id as string,
            firstname: orig.firstname as string,
            lastname: orig.lastname as string,
            agents: orig.agents as unknown[],
            editors: orig.editors as unknown[],
            attributes: orig.attributes as { name: string }[],
            archiv: orig.archiv as boolean
        };
    })?.[0] as
        | {
              _id: string;
              firstname: string;
              lastname: string;
              agents: unknown[];
              editors: unknown[];
              attributes: { name: string }[];
              archiv: boolean;
          }
        | undefined;

    return (
        <>
            <MaterialReactTable table={table} />
            {studentsAgentEditor.showAgentPage && student ? (
                <EditUserListSubpage
                    onHide={setAgentModalhide}
                    show={studentsAgentEditor.showAgentPage}
                    student={student as unknown as IStudentResponse}
                    submitUpdateList={submitUpdateAgentlistLocal}
                    variant="agent"
                />
            ) : null}
            {studentsAgentEditor.showEditorPage && student ? (
                <EditUserListSubpage
                    onHide={setEditorModalhide}
                    show={studentsAgentEditor.showEditorPage}
                    student={student as unknown as IStudentResponse}
                    submitUpdateList={submitUpdateEditorlistLocal}
                    variant="editor"
                />
            ) : null}
            {studentsAgentEditor.showAttributesPage && student ? (
                <EditAttributesSubpage
                    onHide={setAttributeModalhide}
                    show={studentsAgentEditor.showAttributesPage}
                    student={student as unknown as IStudentResponse}
                    submitUpdateAttributeslist={submitUpdateAttributeslistLocal}
                />
            ) : null}
            {studentsAgentEditor.showArchivModalPage && student ? (
                <Dialog
                    aria-labelledby="contained-modal-title-vcenter"
                    onClose={setArchivModalhide}
                    open={studentsAgentEditor.showArchivModalPage}
                >
                    <DialogTitle sx={{ mb: 2 }}>
                        {t('Move to archive statement', {
                            ns: 'common',
                            studentName: `${student.firstname} ${student.lastname}`,
                            status: `${
                                is_User_Archived(
                                    student as unknown as Parameters<
                                        typeof is_User_Archived
                                    >[0]
                                )
                                    ? t('Active')
                                    : t('Archive', { ns: 'common' })
                            }`
                        })}
                    </DialogTitle>
                    <DialogContent>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={shouldInform}
                                    id="Inform student"
                                    onChange={() =>
                                        setShouldInform(!shouldInform)
                                    }
                                />
                            }
                            label={t('Inform student for archive', {
                                ns: 'common'
                            })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            color="primary"
                            onClick={() =>
                                updateStudentArchivStatusLocal(
                                    student._id,
                                    !is_User_Archived(
                                        student as unknown as Parameters<
                                            typeof is_User_Archived
                                        >[0]
                                    ),
                                    shouldInform
                                )
                            }
                            variant="contained"
                        >
                            {isArchivLoading ? (
                                <CircularProgress size={24} />
                            ) : (
                                t('Submit', { ns: 'common' })
                            )}
                        </Button>
                        <Button onClick={setArchivModalhide}>
                            {t('Cancel', { ns: 'common' })}
                        </Button>
                    </DialogActions>
                </Dialog>
            ) : null}
        </>
    );
};
