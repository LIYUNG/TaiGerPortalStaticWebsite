import React, { Fragment, useState, MouseEvent } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Chip,
    CircularProgress,
    FormControlLabel,
    Checkbox,
    Link,
    Menu,
    MenuItem,
    TableCell,
    TableRow,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme
} from '@mui/material';
import {
    is_TaiGer_Student,
    is_TaiGer_Editor,
    is_TaiGer_role
} from '@taiger-common/core';

import EditAgentsSubpage from '../StudDocsOverview/EditAgentsSubpage';
import EditEditorsSubpage from '../StudDocsOverview/EditEditorsSubpage';
import { is_User_Archived } from '../../../Utils/util_functions';

import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import EditAttributesSubpage from '../StudDocsOverview/EditAttributesSubpage';
import { COLORS } from '@utils/contants';
import { IStudentResponse } from '@/types/taiger-common';

export interface StudentsAgentEditorProps {
    student: IStudentResponse;
    submitUpdateAgentlist: (
        e: React.FormEvent<HTMLFormElement>,
        updateAgentList: unknown,
        student_id: string
    ) => void;
    submitUpdateEditorlist: (
        e: React.FormEvent<HTMLFormElement>,
        updateEditorList: unknown,
        student_id: string
    ) => void;
    submitUpdateAttributeslist: (
        e: React.FormEvent<HTMLFormElement>,
        updateAttributesList: unknown,
        student_id: string
    ) => void;
    updateStudentArchivStatus: (
        student_id: string,
        archiv: boolean,
        shouldInform: boolean
    ) => void;
}

