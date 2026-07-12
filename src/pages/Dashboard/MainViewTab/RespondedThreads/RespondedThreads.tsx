import { Link as LinkDom } from 'react-router-dom';
import { Link, TableCell, TableRow, Typography, Tooltip } from '@mui/material';
import { isProgramDecided } from '@taiger-common/core';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useTranslation } from 'react-i18next';

import DEMO from '@store/constant';
import { convertDate } from '@utils/contants';
import { calculateApplicationLockStatus } from '../../../Utils/util_functions';
import type { IStudentResponse } from '@taiger-common/model';

interface PopulatedDocThread {
    _id: string;
    file_type?: string;
}

/**
 * The shared model types describe the embedded `doc_thread_id` as a plain id
 * string, but the API populates it. Read it back defensively rather than
 * trusting either shape.
 */
const getDocThread = (
    doc_thread_id: unknown
): PopulatedDocThread | undefined => {
    if (
        typeof doc_thread_id !== 'object' ||
        doc_thread_id === null ||
        !('_id' in doc_thread_id) ||
        typeof doc_thread_id._id !== 'string'
    ) {
        return undefined;
    }
    const file_type =
        'file_type' in doc_thread_id &&
        typeof doc_thread_id.file_type === 'string'
            ? doc_thread_id.file_type
            : undefined;
    return { _id: doc_thread_id._id, file_type };
};

export interface RespondedThreadsProps {
    student: IStudentResponse;
}

const RespondedThreads = ({ student }: RespondedThreadsProps) => {
    const { t } = useTranslation();
    const renderThreadLink = (
        content: React.ReactNode,
        url: string,
        locked: boolean
    ) => {
        if (locked) {
            return (
                <Tooltip
                    title={t(
                        'Program is locked. Contact your agent to unlock this task.',
                        { ns: 'common' }
                    )}
                >
                    <Typography
                        color="text.disabled"
                        component="span"
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}
                        variant="body2"
                    >
                        <LockOutlinedIcon fontSize="inherit" />
                        {content}
                    </Typography>
                </Tooltip>
            );
        }
        return (
            <Link component={LinkDom} to={url} underline="hover">
                {content}
            </Link>
        );
    };

    let unread_general_generaldocs;
    let unread_applications_docthread;

    if (
        student.applications === undefined ||
        student.applications.length === 0
    ) {
        unread_general_generaldocs = null;
        unread_applications_docthread = null;
    } else {
        unread_general_generaldocs = student.generaldocs_threads?.map(
            (generaldocs_threads, i) => {
                const docThread = getDocThread(
                    generaldocs_threads.doc_thread_id
                );
                return (
                    <TableRow key={i}>
                        {!generaldocs_threads.isFinalVersion &&
                        generaldocs_threads.latest_message_left_by_id ===
                            student._id.toString() ? (
                            <>
                                <TableCell>
                                    <Link
                                        component={LinkDom}
                                        to={DEMO.DOCUMENT_MODIFICATION_LINK(
                                            docThread?._id ?? ''
                                        )}
                                        underline="hover"
                                    >
                                        {docThread?.file_type}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {' '}
                                    {convertDate(
                                        generaldocs_threads.updatedAt ?? ''
                                    )}
                                </TableCell>
                            </>
                        ) : null}
                    </TableRow>
                );
            }
        );

        unread_applications_docthread = student.applications.map(
            (application) =>
                application.doc_modification_thread?.map(
                    (application_doc_thread, idx) => {
                        const docThread = getDocThread(
                            application_doc_thread.doc_thread_id
                        );
                        return (
                            <TableRow key={idx}>
                                {!application_doc_thread.isFinalVersion &&
                                application_doc_thread.latest_message_left_by_id ===
                                    student._id.toString() &&
                                isProgramDecided(application) ? (
                                    <>
                                        <TableCell>
                                            {renderThreadLink(
                                                `${docThread?.file_type} - ${application.programId?.school} - ${application.programId?.program_name}`,
                                                DEMO.DOCUMENT_MODIFICATION_LINK(
                                                    docThread?._id ?? ''
                                                ),
                                                calculateApplicationLockStatus(
                                                    application
                                                ).isLocked
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {convertDate(
                                                application_doc_thread.updatedAt ??
                                                    ''
                                            )}
                                        </TableCell>
                                    </>
                                ) : null}
                            </TableRow>
                        );
                    }
                )
        );
    }

    return (
        <>
            {unread_general_generaldocs}
            {unread_applications_docthread}
        </>
    );
};

export default RespondedThreads;
