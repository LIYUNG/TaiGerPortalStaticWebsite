import React, { useState } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControlLabel,
    Checkbox,
    Link,
    Typography,
    Avatar,
    Tooltip,
    Grid,
    ButtonBase,
    Stack,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { is_TaiGer_Editor, is_TaiGer_role } from '@taiger-common/core';

import InventoryIcon from '@mui/icons-material/Inventory';
import ReplayIcon from '@mui/icons-material/Replay';
import EditAgentsSubpage from '../StudDocsOverview/EditAgentsSubpage';
import EditEditorsSubpage from '../StudDocsOverview/EditEditorsSubpage';
import { is_User_Archived } from '../../../Utils/util_functions';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import EditAttributesSubpage from '../StudDocsOverview/EditAttributesSubpage';
import { COLORS, stringAvatar } from '@utils/contants';
import { useDialog } from '@hooks/useDialog';
import { updateAgents, updateAttributes, updateEditors } from '@/api';

const TaiGerUsersAvartar = ({ users, link }) => {
    return (
        users?.map((usr) => (
            <Tooltip
                key={usr._id}
                placement="bottom-start"
                title={`${usr.firstname} ${usr.lastname}`}
            >
                <Link
                    component={LinkDom}
                    to={`${link(usr._id.toString())}`}
                    underline="none"
                >
                    <Avatar
                        {...stringAvatar(`${usr.firstname} ${usr.lastname}`)}
                        src={usr?.pictureUrl}
                    />
                </Link>
            </Tooltip>
        )) || null
    );
};

