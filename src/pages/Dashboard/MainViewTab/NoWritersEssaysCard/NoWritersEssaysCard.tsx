import React, { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Link,
    Menu,
    MenuItem,
    TableCell,
    TableRow,
    Typography
} from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { is_TaiGer_role } from '@taiger-common/core';

import EditEssayWritersSubpage from '../StudDocsOverview/EditEssayWritersSubpage';
import type { EssayDocumentThreadForWriters } from '../StudDocsOverview/EditUserListSubpage';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import type {
    IDocumentthreadPopulated,
    IProgram,
    IUser,
    IStudentResponse
} from '@taiger-common/model';

interface NoWritersEssaysCardProps {
    essayDocumentThread: IDocumentthreadPopulated;
    isArchivPage: boolean;
    // The writers subpage fires this from a Button click, so the event is a
    // generic SyntheticEvent, not a form-submit event. Declared method-style so
    // callers that still type their handler as a FormEvent keep type-checking.
    submitUpdateEssayWriterlist(
        e: React.SyntheticEvent,
        updateEssayWriterList: Record<string, boolean>,
        essayDocumentThread_id: string
    ): void;
}

const NoWritersEssaysCard = ({
    essayDocumentThread,
    isArchivPage,
    submitUpdateEssayWriterlist
}: NoWritersEssaysCardProps) => {
    const { user } = useAuth();
    const [noEditorsStudentsCardState, setNoEditorsStudentsCardState] =
        useState({
            showEditorPage: false
        });

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const { t } = useTranslation();
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget as HTMLElement);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const setEditorModalhide = () => {
        setNoEditorsStudentsCardState((prevState) => ({
            ...prevState,
            showEditorPage: false
        }));
    };

    const startEditingEditor = () => {
        setNoEditorsStudentsCardState((prevState) => ({
            ...prevState,
            subpage: 2,
            showEditorPage: true
        }));
    };

    const submitUpdateEssayWriterlistHandler = (
        e: React.SyntheticEvent,
        updateEssayWriterList: Record<string, boolean>,
        essayDocumentThread_id: string
    ) => {
        e.preventDefault();
        setEditorModalhide();
        submitUpdateEssayWriterlist(
            e,
            updateEssayWriterList,
            essayDocumentThread_id
        );
    };

    // The thread comes back from the API with `student_id` / `program_id`
    // either populated or left as raw ids; the writers subpage only ever reads
    // the populated shape, so pass the object form and drop the id-only form.
    const essayThreadForWriters: EssayDocumentThreadForWriters = {
        ...essayDocumentThread,
        program_id:
            typeof essayDocumentThread.program_id === 'object'
                ? essayDocumentThread.program_id
                : undefined,
        student_id:
            typeof essayDocumentThread.student_id === 'object'
                ? essayDocumentThread.student_id
                : undefined
    };

    if (
        essayDocumentThread.outsourced_user_id === undefined ||
        essayDocumentThread.outsourced_user_id.length === 0
    ) {
        return (
            <>
                <TableRow>
                    {is_TaiGer_role(user as IUser) && !isArchivPage ? (
                        <TableCell>
                            <Button
                                aria-controls={open ? 'basic-menu' : undefined}
                                aria-expanded={open ? 'true' : undefined}
                                aria-haspopup="true"
                                id="basic-button"
                                onClick={(
                                    event: MouseEvent<HTMLButtonElement>
                                ) => handleClick(event)}
                                size="small"
                                variant="contained"
                            >
                                {t('Option')}
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
                                <MenuItem onClick={() => startEditingEditor()}>
                                    Edit Essay Writer
                                </MenuItem>
                            </Menu>
                        </TableCell>
                    ) : null}
                    <TableCell>
                        <Link
                            component={LinkDom}
                            to={`${DEMO.DOCUMENT_MODIFICATION_LINK(
                                essayDocumentThread?._id?.toString()
                            )}`}
                        >
                            {essayDocumentThread?.file_type}
                            {
                                (essayDocumentThread?.program_id as IProgram)
                                    ?.school
                            }
                            {
                                (essayDocumentThread?.program_id as IProgram)
                                    ?.program_name
                            }
                            {
                                (essayDocumentThread?.program_id as IProgram)
                                    ?.degree
                            }
                            {
                                (essayDocumentThread?.program_id as IProgram)
                                    ?.semester
                            }
                        </Link>
                    </TableCell>
                    <TableCell>
                        <Link
                            component={LinkDom}
                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                (
                                    essayDocumentThread.student_id as IStudentResponse
                                )?._id.toString(),
                                DEMO.PROFILE_HASH
                            )}`}
                        >
                            {
                                (
                                    essayDocumentThread.student_id as IStudentResponse
                                )?.firstname
                            }
                            ,{' '}
                            {
                                (
                                    essayDocumentThread.student_id as IStudentResponse
                                )?.lastname
                            }
                        </Link>
                    </TableCell>
                    <TableCell>
                        {
                            (essayDocumentThread.student_id as IStudentResponse)
                                ?.email
                        }
                    </TableCell>
                    <TableCell>
                        {/* TODO: adjust condition and backend returned data: message !== 0 && no outsourcer */}
                        {(essayDocumentThread.outsourced_user_id ===
                            undefined ||
                            essayDocumentThread.outsourced_user_id?.length ===
                                0) &&
                        (essayDocumentThread.messages?.length ?? 0) > 0 ? (
                            <Typography fontWeight="bold">
                                Ready to Assign
                            </Typography>
                        ) : (
                            '-'
                        )}
                    </TableCell>
                    <TableCell>
                        {(essayDocumentThread.student_id as IStudentResponse)
                            ?.application_preference
                            ?.expected_application_date || (
                            <Typography>TBD</Typography>
                        )}
                    </TableCell>
                    <TableCell>
                        {!(essayDocumentThread.student_id as IStudentResponse)
                            ?.editors ||
                        ((essayDocumentThread.student_id as IStudentResponse)
                            ?.editors?.length ?? 0) === 0 ? (
                            <Typography fontWeight="bold">
                                {t('No Editor', { ns: 'common' })}
                            </Typography>
                        ) : (
                            (
                                essayDocumentThread.student_id as IStudentResponse
                            )?.editors?.map((editor: IUser, i: number) => (
                                <Typography
                                    key={i}
                                >{`${editor.firstname}`}</Typography>
                            ))
                        )}
                    </TableCell>
                    <TableCell>
                        {!(essayDocumentThread.student_id as IStudentResponse)
                            ?.agents ||
                        ((essayDocumentThread.student_id as IStudentResponse)
                            ?.agents?.length ?? 0) === 0 ? (
                            <Typography fontWeight="bold">No Agent</Typography>
                        ) : (
                            (
                                essayDocumentThread.student_id as IStudentResponse
                            )?.agents?.map((agent: IUser, i: number) => (
                                <Typography
                                    key={i}
                                >{`${agent.firstname}`}</Typography>
                            ))
                        )}
                    </TableCell>
                </TableRow>
                {is_TaiGer_role(user as IUser) &&
                noEditorsStudentsCardState.showEditorPage ? (
                    <EditEssayWritersSubpage
                        actor="Essay Writer"
                        essayDocumentThread={essayThreadForWriters}
                        onHide={setEditorModalhide}
                        show={noEditorsStudentsCardState.showEditorPage}
                        submitUpdateEssayWriterlist={
                            submitUpdateEssayWriterlistHandler
                        }
                    />
                ) : null}
            </>
        );
    } else {
        return null;
    }
};

export default NoWritersEssaysCard;
