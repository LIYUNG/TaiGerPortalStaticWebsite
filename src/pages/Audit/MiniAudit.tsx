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
    Link
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { convertDate, convertDateUXFriendly } from '@utils/contants';
import DEMO from '@store/constant';
import type {
    IAuditWithId,
    IDocumentthreadWithId,
    IInterviewWithId,
    IProgram,
    IUser
} from '@taiger-common/model';

interface MiniAuditProps {
    audit: IAuditWithId[];
}

const MiniAudit = ({ audit }: MiniAuditProps) => {
    const { t } = useTranslation();

    return (
        <Box sx={{ mx: 2 }}>
            <Typography variant="h6">{t('Audit')}</Typography>
            <TableContainer style={{ overflowX: 'auto' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                {t('Field', { ns: 'common' })}
                            </TableCell>
                            <TableCell>
                                {t('Changes', { ns: 'common' })}
                            </TableCell>
                            <TableCell>
                                {t('Resources', { ns: 'common' })}
                            </TableCell>
                            <TableCell>{t('Time', { ns: 'common' })}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {audit?.map((record) => {
                            type AuditAfter = {
                                newUser?: {
                                    firstname?: string;
                                    lastname?: string;
                                };
                                added?: { firstname?: string }[];
                                removed?: { firstname?: string }[];
                            };
                            const after = record?.changes?.after as
                                | AuditAfter
                                | undefined;
                            const isNewUser = after?.newUser ? true : false;
                            const isStatusChanged = record?.field === 'status';
                            const isAssign = ['agents', 'editors'].includes(
                                record?.field ?? ''
                            );
                            const isAssignTrainerWriter = [
                                'interview trainer',
                                'essay writer'
                            ].includes(record?.field ?? '');
                            const addedUsers = after?.added
                                ?.map(
                                    (user: { firstname?: string }) =>
                                        `${user.firstname}`
                                )
                                .join(', ');
                            const removedUsers = after?.removed
                                ?.map(
                                    (user: { firstname?: string }) =>
                                        `${user.firstname}`
                                )
                                .join(', ');
                            const docThread = record?.targetDocumentThreadId as
                                | IDocumentthreadWithId
                                | undefined;
                            const docProgram = docThread?.program_id as
                                | IProgram
                                | undefined;
                            const interviewThread =
                                record?.interviewThreadId as
                                    | IInterviewWithId
                                    | undefined;
                            const interviewProgram =
                                interviewThread?.program_id as
                                    | IProgram
                                    | undefined;
                            const targetUser = record?.targetUserId as
                                | IUser
                                | undefined;
                            const program_name = docThread?.program_id
                                ? `- ${docProgram?.school}${docProgram?.program_name}${docProgram?.degree}${docProgram?.semester}`
                                : interviewThread?.program_id
                                  ? ` - ${interviewProgram?.school}
                          ${interviewProgram?.program_name}
                          ${interviewProgram?.degree}
                          ${interviewProgram?.semester}
                          `
                                  : '';
                            const fileName =
                                docThread &&
                                `${docThread?.file_type}${program_name}`;
                            const interview_name =
                                interviewThread &&
                                `Interview${program_name}
                          `;
                            return (
                                <TableRow key={record._id}>
                                    <TableCell>{record.field}</TableCell>
                                    <TableCell>
                                        {isNewUser ? 'create' : ''}
                                        {isStatusChanged
                                            ? record?.changes?.after
                                                ? 'Closed'
                                                : 'Open'
                                            : ''}
                                        {isAssign
                                            ? `${addedUsers ? `+ ${addedUsers}` : ''} ${
                                                  removedUsers &&
                                                  ` - ${removedUsers}`
                                              }`
                                            : ''}
                                        {isAssignTrainerWriter
                                            ? `${addedUsers ? `+ ${addedUsers}` : ''} ${
                                                  removedUsers &&
                                                  ` - ${removedUsers}`
                                              }`
                                            : ''}
                                    </TableCell>
                                    <TableCell>
                                        {docThread ? (
                                            <Link
                                                component={LinkDom}
                                                target="_blank"
                                                title={program_name}
                                                to={DEMO.DOCUMENT_MODIFICATION_LINK(
                                                    docThread._id?.toString()
                                                )}
                                            >
                                                {fileName}{' '}
                                                {targetUser?.firstname}
                                                {targetUser?.lastname}
                                            </Link>
                                        ) : null}
                                        {interviewThread ? (
                                            <Link
                                                component={LinkDom}
                                                target="_blank"
                                                title={program_name}
                                                to={DEMO.INTERVIEW_SINGLE_LINK(
                                                    interviewThread._id?.toString()
                                                )}
                                            >
                                                {interview_name}{' '}
                                                {targetUser?.firstname}
                                                {targetUser?.lastname}
                                            </Link>
                                        ) : null}
                                        {isNewUser || isAssign
                                            ? `${targetUser?.firstname} ${targetUser?.lastname}`
                                            : ''}
                                    </TableCell>
                                    <TableCell
                                        title={convertDate(
                                            record.createdAt as Date
                                        )}
                                    >
                                        {convertDateUXFriendly(
                                            record.createdAt as Date
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default MiniAudit;
