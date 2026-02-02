import React from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    Link,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Alert,
    Card,
    Typography,
    TableContainer
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import {
    isUniAssistVPDNeeded,
    application_deadline_V2_calculator,
    is_uni_assist_paid_and_docs_uploaded
} from '../../../Utils/util_functions';
import DEMO from '../../../../store/constant';

const VPDToSubmitTasks = ({ application }) => {
    const { t } = useTranslation();
    return (
        <>
            {/* check uni-assist */}
            {isUniAssistVPDNeeded(application) && (
                <TableRow>
                    <TableCell>
                        <Link
                            component={LinkDom}
                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                application.studentId._id.toString(),
                                DEMO.UNIASSIST_HASH
                            )}`}
                        >
                            {application.studentId.firstname}{' '}
                            {application.studentId.lastname}
                        </Link>
                    </TableCell>
                    {is_uni_assist_paid_and_docs_uploaded(application) ? (
                        <TableCell className="text-warning">
                            {t('Paid', { ns: 'common' })},{' '}
                            {t('Waiting VPD result', {
                                ns: 'common'
                            })}
                        </TableCell>
                    ) : (
                        <TableCell>
                            <Typography color="text.secondary">
                                {t('Not paid', { ns: 'common' })}
                            </Typography>
                        </TableCell>
                    )}
                    <TableCell>
                        <b>{application_deadline_V2_calculator(application)}</b>
                    </TableCell>
                    <TableCell>
                        {application.programId.school}{' '}
                        {application.programId.program_name}
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

const VPDToSubmitTasksCard = ({ applications }) => {
    const { t } = useTranslation();
    const vpd_to_submit_tasks = applications.map((application, i) => (
        <VPDToSubmitTasks application={application} key={i} />
    ));
    return (
        <Card sx={{ mb: 2 }}>
            <Alert severity="error">
                <Typography>VPD missing:</Typography>
            </Alert>
            <TableContainer style={{ maxHeight: '300px' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                {t('Student', { ns: 'common' })}
                            </TableCell>
                            <TableCell>
                                {t('Status', { ns: 'common' })}
                            </TableCell>
                            <TableCell>
                                {t('Deadline', { ns: 'common' })}
                            </TableCell>
                            <TableCell>
                                {t('Program', { ns: 'common' })}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{vpd_to_submit_tasks}</TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
};

export default VPDToSubmitTasksCard;
