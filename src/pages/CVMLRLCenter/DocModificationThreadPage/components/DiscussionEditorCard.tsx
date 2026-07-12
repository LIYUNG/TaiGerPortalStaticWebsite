import { type MouseEvent } from 'react';
import { Typography, Card, Box, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import i18next from 'i18next';

import DocThreadEditor from '@components/Message/DocThreadEditor';
import type { CheckResultItem } from '@components/Message/DocThreadEditor';
import { OutputData } from '@editorjs/editorjs';

// The naming-check results arrive as `unknown[]` from the page state: keep only
// the entries that are actually check-result objects before handing them over.
const toCheckResultRecords = (
    items: unknown[]
): Record<string, CheckResultItem>[] =>
    items.filter(
        (item): item is Record<string, CheckResultItem> =>
            typeof item === 'object' && item !== null && !Array.isArray(item)
    );

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
    handleClickSave: (e: MouseEvent<HTMLElement>, editorState: unknown) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    handleClickSave,
    onFileChange
}: DiscussionEditorCardProps) => {
    const theme = useTheme();

    return (
        <>
            {user.archiv !== true ? (
                isReadOnlyThread ? (
                    <Card
                        sx={{
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: theme.shadows[1],
                            overflow: 'hidden',
                            mt: 1
                        }}
                    >
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
                    </Card>
                ) : (
                    <Box sx={{ mt: 1 }}>
                        <DocThreadEditor
                            buttonDisabled={buttonDisabled}
                            checkResult={toCheckResultRecords(checkResult)}
                            editorState={editorState}
                            file={file ?? undefined}
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
                )
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
        </>
    );
};

export default DiscussionEditorCard;