const StudentBriefOverview = (props) => {
    const { user } = useAuth();
    const [student, setStudent] = useState(props.student);
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [shouldInform, setShouldInform] = useState(false);
    const { open: openAgentsDialog, setOpen: setOpenAgentsDialog } =
        useDialog(false);
    const { open: openEditorsDialog, setOpen: setOpenEditorsDialog } =
        useDialog(false);
    const { open: openAttributesDialog, setOpen: setOpenAttributesDialog } =
        useDialog(false);
    const { open: openArchivDialog, setOpen: setOpenArchivDialog } =
        useDialog(false);

    const updateStudentArchivStatus = (student_id, archiv, shouldInform) => {
        setIsLoading(true);
        props.updateStudentArchivStatus(student_id, archiv, shouldInform);
        setOpenArchivDialog(false);
        setIsLoading(false);
        setShouldInform(false);
    };

    const submitUpdateAgentlist = (
        e: React.FormEvent<HTMLFormElement>,
        updateAgentList: unknown,
        student_id: string
    ) => {
        updateAgents(updateAgentList, student_id).then(
            (resp) => {
                const { data, success } = resp.data;
                if (success) {
                    const students_temp = { ...student };
                    students_temp.agents = data.agents; // datda is single student updated
                    setOpenAgentsDialog(false);
                    setStudent(students_temp);
                }
            },
            (error) => {
                console.error(error);
            }
        );
    };

    const submitUpdateEditorlist = (
        e: React.FormEvent<HTMLFormElement>,
        updateEditorList: unknown,
        student_id: string
    ) => {
        updateEditors(updateEditorList, student_id).then(
            (resp) => {
                const { data, success } = resp.data;
                if (success) {
                    const students_temp = { ...student };
                    students_temp.editors = data.editors; // datda is single student updated
                    setStudent(students_temp);
                    setOpenEditorsDialog(false);
                } else {
                    const { message } = resp.data;
                    console.error(message);
                }
            },
            (error) => {
                console.error(error);
            }
        );
    };

    const submitUpdateAttributeslist = (
        e: React.FormEvent<HTMLFormElement>,
        updateAttributesList: unknown,
        student_id: string
    ) => {
        e.preventDefault();
        updateAttributes(updateAttributesList, student_id).then(
            (resp) => {
                const { data, success } = resp.data;
                if (success) {
                    const students_temp = { ...student };
                    students_temp.attributes = data.attributes; // datda is single student updated
                    setStudent(students_temp);
                    setOpenAttributesDialog(false);
                } else {
                    console.error(resp.data.message);
                }
            },
            (error) => {
                console.error(error);
            }
        );
    };

    return (
        <>
            <Box>
                <Grid container spacing={2}>
                    <Grid item md={6} xs={12}>
                        <Stack alignItems="center" direction="row" spacing={1}>
                            {!is_TaiGer_Editor(user) ? (
                                <Box sx={{ display: 'flex' }}>
                                    <Tooltip
                                        placement="bottom-start"
                                        title={
                                            is_User_Archived(props.student)
                                                ? t('Activate', {
                                                      ns: 'common'
                                                  })
                                                : t('Archive', { ns: 'common' })
                                        }
                                    >
                                        <IconButton
                                            onClick={() =>
                                                setOpenArchivDialog(true)
                                            }
                                        >
                                            {is_User_Archived(props.student) ? (
                                                <ReplayIcon />
                                            ) : (
                                                <InventoryIcon />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            ) : null}
                            <Avatar
                                {...stringAvatar(
                                    `${props.student.firstname} ${props.student.lastname}`
                                )}
                                src={props.student?.pictureUrl}
                                sx={{ width: 48, height: 48, mr: 2 }}
                            />
                            <Box>
                                <Typography
                                    color="textSecondary"
                                    variant="body2"
                                >
                                    {props.student.application_preference
                                        .expected_application_date ||
                                        'TBD'}{' '}
                                    {props.student.application_preference
                                        .expected_application_semester ||
                                        'TBD'}{' '}
                                    {props.student.application_preference
                                        .target_degree || 'TBD'}{' '}
                                    ({props.student.applying_program_count})
                                </Typography>
                                <Typography fontWeight="bold" variant="body1">
                                    {props.student.firstname},{' '}
                                    {props.student.lastname} {' | '}
                                    {props.student.lastname_chinese}
                                    {props.student.firstname_chinese}
                                </Typography>
                                <Typography variant="body2">
                                    {props.student.email}
                                </Typography>
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
                                <ButtonBase
                                    onClick={() =>
                                        setOpenAttributesDialog(true)
                                    }
                                    sx={{
                                        borderRadius: '50%',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            bgcolor: '000000',
                                            width: 24,
                                            height: 24
                                        }}
                                    >
                                        +
                                    </Avatar>
                                </ButtonBase>
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <Stack
                            alignItems="center"
                            direction="row"
                            justifyContent="flex-end"
                            spacing={1}
                        >
                            <Box>
                                <Typography
                                    color="textSecondary"
                                    variant="body2"
                                >
                                    {t('Agents', { ns: 'common' })}
                                </Typography>
                                <Box alignItems="center" display="flex" mt={1}>
                                    <TaiGerUsersAvartar
                                        link={DEMO.TEAM_AGENT_LINK}
                                        users={student.agents}
                                    />
                                    <ButtonBase
                                        onClick={() =>
                                            setOpenAgentsDialog(true)
                                        }
                                        sx={{
                                            borderRadius: '50%',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Avatar sx={{ bgcolor: '000000' }}>
                                            +
                                        </Avatar>
                                    </ButtonBase>
                                </Box>
                            </Box>
                            <Box>
                                <Typography
                                    color="textSecondary"
                                    variant="body2"
                                >
                                    {t('Editors', { ns: 'common' })}
                                </Typography>
                                <Box alignItems="center" display="flex" mt={1}>
                                    <TaiGerUsersAvartar
                                        link={DEMO.TEAM_EDITOR_LINK}
                                        users={student.editors}
                                    />
                                    <ButtonBase
                                        onClick={() =>
                                            setOpenEditorsDialog(true)
                                        }
                                        sx={{
                                            borderRadius: '50%',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Avatar sx={{ bgcolor: '000000' }}>
                                            +
                                        </Avatar>
                                    </ButtonBase>
                                </Box>
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
            {is_TaiGer_role(user) ? (
                <>
                    {openAgentsDialog ? (
                        <EditAgentsSubpage
                            onHide={() => setOpenAgentsDialog(false)}
                            show={openAgentsDialog}
                            student={student}
                            submitUpdateAgentlist={submitUpdateAgentlist}
                        />
                    ) : null}
                    {openEditorsDialog ? (
                        <EditEditorsSubpage
                            onHide={() => setOpenEditorsDialog(false)}
                            show={openEditorsDialog}
                            student={student}
                            submitUpdateEditorlist={submitUpdateEditorlist}
                        />
                    ) : null}
                    {openAttributesDialog ? (
                        <EditAttributesSubpage
                            onHide={() => setOpenAttributesDialog(false)}
                            show={openAttributesDialog}
                            student={student}
                            submitUpdateAttributeslist={
                                submitUpdateAttributeslist
                            }
                        />
                    ) : null}
                    {openArchivDialog ? (
                        <Dialog
                            onClose={() => setOpenArchivDialog(false)}
                            open={openArchivDialog}
                        >
                            <DialogTitle>
                                {t('Move to archive statement', {
                                    ns: 'common',
                                    studentName: `${props.student.firstname} ${props.student.lastname}`,
                                    status: `${
                                        is_User_Archived(props.student)
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
                                    disabled={isLoading}
                                    onClick={() =>
                                        updateStudentArchivStatus(
                                            props.student._id,
                                            !is_User_Archived(props.student),
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
                                <Button
                                    onClick={() => setOpenArchivDialog(false)}
                                >
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

export default StudentBriefOverview;