const StudentsAgentEditor = ({
    student,
    submitUpdateAgentlist,
    submitUpdateEditorlist,
    submitUpdateAttributeslist,
    updateStudentArchivStatus
}: StudentsAgentEditorProps) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const theme = useTheme();
    const [studentsAgentEditor, setStudentsAgentEditor] = useState({
        showAgentPage: false,
        showEditorPage: false,
        showAttributesPage: false,
        showArchivModalPage: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [shouldInform, setShouldInform] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const updateStudentArchivStatusHandler = (
        student_id: string,
        archiv: boolean,
        shouldInform: boolean
    ) => {
        setAnchorEl(null);
        setIsLoading(true);
        updateStudentArchivStatus(student_id, archiv, shouldInform);
        setArchivModalhide();
        setIsLoading(false);
        setShouldInform(false);
    };

    const setAgentModalhide = () => {
        setStudentsAgentEditor((prevState) => ({
            ...prevState,
            showAgentPage: false
        }));
    };

    const startEditingAgent = () => {
        setAnchorEl(null);
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
        setAnchorEl(null);
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
        setAnchorEl(null);
        setStudentsAgentEditor((prevState) => ({
            ...prevState,
            subpage: 2,
            showEditorPage: true
        }));
    };

    const startEditingAttributes = () => {
        setAnchorEl(null);
        setStudentsAgentEditor((prevState) => ({
            ...prevState,
            subpage: 3,
            showAttributesPage: true
        }));
    };

    const submitUpdateAgentlistHandler = (
        e: React.FormEvent<HTMLFormElement>,
        updateAgentList: unknown,
        student_id: string
    ) => {
        submitUpdateAgentlist(e, updateAgentList, student_id);
        setAgentModalhide();
    };

    const submitUpdateEditorlistHandler = (
        e: React.FormEvent<HTMLFormElement>,
        updateEditorList: unknown,
        student_id: string
    ) => {
        setEditorModalhide();
        submitUpdateEditorlist(e, updateEditorList, student_id);
    };

    const submitUpdateAttributeslistHandler = (
        e: React.FormEvent<HTMLFormElement>,
        updateAttributesList: unknown,
        student_id: string
    ) => {
        setAttributeModalhide();
        submitUpdateAttributeslist(e, updateAttributesList, student_id);
    };

    let studentsAgent;
    let studentsEditor;
    if (student.agents === undefined || student.agents.length === 0) {
        studentsAgent = t('No Agent assigned');
    } else {
        studentsAgent = student.agents.map((agent) => (
            <Fragment key={agent._id}>
                <Link
                    component={LinkDom}
                    style={{
                        color:
                            student.archiv === true
                                ? theme.palette.primary.contrastText
                                : ''
                    }}
                    to={`${DEMO.TEAM_AGENT_LINK(agent._id.toString())}`}
                >
                    {agent.firstname}
                </Link>
                &nbsp;
            </Fragment>
        ));
    }
    if (student.editors === undefined || student.editors.length === 0) {
        studentsEditor = t('No Editor assigned');
    } else {
        studentsEditor = student.editors.map((editor) => (
            <Fragment key={editor._id}>
                <Link
                    component={LinkDom}
                    style={{
                        color:
                            student.archiv === true
                                ? theme.palette.primary.contrastText
                                : ''
                    }}
                    to={`${DEMO.TEAM_EDITOR_LINK(editor._id.toString())}`}
                >
                    {`${editor.firstname}`}
                </Link>
                &nbsp;
            </Fragment>
        ));
    }

    return (
        <>
            <TableRow
                style={{
                    backgroundColor:
                        student.archiv === true
                            ? theme.palette.primary.main
                            : ''
                }}
                title={student.archiv === true ? 'Closed' : 'Open'}
            >
                <TableCell>
                    {is_TaiGer_role(user) && !props.isArchivPage ? (
                        <>
                            <Button
                                aria-controls={open ? 'basic-menu' : undefined}
                                aria-expanded={open ? 'true' : undefined}
                                aria-haspopup="true"
                                id="basic-button"
                                onClick={handleClick}
                                size="small"
                                variant="contained"
                            >
                                {t('Option', { ns: 'common' })}
                            </Button>
                            <Menu
                                MenuListProps={{
                                    'aria-labelledby': 'basic-button'
                                }}
                                anchorEl={anchorEl}
                                id="basic-menu"
                                onClose={handleClose}
                                open={open}
                            >
                                <MenuItem onClick={() => startEditingAgent()}>
                                    {t('Edit Agent', { ns: 'dashboard' })}
                                </MenuItem>
                                <MenuItem onClick={() => startEditingEditor()}>
                                    {t('Edit Editor', { ns: 'dashboard' })}
                                </MenuItem>
                                {!is_TaiGer_Editor(user) ? (
                                    <MenuItem
                                        onClick={() => startEditingAttributes()}
                                    >
                                        {t('Configure Attribute', {
                                            ns: 'dashboard'
                                        })}
                                    </MenuItem>
                                ) : null}
                                {!is_TaiGer_Editor(user) ? (
                                    <MenuItem
                                        onClick={() => setArchivModalOpen()}
                                    >
                                        {is_User_Archived(student)
                                            ? t('Move to Active', {
                                                  ns: 'common'
                                              })
                                            : t('Move to Archive', {
                                                  ns: 'common'
                                              })}
                                    </MenuItem>
                                ) : null}
                            </Menu>
                        </>
                    ) : null}
                </TableCell>
                {!is_TaiGer_Student(user) ? (
                    <TableCell>
                        <Typography fontWeight="bold" variant="body2">
                            <Link
                                component={LinkDom}
                                style={{
                                    color:
                                        student.archiv === true
                                            ? theme.palette.primary.contrastText
                                            : ''
                                }}
                                to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                    student._id,
                                    DEMO.PROFILE_HASH
                                )}`}
                            >
                                {student.firstname}, {student.lastname} {' | '}
                                {student.lastname_chinese}
                                {student.firstname_chinese}
                            </Link>
                        </Typography>
                        <Typography variant="body2">{student.email}</Typography>
                        {is_TaiGer_role(user)
                            ? student.attributes?.map((attribute) => (
                                  <Chip
                                      color={COLORS[attribute.value]}
                                      key={attribute._id}
                                      label={attribute.name}
                                      size="small"
                                  />
                              ))
                            : null}
                    </TableCell>
                ) : null}
                <TableCell>
                    <Typography variant="body2">{studentsAgent}</Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body2">{studentsEditor}</Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body2">
                        {student.application_preference
                            ?.expected_application_date || 'TBD'}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body2">
                        {student.application_preference
                            ?.expected_application_semester || 'TBD'}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body2">
                        {student.application_preference?.target_degree || 'TBD'}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography fontWeight="bold" variant="body2">
                        {student.academic_background?.university
                            ?.attended_university || 'TBD'}
                    </Typography>
                    <Typography variant="body2">
                        {student.academic_background?.university
                            ?.attended_university_program || 'TBD'}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body2">
                        {student?.application_preference
                            ?.target_application_field || 'TBD'}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body2">
                        {student.academic_background?.language
                            ?.english_certificate || 'TBD'}
                    </Typography>
                    <Typography variant="body2">
                        {student.academic_background?.language
                            ?.german_certificate || 'TBD'}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body2">
                        {student.academic_background?.language?.english_score ||
                            'TBD'}
                    </Typography>
                    <Typography variant="body2">
                        {student.academic_background?.language?.german_score ||
                            'TBD'}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body2">
                        {(student.academic_background?.language
                            ?.english_isPassed === 'X' &&
                            student.academic_background?.language
                                .english_test_date) ||
                            'TBD'}
                    </Typography>
                    <Typography variant="body2">
                        {(student.academic_background?.language
                            ?.german_isPassed === 'X' &&
                            student.academic_background?.language
                                .german_test_date) ||
                            'TBD'}
                    </Typography>
                </TableCell>
            </TableRow>
            {is_TaiGer_role(user) ? (
                <>
                    {studentsAgentEditor.showAgentPage ? (
                        <EditAgentsSubpage
                            onHide={setAgentModalhide}
                            show={studentsAgentEditor.showAgentPage}
                            student={student}
                            submitUpdateAgentlist={submitUpdateAgentlistHandler}
                        />
                    ) : null}
                    {studentsAgentEditor.showEditorPage ? (
                        <EditEditorsSubpage
                            onHide={setEditorModalhide}
                            show={studentsAgentEditor.showEditorPage}
                            student={student}
                            submitUpdateEditorlist={
                                submitUpdateEditorlistHandler
                            }
                        />
                    ) : null}
                    {studentsAgentEditor.showAttributesPage ? (
                        <EditAttributesSubpage
                            onHide={setAttributeModalhide}
                            show={studentsAgentEditor.showAttributesPage}
                            student={student}
                            submitUpdateAttributeslist={
                                submitUpdateAttributeslistHandler
                            }
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
                                        updateStudentArchivStatusHandler(
                                            student._id,
                                            !is_User_Archived(student),
                                            shouldInform
                                        )
                                    }
                                    variant="contained"
                                >
                                    {isLoading ? (
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
            ) : null}
        </>
    );
};

export default StudentsAgentEditor;
