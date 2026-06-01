import { type MouseEvent } from 'react';
import {
    Typography,
    Button,
    Card,
    Box,
    CircularProgress,
    useTheme,
    Avatar,
    Stack,
    Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { is_TaiGer_role } from '@taiger-common/core';
import i18next from 'i18next';

import DocThreadEditor from '@components/Message/DocThreadEditor';
import { stringAvatar } from '@utils/contants';
import { OutputData } from '@editorjs/editorjs';

export interface DiscussionEditorCardThread {
    isFinalVersion?: boolean;
    _id?: unknown;
    student_id?: { _id?: unknown; firstname?: string; lastname?: string };
    program_id?: unknown;
    application_id?: unknown;
    file_type?: string;
}

export interface DiscussionEditorCardUser {
    firstname: string;
    lastname: string;
    pictureUrl?: string;
    archiv?: boolean;
    _id: string;
}

export interface DiscussionEditorCardProps {
    isReadOnlyThread: boolean;
    isLocked: boolean;
    isWithdraw: boolean;
    lockTooltip: string;
    user: DiscussionEditorCardUser;
    thread: DiscussionEditorCardThread;
    buttonDisabled: boolean;
    checkResult: unknown[];
    editorState: OutputData;
    file: File[] | null;
    isSubmissionLoaded: boolean;
    handleAsFinalFile: (
        id: unknown,
        studentId: unknown,
        programId: unknown,
        isFinalVersion: unknown,
        applicationId: unknown
    ) => void;
    handleClickSave: (e: MouseEvent<HTMLElement>, editorState: unknown) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    t: (key: string, opts?: Record<string, unknown>) => string;
}

const DiscussionEditorCard = ({
    isReadOnlyThread,
    isLocked,
    isWithdraw,
    lockTooltip,
    user,
    thread,
    buttonDisabled,
    checkResult,
    editorState,
    file,
    isSubmissionLoaded,
    handleAsFinalFile,
    handleClickSave,
    onFileChange,
    t
}: DiscussionEditorCardProps) => {
    const theme = useTheme();
    const isToggleBlocked = isLocked || isWithdraw;

    return (
        <>
            {user.archiv !== true ? (
                <Card
                    sx={{
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: theme.shadows[1],
                        overflow: 'hidden',
                        mt: 1,
                        transition: 'all 0.3s',
                        '&:hover': {
                            boxShadow: theme.shadows[3],
                            borderColor: theme.palette.primary.main
                        }
                    }}
                >
                    {isReadOnlyThread ? (
                        <Box
                            sx={{
                                p: 3,
                                textAlign: 'center'
                            }}
                        >
                            {isLocked ? (
                                <WarningAmberIcon
                                    color="warning"
                                    sx={{ fontSize: 48, mb: 1 }}
                                />
                            ) : isWithdraw ? (
                                <CancelOutlinedIcon
                                    color="error"
                                    sx={{ fontSize: 48, mb: 1 }}
                                />
                            ) : (
                                <CheckCircleIcon
                                    color="success"
                                    sx={{ fontSize: 48, mb: 1 }}
                                />
                            )}
                            <Typography color="text.secondary" variant="body1">
                                {isLocked
                                    ? lockTooltip
                                    : isWithdraw
                                      ? i18next.t('thread-withdrawn', {
                                            defaultValue:
                                                'This thread is withdrawn.'
                                        })
                                      : i18next.t('thread-close')}
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            {/* Header */}
                            <Box
                                sx={{
                                    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                                    color: theme.palette.primary.contrastText,
                                    p: 1.5
                                }}
                            >
                                <Stack
                                    alignItems="center"
                                    direction="row"
                                    spacing={1.5}
                                >
                                    <Avatar
                                        {...stringAvatar(
                                            `${user.firstname} ${user.lastname}`
                                        )}
                                        src={user?.pictureUrl}
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            border: '2px solid white'
                                        }}
                                    />
                                    <Box>
                                        <Typography
                                            fontWeight="600"
                                            variant="body2"
                                        >
                                            {user.firstname} {user.lastname}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: '0.7rem',
                                                opacity: 0.9
                                            }}
                                            variant="caption"
                                        >
                                            Write a reply
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Editor Content */}
                            <Box
                                sx={{
                                    p: 2,
                                    overflowWrap: 'break-word'
                                }}
                            >
                                <DocThreadEditor
                                    buttonDisabled={buttonDisabled}
                                    checkResult={checkResult}
                                    doc_title="docModificationThreadPageState.doc_title"
                                    editorState={editorState}
                                    file={file}
                                    handleClickSave={handleClickSave}
                                    onFileChange={onFileChange}
                                    readOnly={isReadOnlyThread}
                                    readOnlyTooltip={
                                        isLocked
                                            ? lockTooltip
                                            : isWithdraw
                                              ? i18next.t('thread-withdrawn', {
                                                    defaultValue:
                                                        'This thread is withdrawn.'
                                                })
                                              : i18next.t('thread-close')
                                    }
                                    thread={thread}
                                />
                            </Box>
                        </>
                    )}
                </Card>
            ) : (
                <Card
                    sx={{
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        mt: 2,
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'grey.50'
                    }}
                >
                    <CancelOutlinedIcon
                        color="disabled"
                        sx={{ fontSize: 48, mb: 1 }}
                    />
                    <Typography color="text.secondary" variant="body1">
                        Your service is finished. Therefore, you are in
                        read-only mode.
                    </Typography>
                </Card>
            )}
            {is_TaiGer_role(user) ? (
                isToggleBlocked ? (
                    <Tooltip
                        title={
                            isLocked
                                ? lockTooltip
                                : isWithdraw
                                  ? i18next.t('thread-withdrawn', {
                                        defaultValue:
                                            'This thread is withdrawn.'
                                    })
                                  : i18next.t('thread-close')
                        }
                    >
                        <span>
                            <Button
                                color="success"
                                disabled
                                fullWidth
                                sx={{ mt: 2 }}
                                variant={
                                    thread.isFinalVersion
                                        ? 'outlined'
                                        : 'contained'
                                }
                            >
                                {isWithdraw
                                    ? i18next.t('Withdrawn', {
                                          defaultValue: 'Withdrawn'
                                      })
                                    : thread.isFinalVersion
                                      ? i18next.t('Mark as open')
                                      : i18next.t('Mark as finished')}
                            </Button>
                        </span>
                    </Tooltip>
                ) : !thread.isFinalVersion ? (
                    <Button
                        color="success"
                        fullWidth
                        onClick={() =>
                            handleAsFinalFile(
                                thread._id,
                                thread.student_id?._id,
                                thread.program_id,
                                thread.isFinalVersion,
                                thread.application_id
                            )
                        }
                        sx={{ mt: 2 }}
                        variant="contained"
                    >
                        {isSubmissionLoaded ? (
                            t('Mark as finished')
                        ) : (
                            <CircularProgress />
                        )}
                    </Button>
                ) : (
                    <Button
                        color="secondary"
                        fullWidth
                        onClick={() =>
                            handleAsFinalFile(
                                thread._id,
                                thread.student_id?._id,
                                thread.program_id,
                                thread.isFinalVersion,
                                thread.application_id
                            )
                        }
                        sx={{ mt: 2 }}
                        variant="outlined"
                    >
                        {isSubmissionLoaded ? (
                            t('Mark as open')
                        ) : (
                            <CircularProgress />
                        )}
                    </Button>
                )
            ) : null}
        </>
    );
};

export default DiscussionEditorCard;
