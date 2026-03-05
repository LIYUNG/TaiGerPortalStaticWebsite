import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';
import { Role } from '@taiger-common/core';
import type { IStudentResponse, IUserWithId } from '@taiger-common/model';

import { getUsers } from '@/api';

interface Props {
    onHide: () => void;
    show: boolean;
    student: IStudentResponse;
    submitUpdateAgentlist: (
        e: React.SyntheticEvent,
        updateAgentList: Record<string, boolean>,
        student_id: string
    ) => void;
}

const EditAgentsSubpage = (props: Props) => {
    const { t } = useTranslation();
    const [checkboxState, setCheckboxState] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Initialize the state with checked checkboxes based on the student's agents
        getUsers(
            queryString.stringify({ role: Role.Agent, archiv: false })
        ).then(
            (resp) => {
                // TODO: check success
                const { data, success } = resp.data;
                if (success) {
                    const agents = data; //get all agent
                    const { agents: student_agents } = props.student;
                    const updateAgentList = agents.reduce(
                        (
                            prev: Record<string, boolean>,
                            { _id }: IUserWithId
                        ) => ({
                            ...prev,
                            [_id]: student_agents
                                ? student_agents.findIndex(
                                      (student_agent: { _id: string }) =>
                                          student_agent._id === _id
                                  ) > -1
                                : false
                        }),
                        {}
                    );
                    setCheckboxState({ agents, updateAgentList });
                    setIsLoaded(true);
                } else {
                    setIsLoaded(true);
                }
            },
            () => {
                // const { statusText } = resp;
                throw new Response('No data', { status: 500 });
                // setIsLoaded(true);
            }
        );
    }, [props.student, props.student.agents]);

    const handleChangeAgentlist = (e: React.SyntheticEvent) => {
        const { value } = e.target;
        setCheckboxState((prevState) => ({
            ...prevState,
            updateAgentList: {
                ...prevState.updateAgentList,
                [value]: !prevState.updateAgentList[value]
            }
        }));
    };

    const agentlist = checkboxState.agents ? (
        checkboxState.agents.map((agent: IUserWithId, i: number) => (
            <TableRow key={i + 1}>
                <TableCell>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={
                                    checkboxState?.updateAgentList[agent._id] ||
                                    false
                                }
                                onChange={(e) => handleChangeAgentlist(e)}
                                value={agent._id}
                            />
                        }
                        label={`${agent.lastname} ${agent.firstname}`}
                    />
                </TableCell>
            </TableRow>
        ))
    ) : (
        <TableRow>
            <TableCell>
                <Typography variant="h6">{t('No Agent')}</Typography>
            </TableCell>
        </TableRow>
    );

    return (
        <Dialog
            aria-labelledby="contained-modal-title-vcenter"
            maxWidth="sm"
            onClose={props.onHide}
            open={props.show}
        >
            <DialogTitle>
                Agent for {props.student.firstname} - {props.student.lastname}{' '}
                to
            </DialogTitle>
            <DialogContent>
                {isLoaded ? (
                    <>
                        <Typography variant="body1">
                            {t('Agent', { ns: 'common' })}:{' '}
                        </Typography>
                        <Table size="small">
                            <TableBody>{agentlist}</TableBody>
                        </Table>
                        <Box sx={{ mt: 2 }}>
                            <Button
                                color="primary"
                                onClick={(e) =>
                                    props.submitUpdateAgentlist(
                                        e,
                                        checkboxState.updateAgentList,
                                        props.student._id
                                    )
                                }
                                sx={{ mr: 2 }}
                                variant="contained"
                            >
                                {t('Update', { ns: 'common' })}
                            </Button>
                            <Button
                                color="secondary"
                                onClick={props.onHide}
                                variant="outlined"
                            >
                                {t('Cancel', { ns: 'common' })}
                            </Button>
                        </Box>
                    </>
                ) : (
                    <CircularProgress size={24} />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default EditAgentsSubpage;
