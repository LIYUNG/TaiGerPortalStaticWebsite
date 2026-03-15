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
const Audit = ({ audit }: AuditProps) => {
    const { t } = useTranslation();

    return (
        <Box>
            <Box sx={{ mx: 2 }}>
                <Typography variant="h6">{t('Audit')}</Typography>
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
                            {audit?.map((record) => {
                                type AuditAfter = {
                                    newUser?: {
                                        firstname?: string;
                                        lastname?: string;
                                    };
                                    added?: {
                                        firstname?: string;
                                        lastname?: string;
                                    }[];
                                    removed?: {
                                        firstname?: string;
                                        lastname?: string;
                                    }[];
                                };
                                const after = record?.changes?.after as
                                    | AuditAfter
                                    | undefined;
                                const isNewUser = after?.newUser ? true : false;
                                const newUser = `${after?.newUser?.firstname}${after?.newUser?.lastname}`;
                                const isStatusChanged =
                                    record?.field === 'status';
                                const isAssign = [
                                    'agents',
                                    'editors',
                                    'interview trainer',
                                    'essay writer'
                                ].includes(record?.field ?? '');
                                const addedUsers = after?.added
                                    ?.map(
                                        (user: {
                                            firstname?: string;
                                            lastname?: string;
                                        }) =>
                                            `${user.firstname} ${user.lastname}`
                                    )
                                    .join(', ');
                                const removedUsers = after?.removed
                                    ?.map(
                                        (user: {
                                            firstname?: string;
                                            lastname?: string;
                                        }) =>
                                            `${user.firstname} ${user.lastname}`
                                    )
                                    .join(', ');
                                const docThread =
                                    record?.targetDocumentThreadId as
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
                                const performedBy = record?.performedBy as
                                    | IUser
                                    | undefined;
                                const program_name = docThread?.program_id
                                    ? ` - ${docProgram?.school}
                          ${docProgram?.program_name}
                          ${docProgram?.degree}
                          ${docProgram?.semester}
                          `
                                    : interviewThread?.program_id
                                      ? ` - ${interviewProgram?.school}
                          ${interviewProgram?.program_name}
                          ${interviewProgram?.degree}
                          ${interviewProgram?.semester}
                          `
                                      : '';
                                const fileName =
                                    docThread &&
                                    `${docThread?.file_type}${program_name}
                          `;
                                const interview_name =
                                    interviewThread &&
                                    `Interview${program_name}
                          `;
                                return (
                                    <TableRow key={record._id}>
                                        <TableCell>{`${performedBy?.firstname} ${performedBy?.lastname}`}</TableCell>
                                        <TableCell>{record.action}</TableCell>
                                        <TableCell>{record.field}</TableCell>
                                        <TableCell>
                                            {isNewUser ? newUser : ''}
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
                                        </TableCell>
                                        <TableCell>
                                            {docThread ? (
                                                <Link
                                                    component={LinkDom}
                                                    target="_blank"
                                                    to={DEMO.DOCUMENT_MODIFICATION_LINK(
                                                        docThread._id?.toString()
                                                    )}
                                                >
                                                    {fileName}
                                                </Link>
                                            ) : null}
                                            {interviewThread ? (
                                                <Link
                                                    component={LinkDom}
                                                    target="_blank"
                                                    to={DEMO.INTERVIEW_SINGLE_LINK(
                                                        interviewThread._id?.toString()
                                                    )}
                                                >
                                                    {interview_name}
                                                </Link>
                                            ) : null}
                                        </TableCell>
                                        <TableCell>
                                            {convertDate(
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
        </Box>
    );
};

export default Audit;
