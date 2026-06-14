import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Card,
    Chip,
    Link,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { isProgramDecided } from '@taiger-common/core';

import DEMO from '@store/constant';
import { convertDate } from '@utils/contants';
import { calculateApplicationLockStatus } from '../../../Utils/util_functions';
import type {
    IStudentResponse,
    IDocumentthreadWithId,
    IUserWithId
} from '@taiger-common/model';

export interface PendingEditorReplyCardProps {
    student: IStudentResponse;
}

interface PendingItem {
    id: string;
    label: string;
    to: string;
    updatedAt?: string;
    locked: boolean;
}

// Documents where the student sent the last message and the thread isn't final —
// i.e. the ball is in the editor's court. Mirrors the old RespondedThreads logic
// but also surfaces general-doc threads when the student has no applications yet.
const buildPendingItems = (student: IStudentResponse): PendingItem[] => {
    const items: PendingItem[] = [];
    const studentIdStr = String((student as IUserWithId)._id ?? '');

    (student.generaldocs_threads ?? []).forEach((thread) => {
        const docThread = thread.doc_thread_id as
            | IDocumentthreadWithId
            | undefined;
        if (
            !thread.isFinalVersion &&
            thread.latest_message_left_by_id === studentIdStr &&
            docThread?._id
        ) {
            items.push({
                id: `general-${docThread._id}`,
                label: docThread.file_type ?? '',
                to: DEMO.DOCUMENT_MODIFICATION_LINK(docThread._id.toString()),
                updatedAt: thread.updatedAt,
                locked: false
            });
        }
    });

    (student.applications ?? [])
        .filter((application) => isProgramDecided(application))
        .forEach((application) => {
            const locked = calculateApplicationLockStatus(application).isLocked;
            (application.doc_modification_thread ?? []).forEach((appThread) => {
                const docThread = appThread.doc_thread_id as
                    | IDocumentthreadWithId
                    | undefined;
                if (
                    !appThread.isFinalVersion &&
                    appThread.latest_message_left_by_id === studentIdStr &&
                    docThread?._id
                ) {
                    items.push({
                        id: `app-${docThread._id}`,
                        label: [
                            docThread.file_type,
                            application.programId?.school,
                            application.programId?.program_name
                        ]
                            .filter(Boolean)
                            .join(' · '),
                        to: DEMO.DOCUMENT_MODIFICATION_LINK(
                            docThread._id.toString()
                        ),
                        updatedAt: appThread.updatedAt,
                        locked
                    });
                }
            });
        });

    return items;
};

const PendingEditorReplyCard = ({ student }: PendingEditorReplyCardProps) => {
    const { t } = useTranslation();
    const items = buildPendingItems(student);

    return (
        <Card sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Box
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: 1,
                    mb: 1.5
                }}
            >
                <HourglassTopOutlinedIcon color="warning" fontSize="small" />
                <Typography
                    sx={{ flexGrow: 1, fontWeight: 600 }}
                    variant="subtitle1"
                >
                    {t('Waiting for Editor reply', { ns: 'common' })}
                </Typography>
                {items.length > 0 ? (
                    <Chip color="warning" label={items.length} size="small" />
                ) : null}
            </Box>

            {items.length === 0 ? (
                <Box
                    sx={{
                        alignItems: 'center',
                        color: 'text.secondary',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        py: 2,
                        textAlign: 'center'
                    }}
                >
                    <MarkEmailReadOutlinedIcon color="success" />
                    <Typography variant="body2">
                        {t('Your editor has your latest replies.', {
                            ns: 'common'
                        })}
                    </Typography>
                </Box>
            ) : (
                <Stack spacing={1}>
                    {items.map((item) => (
                        <Box
                            key={item.id}
                            sx={{
                                alignItems: 'center',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1.5,
                                display: 'flex',
                                gap: 1,
                                justifyContent: 'space-between',
                                p: 1
                            }}
                        >
                            {item.locked ? (
                                <Tooltip
                                    title={t(
                                        'Program is locked. Contact your agent to unlock this task.',
                                        { ns: 'common' }
                                    )}
                                >
                                    <Typography
                                        color="text.disabled"
                                        sx={{
                                            alignItems: 'center',
                                            display: 'inline-flex',
                                            gap: 0.5,
                                            minWidth: 0
                                        }}
                                        variant="body2"
                                    >
                                        <LockOutlinedIcon fontSize="inherit" />
                                        {item.label}
                                    </Typography>
                                </Tooltip>
                            ) : (
                                <Link
                                    component={LinkDom}
                                    sx={{ minWidth: 0 }}
                                    to={item.to}
                                    underline="hover"
                                    variant="body2"
                                >
                                    {item.label}
                                </Link>
                            )}
                            <Typography
                                color="text.secondary"
                                sx={{ flexShrink: 0 }}
                                variant="caption"
                            >
                                {item.updatedAt
                                    ? convertDate(item.updatedAt)
                                    : ''}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            )}
        </Card>
    );
};

export default PendingEditorReplyCard;
