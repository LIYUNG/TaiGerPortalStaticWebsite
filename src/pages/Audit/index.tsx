import { type ReactNode } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    Box,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Link,
    Card,
    Stack,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { convertDate } from '@utils/contants';
import DEMO from '@store/constant';
import type {
    IAuditWithId,
    IDocumentthreadWithId,
    IInterviewWithId,
    IProgram,
    IUser
} from '@taiger-common/model';

export interface AuditProps {
    audit: IAuditWithId[];
}

interface AuditRow {
    id: string;
    actor: string;
    action: string;
    field: string;
    changes: string;
    resource: ReactNode;
    time: string;
}

type AuditAfter = {
    newUser?: { firstname?: string; lastname?: string };
    added?: { firstname?: string; lastname?: string }[];
    removed?: { firstname?: string; lastname?: string }[];
};

const Audit = ({ audit }: AuditProps) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const buildRow = (record: IAuditWithId): AuditRow => {
        const after = record?.changes?.after as AuditAfter | undefined;
        const isNewUser = after?.newUser ? true : false;
        const newUser = `${after?.newUser?.firstname ?? ''}${after?.newUser?.lastname ?? ''}`;
        const isStatusChanged = record?.field === 'status';
        const isAssign = [
            'agents',
            'editors',
            'interview trainer',
            'essay writer'
        ].includes(record?.field ?? '');
        const addedUsers = after?.added
            ?.map((user) => `${user.firstname} ${user.lastname}`)
            .join(', ');
        const removedUsers = after?.removed
            ?.map((user) => `${user.firstname} ${user.lastname}`)
            .join(', ');

        const changeParts: string[] = [];
        if (isNewUser) changeParts.push(newUser);
        if (isStatusChanged) {
            changeParts.push(record?.changes?.after ? 'Closed' : 'Open');
        }
        if (isAssign) {
            if (addedUsers) changeParts.push(`+ ${addedUsers}`);
            if (removedUsers) changeParts.push(`- ${removedUsers}`);
        }

        const docThread = record?.targetDocumentThreadId as
            | IDocumentthreadWithId
            | undefined;
        const docProgram = docThread?.program_id as IProgram | undefined;
        const interviewThread = record?.interviewThreadId as
            | IInterviewWithId
            | undefined;
        const interviewProgram = interviewThread?.program_id as
            | IProgram
            | undefined;
        const performedBy = record?.performedBy as IUser | undefined;
        const program_name = docThread?.program_id
            ? ` - ${docProgram?.school} ${docProgram?.program_name} ${docProgram?.degree} ${docProgram?.semester}`
            : interviewThread?.program_id
              ? ` - ${interviewProgram?.school} ${interviewProgram?.program_name} ${interviewProgram?.degree} ${interviewProgram?.semester}`
              : '';
        const fileName = docThread && `${docThread?.file_type}${program_name}`;
        const interview_name = interviewThread && `Interview${program_name}`;

        let resource: ReactNode = null;
        if (docThread) {
            resource = (
                <Link
                    component={LinkDom}
                    target="_blank"
                    to={DEMO.DOCUMENT_MODIFICATION_LINK(
                        docThread._id?.toString()
                    )}
                >
                    {fileName}
                </Link>
            );
        } else if (interviewThread) {
            resource = (
                <Link
                    component={LinkDom}
                    target="_blank"
                    to={DEMO.INTERVIEW_SINGLE_LINK(
                        interviewThread._id?.toString()
                    )}
                >
                    {interview_name}
                </Link>
            );
        }

        return {
            id: String(record._id),
            actor: `${performedBy?.firstname} ${performedBy?.lastname}`,
            action: record.action ?? '',
            field: record.field ?? '',
            changes: changeParts.join(' '),
            resource,
            time: convertDate(record.createdAt as Date)
        };
    };

    const rows = (audit ?? []).map(buildRow);

    return (
        <Box sx={{ mx: 2 }}>
            <Typography sx={{ mb: 1 }} variant="h6">
                {t('Audit')}
            </Typography>
            {isMobile ? (
                <Stack spacing={1}>
                    {rows.map((row) => (
                        <Card
                            key={row.id}
                            sx={{
                                p: 1.5,
                                border: 1,
                                borderColor: 'divider',
                                boxShadow: 'none'
                            }}
                        >
                            <AuditCardLine
                                label={t('Actor', { ns: 'common' })}
                                value={row.actor}
                            />
                            <AuditCardLine
                                label={t('Action', { ns: 'common' })}
                                value={row.action}
                            />
                            <AuditCardLine
                                label={t('Field', { ns: 'common' })}
                                value={row.field}
                            />
                            {row.changes ? (
                                <AuditCardLine
                                    label={t('Changes', { ns: 'common' })}
                                    value={row.changes}
                                />
                            ) : null}
                            {row.resource ? (
                                <AuditCardLine
                                    label={t('Resources', { ns: 'common' })}
                                    value={row.resource}
                                />
                            ) : null}
                            <AuditCardLine
                                label={t('Time', { ns: 'common' })}
                                value={row.time}
                            />
                        </Card>
                    ))}
                </Stack>
            ) : (
                <TableContainer style={{ overflowX: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    {t('Actor', { ns: 'common' })}
                                </TableCell>
                                <TableCell>
                                    {t('Action', { ns: 'common' })}
                                </TableCell>
                                <TableCell>
                                    {t('Field', { ns: 'common' })}
                                </TableCell>
                                <TableCell>
                                    {t('Changes', { ns: 'common' })}
                                </TableCell>
                                <TableCell>
                                    {t('Resources', { ns: 'common' })}
                                </TableCell>
                                <TableCell>
                                    {t('Time', { ns: 'common' })}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.actor}</TableCell>
                                    <TableCell>{row.action}</TableCell>
                                    <TableCell>{row.field}</TableCell>
                                    <TableCell>{row.changes}</TableCell>
                                    <TableCell>{row.resource}</TableCell>
                                    <TableCell>{row.time}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

interface AuditCardLineProps {
    label: string;
    value: ReactNode;
}

const AuditCardLine = ({ label, value }: AuditCardLineProps) => (
    <Stack direction="row" spacing={1} sx={{ py: 0.25 }}>
        <Typography
            color="text.secondary"
            sx={{ minWidth: 80, flexShrink: 0 }}
            variant="caption"
        >
            {label}
        </Typography>
        <Typography
            component="div"
            sx={{ flex: 1, wordBreak: 'break-word' }}
            variant="body2"
        >
            {value}
        </Typography>
    </Stack>
);

export default Audit;
