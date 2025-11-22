import React from 'react';
import {
    Grid,
    Link,
    Typography,
    IconButton,
    Tooltip,
    Stack,
    Box,
    Chip
} from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplayIcon from '@mui/icons-material/Replay';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_role } from '@taiger-common/core';

import {
    latestReplyInfo,
    APPROVAL_COUNTRIES
} from '../Utils/checking-functions';
import {
    FILE_OK_SYMBOL,
    FILE_MISSING_SYMBOL,
    convertDate
} from '../../utils/contants';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';

const EditableFileThread = (props) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const isProgramLocked = props.isProgramLocked === true;
    const lockTooltip = t(
        'Program is locked. Contact an agent to unlock this task.',
        { ns: 'common' }
    );
    const applicationId = props.application?._id;

    const handleAsFinalFileThread = (documenName, isFinal) => {
        if (isProgramLocked) {
            return;
        }
        props.handleAsFinalFile(
            props.thread.doc_thread_id._id,
            props.student._id,
            applicationId,
            isFinal,
            documenName
        );
    };

    const handleDeleteFileThread = (documenName) => {
        if (isProgramLocked) {
            return;
        }
        props.onDeleteFileThread(
            props.thread.doc_thread_id._id,
            props.application,
            props.student._id,
            documenName
        );
    };

    let fileStatus;
    let documenName;
    if (props.application) {
        documenName = props.thread.doc_thread_id?.file_type;
        // program_deadline = props.application.programId.application_deadline
    } else {
        documenName = 'General' + ' - ' + props.thread.doc_thread_id?.file_type;
    }

    const documentTypographyColor = isProgramLocked
        ? 'text.disabled'
        : props.decided === 'O'
          ? 'primary.main'
          : 'text.secondary';

    let rlChip = null;
    if (props.thread.doc_thread_id?.file_type?.includes('RL')) {
        rlChip = props.application?.programId?.is_rl_specific ? (
            <Chip
                color="error"
                icon={<LabelImportantIcon />}
                label="Specific"
                size="small"
                variant="filled"
            />
        ) : (
            <Chip
                color="primary"
                icon={<LabelImportantIcon />}
                label="General"
                size="small"
                variant="filled"
            />
        );
    }

    // Check if program is from non-approval country
    const programCountry = props.application?.programId?.country;
    const isNonApprovalCountry = programCountry
        ? !APPROVAL_COUNTRIES.includes(String(programCountry).toLowerCase())
        : false;

    const documentLabel = (
        <Stack alignItems="center" direction="row" spacing={1}>
            <Typography
                sx={{
                    color: documentTypographyColor,
                    display: 'inline-flex',
                    alignItems: 'center'
                }}
            >
                {documenName}{' '}
            </Typography>
            {rlChip}
            {isNonApprovalCountry ? (
                <Chip
                    color="warning"
                    label={t('Lack of experience country', { ns: 'common' })}
                    size="small"
                    variant="outlined"
                />
            ) : null}
        </Stack>
    );

    const documentLink = isProgramLocked ? (
        <Tooltip title={lockTooltip}>
            <Box
                component="span"
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'text.disabled'
                }}
            >
                <LockOutlinedIcon color="disabled" fontSize="small" />
                {documentLabel}
            </Box>
        </Tooltip>
    ) : (
        <Link
            component={LinkDom}
            target="_blank"
            to={DEMO.DOCUMENT_MODIFICATION_LINK(
                props.thread.doc_thread_id?._id
            )}
            underline="hover"
        >
            {documentLabel}
        </Link>
    );

    fileStatus = (
        <Box
            sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 2
            }}
        >
            <Grid container spacing={2}>
                <Grid item md={8} xs={8}>
                    <Stack alignItems="center" direction="row" spacing={1}>
                        {!is_TaiGer_role(user)
                            ? props.thread.isFinalVersion && FILE_OK_SYMBOL
                            : props.thread.isFinalVersion
                              ? FILE_OK_SYMBOL
                              : FILE_MISSING_SYMBOL}
                        {documentLink}
                    </Stack>
                    <Typography color="textSecondary" variant="body2">
                        {convertDate(props.thread.doc_thread_id?.updatedAt)} by{' '}
                        {latestReplyInfo(props.thread.doc_thread_id)}
                    </Typography>
                </Grid>
                <Grid item sm={4} xs={4}>
                    <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                    >
                        {is_TaiGer_role(user) &&
                        !props.thread.isFinalVersion ? (
                            <Tooltip
                                title={
                                    isProgramLocked
                                        ? lockTooltip
                                        : t('Set as final version', {
                                              ns: 'common'
                                          })
                                }
                            >
                                <span>
                                    <IconButton
                                        disabled={isProgramLocked}
                                        onClick={() =>
                                            handleAsFinalFileThread(
                                                documenName,
                                                true
                                            )
                                        }
                                    >
                                        <CheckIcon color="success" size={24} />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : null}
                        {props.thread.isFinalVersion ? (
                            is_TaiGer_role(user) ? (
                                <Tooltip
                                    title={
                                        isProgramLocked
                                            ? lockTooltip
                                            : t('Undo', { ns: 'common' })
                                    }
                                >
                                    <span>
                                        <IconButton
                                            disabled={isProgramLocked}
                                            onClick={() =>
                                                handleAsFinalFileThread(
                                                    documenName,
                                                    false
                                                )
                                            }
                                        >
                                            <ReplayIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            ) : (
                                <Typography color="error.main">
                                    {t('Closed')}
                                </Typography>
                            )
                        ) : null}
                        {is_TaiGer_role(user) ? (
                            <Tooltip
                                title={
                                    isProgramLocked
                                        ? lockTooltip
                                        : t('Delete', { ns: 'common' })
                                }
                            >
                                <span>
                                    <IconButton
                                        disabled={isProgramLocked}
                                        onClick={() =>
                                            handleDeleteFileThread(documenName)
                                        }
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : null}
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );

    return fileStatus;
};

export default EditableFileThread;
