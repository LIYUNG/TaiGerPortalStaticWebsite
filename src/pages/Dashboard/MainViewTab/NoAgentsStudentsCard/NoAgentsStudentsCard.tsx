import { FormEvent, MouseEvent, useState } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    Button,
    Link,
    Menu,
    MenuItem,
    TableCell,
    TableRow,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_Admin } from '@taiger-common/core';

import EditAgentsSubpage from '../StudDocsOverview/EditAgentsSubpage';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { IStudentResponse } from '@/api/types';

interface NoAgentsStudentsCardProps {
    student: IStudentResponse;
    isArchivPage: boolean;
    submitUpdateAgentlist: (
        e: FormEvent<HTMLFormElement>,
        updateAgentList: unknown,
        student_id: string
    ) => void;
}
const NoAgentsStudentsCard = ({
    student,
    isArchivPage,
    submitUpdateAgentlist
}: NoAgentsStudentsCardProps) => {
    const { user } = useAuth();
    const [noAgentsStudentsCardState, setNoAgentsStudentsCard] = useState({
        showAgentPage: false
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
    const setAgentModalhide = () => {
        setNoAgentsStudentsCard({
            showAgentPage: false
        });
    };

    const startEditingAgent = () => {
        setNoAgentsStudentsCard({
            showAgentPage: true
        });
    };

    const submitUpdateAgentlistHandler = (
        e: FormEvent<HTMLFormElement>,
        updateAgentList: unknown,
        student_id: string
    ) => {
        e.preventDefault();
        setAgentModalhide();
        submitUpdateAgentlist(e, updateAgentList, student_id);
    };

    if (student.agents === undefined || student.agents.length === 0) {
        return (
            <>
                <TableRow>
                    {is_TaiGer_Admin(user) && !isArchivPage ? (
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
                            </Menu>
                        </TableCell>
                    ) : null}
                    <TableCell>
                        <Link
                            component={LinkDom}
                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                student._id?.toString() ?? '',
                                DEMO.PROFILE_HASH as string
                            )}`}
                        >
                            {student.firstname}
                            {', '}
                            {student.lastname}
                        </Link>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                        {student.application_preference
                            ?.expected_application_date || (
                            <Typography>TBD</Typography>
                        )}
                    </TableCell>
                </TableRow>
                {is_TaiGer_Admin(user) &&
                noAgentsStudentsCardState.showAgentPage ? (
                    <EditAgentsSubpage
                        onHide={setAgentModalhide}
                        setmodalhide={setAgentModalhide}
                        show={noAgentsStudentsCardState.showAgentPage}
                        student={student}
                        submitUpdateAgentlist={submitUpdateAgentlistHandler}
                    />
                ) : null}
            </>
        );
    } else {
        return null;
    }
};

export default NoAgentsStudentsCard;
