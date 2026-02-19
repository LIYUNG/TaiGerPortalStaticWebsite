import { MouseEvent, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Chip,
    Link,
    Menu,
    MenuItem,
    TableCell,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { is_TaiGer_role } from '@taiger-common/core';

import EditEditorsSubpage from '../StudDocsOverview/EditEditorsSubpage';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { ATTRIBUTES, COLORS } from '@utils/contants';
import { IStudentResponse } from '@/api';
import { type IUserAttribute } from '@taiger-common/model';

interface NoEditorsStudentsCardProps {
    student: IStudentResponse;
    isArchivPage: boolean;
    submitUpdateEditorlist: (
        e: FormEvent<HTMLFormElement>,
        updateEditorList: unknown,
        student_id: string
    ) => void;
}
const NoEditorsStudentsCard = ({
    student,
    isArchivPage,
    submitUpdateEditorlist
}: NoEditorsStudentsCardProps) => {
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

    const submitUpdateEditorlistHandler = (
        e: FormEvent<HTMLFormElement>,
        updateEditorList: unknown,
        student_id: string
    ) => {
        e.preventDefault();
        setEditorModalhide();
        submitUpdateEditorlist(e, updateEditorList, student_id);
    };

    if (student.editors === undefined || student.editors.length === 0) {
        return (
            <>
                <TableRow>
                    {is_TaiGer_role(user) && !isArchivPage ? (
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
                                <MenuItem onClick={() => startEditingEditor()}>
                                    Edit Editor
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
                            {student.firstname}, {student.lastname}
                        </Link>
                    </TableCell>
                    <TableCell>
                        {student.attributes?.map((att: IUserAttribute) => (
                            <Tooltip
                                key={att._id}
                                title={`${att.name}: ${
                                    ATTRIBUTES[att.value - 1].definition
                                }`}
                            >
                                <Chip
                                    color={COLORS[att.value]}
                                    data-testid={`chip-${att.name}`}
                                    label={att.name}
                                    size="small"
                                />
                            </Tooltip>
                        ))}
                    </TableCell>
                    <TableCell>
                        <Typography fontWeight="bold">
                            {student.needEditor ? 'Ready to Assign' : '-'}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography>
                            {student.application_preference
                                ?.target_program_language || 'TBD'}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography>
                            {student.application_preference
                                ?.expected_application_date || 'TBD'}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        {!student.agents || student.agents.length === 0 ? (
                            <Typography fontWeight="bold">No Agent</Typography>
                        ) : (
                            student.agents.map((agent, i) => (
                                <Typography
                                    key={i}
                                >{`${agent.firstname}`}</Typography>
                            ))
                        )}
                    </TableCell>
                </TableRow>
                {is_TaiGer_role(user) &&
                noEditorsStudentsCardState.showEditorPage ? (
                    <EditEditorsSubpage
                        onHide={setEditorModalhide}
                        setmodalhide={setEditorModalhide}
                        show={noEditorsStudentsCardState.showEditorPage}
                        student={student}
                        submitUpdateEditorlist={submitUpdateEditorlistHandler}
                    />
                ) : null}
            </>
        );
    } else {
        return null;
    }
};

export default NoEditorsStudentsCard;
