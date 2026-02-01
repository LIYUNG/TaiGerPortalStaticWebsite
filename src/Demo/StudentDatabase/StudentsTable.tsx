import { useState } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    MaterialReactTable,
    useMaterialReactTable,
    createMRTColumnHelper
} from 'material-react-table';
import { getTableConfig, useTableStyles } from '../../components/table';
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

import DEMO from '../../store/constant';
import { TopToolbar } from '../../components/table/students-table/TopToolbar';
import EditAgentsSubpage from '../Dashboard/MainViewTab/StudDocsOverview/EditAgentsSubpage';
import EditEditorsSubpage from '../Dashboard/MainViewTab/StudDocsOverview/EditEditorsSubpage';
import EditAttributesSubpage from '../Dashboard/MainViewTab/StudDocsOverview/EditAttributesSubpage';
import { is_User_Archived } from '../Utils/checking-functions';

const columnHelper = createMRTColumnHelper();

export const StudentsTable = ({
    isLoading,
    data,
    submitUpdateAgentlist,
    submitUpdateEditorlist,
    submitUpdateAttributeslist,
    updateStudentArchivStatus
}) => {
    const customTableStyles = useTableStyles();
    const { t } = useTranslation();
    const tableConfig = getTableConfig(customTableStyles, isLoading);
    const [isArchivLoading, setIsArchivLoading] = useState(false);
    const [shouldInform, setShouldInform] = useState(false);
    const [studentsAgentEditor, setStudentsAgentEditor] = useState({
        showAgentPage: false,
        showEditorPage: false,
        showAttributesPage: false,
        showArchivModalPage: false
    });
    const updateStudentArchivStatusLocal = (
        student_id,
        archiv,
        shouldInform
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

    const submitUpdateAgentlistLocal = (e: React.FormEvent<HTMLFormElement>, updateAgentList: unknown, student_id: string) => {
        table.resetRowSelection();
        submitUpdateAgentlist(e, updateAgentList, student_id);
        setAgentModalhide();
    };

    const submitUpdateEditorlistLocal = (e, updateEditorList, student_id) => {
        table.resetRowSelection();
        setEditorModalhide();
        submitUpdateEditorlist(e, updateEditorList, student_id);
    };

    const submitUpdateAttributeslistLocal = (
        e: React.FormEvent<HTMLFormElement>,
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
            Cell: (params) => {
                return params.row.original.attributes?.map((attribute) => (
                    <Chip
                        color="secondary"
                        key={attribute.name}
                        label={attribute.name}
                        size="small"
                    />
                ));
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
        })
    ];

    const handleExportRows = (rows) => {
        console.log(columns);
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            decimalSeparator: '.',
            useKeysAsHeaders: true
        });

        const rowData = rows.map((row) => {
            return {
                ...columns.map((column) => row.original[column.accessorKey])
            };
        });
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };

    const table = useMaterialReactTable({
        ...tableConfig,
        columns,
        state: { isLoading },
        data: data || []
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

    const student = table
        .getSelectedRowModel()
        .rows?.map(
            ({
                original: {
                    _id,
                    firstname,
                    lastname,
                    agents,
                    editors,
                    attributes,
                    archiv
                }
            }) => ({
                _id,
                firstname,
                lastname,
                agents,
                editors,
                attributes,
                archiv
            })
        )?.[0];

    return (
        <>
            <MaterialReactTable table={table} />
            {studentsAgentEditor.showAgentPage ? (
                <EditAgentsSubpage
                    onHide={setAgentModalhide}
                    show={studentsAgentEditor.showAgentPage}
                    student={student}
                    submitUpdateAgentlist={submitUpdateAgentlistLocal}
                />
            ) : null}
            {studentsAgentEditor.showEditorPage ? (
                <EditEditorsSubpage
                    onHide={setEditorModalhide}
                    show={studentsAgentEditor.showEditorPage}
                    student={student}
                    submitUpdateEditorlist={submitUpdateEditorlistLocal}
                />
            ) : null}
            {studentsAgentEditor.showAttributesPage ? (
                <EditAttributesSubpage
                    onHide={setAttributeModalhide}
                    show={studentsAgentEditor.showAttributesPage}
                    student={student}
                    submitUpdateAttributeslist={submitUpdateAttributeslistLocal}
                />
            ) : null}
            {studentsAgentEditor.showArchivModalPage ? (
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
                                is_User_Archived(student)
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
                                    !is_User_Archived(student),
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
