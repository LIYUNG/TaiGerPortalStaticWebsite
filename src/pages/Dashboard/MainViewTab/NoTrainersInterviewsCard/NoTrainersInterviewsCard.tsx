import React, { useState } from 'react';
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

import EditInterviewTrainersSubpage from '../StudDocsOverview/EditInterviewTrainersSubpage';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { convertDate } from '@utils/contants';
const NoTrainersInterviewsCard = (props) => {
    const { user } = useAuth();
    const [noTrainersInterviewsCardState, setNoTrainersInterviewsCardState] =
        useState({
            showTrainerPage: false
        });

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const { t } = useTranslation();
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const setTrainerModalhide = () => {
        setNoTrainersInterviewsCardState((prevState) => ({
            ...prevState,
            showTrainerPage: false
        }));
    };

    const startEditingTrainer = () => {
        setNoTrainersInterviewsCardState((prevState) => ({
            ...prevState,
            subpage: 2,
            showTrainerPage: true
        }));
    };

    const submitUpdateInterviewTrainerlist = (
        e: React.FormEvent<HTMLFormElement>,
        updateTrainerList: unknown,
        interview_id: string
    ) => {
        e.preventDefault();
        setTrainerModalhide();
        props.submitUpdateInterviewTrainerlist(
            e,
            updateTrainerList,
            interview_id
        );
    };
    if (
        props.interview.trainer_id === undefined ||
        props.interview.trainer_id.length === 0
    ) {
        return (
            <>
                <TableRow>
                    {is_TaiGer_role(user) && !props.isArchivPage ? (
                        <TableCell>
                            <Button
                                aria-controls={open ? 'basic-menu' : undefined}
                                aria-expanded={open ? 'true' : undefined}
                                aria-haspopup="true"
                                id="basic-button"
                                onClick={handleClick}
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
                                <MenuItem onClick={() => startEditingTrainer()}>
                                    Edit Interview Trainer
                                </MenuItem>
                            </Menu>
                        </TableCell>
                    ) : null}
                    <TableCell>
                        <Link
                            component={LinkDom}
                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                props.interview.student_id?._id?.toString(),
                                DEMO.PROFILE_HASH
                            )}`}
                        >
                            {props.interview.student_id?.firstname},{' '}
                            {props.interview.student_id?.lastname}
                        </Link>
                    </TableCell>
                    <TableCell>
                        <Link
                            component={LinkDom}
                            to={`${DEMO.INTERVIEW_SINGLE_LINK(
                                props.interview?._id?.toString()
                            )}`}
                        >
                            {props.interview?.program_id?.school}
                            {props.interview?.program_id?.program_name}
                            {props.interview?.program_id?.degree}
                            {props.interview?.program_id?.semester}
                        </Link>
                    </TableCell>
                    <TableCell>
                        {!props.interview.interview_date ? (
                            <Typography fontWeight="bold">TBA</Typography>
                        ) : (
                            props.interview?.interview_date &&
                            `${convertDate(props.interview?.interview_date)}`
                        )}
                    </TableCell>
                </TableRow>
                {is_TaiGer_role(user) &&
                noTrainersInterviewsCardState.showTrainerPage ? (
                    <EditInterviewTrainersSubpage
                        actor="Interview Trainer"
                        interview={props.interview}
                        onHide={setTrainerModalhide}
                        setmodalhide={setTrainerModalhide}
                        show={noTrainersInterviewsCardState.showTrainerPage}
                        submitUpdateInterviewTrainerlist={
                            submitUpdateInterviewTrainerlist
                        }
                    />
                ) : null}
            </>
        );
    } else {
        return null;
    }
};

export default NoTrainersInterviewsCard;
