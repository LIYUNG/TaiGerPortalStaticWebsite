import { type MouseEvent } from 'react';
import {
    Accordion,
    AccordionDetails,
    Alert,
    Box,
    Button,
    Divider,
    Typography
} from '@mui/material';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import type { Application } from '@/api/types';
import { calculateApplicationLockStatus } from '../../Utils/util_functions';
import ManualFiles from '../ManualFiles';
import ApplicationAccordionSummary from './ApplicationAccordionSummary';
import type { EditorDocsProgressStudent } from '../EditorDocsProgress';
import i18next from 'i18next';

export interface ApplicationAccordionListProps {
    applications: Application[];
    student: EditorDocsProgressStudent;
    onStudentUpdate?: () => void;
    handleAsFinalFile: (
        doc_thread_id: string,
        student_id: string,
        application_id: string,
        isFinal: boolean,
        docName: string
    ) => void;
    handleProgramStatus: (
        student_id: string,
        application_id: string,
        isApplicationSubmitted: boolean
    ) => void;
    initGeneralFileThread: (
        e: MouseEvent<HTMLElement>,
        studentId: string,
        fileCategory: string
    ) => void;
    initProgramSpecificFileThread: (
        e: MouseEvent<HTMLElement>,
        studentId: string,
        applicationId: string,
        fileCategory: string
    ) => void;
    onDeleteFileThread: (
        doc_thread_id: string,
        application: Application | null,
        studentId: string,
        docName: string
    ) => void;
    openRequirements_ModalWindow: (requirements: string) => void;
    onForwardApplication?: (application: Application) => void;
}

const ApplicationAccordionList = ({
    applications,
    student,
    onStudentUpdate,
    handleAsFinalFile,
    handleProgramStatus,
    initGeneralFileThread,
    initProgramSpecificFileThread,
    onDeleteFileThread,
    openRequirements_ModalWindow,
    onForwardApplication
}: ApplicationAccordionListProps) => (
    <>
        {applications.map((application, i) => {
            const lockStatus = calculateApplicationLockStatus(application);
            const isLocked = lockStatus.isLocked;
            return (
                <div key={i}>
                    <Accordion defaultExpanded={false} disableGutters>
                        <ApplicationAccordionSummary
                            application={application}
                            onStudentUpdate={onStudentUpdate}
                            student={student}
                        />
                        <AccordionDetails>
                            {onForwardApplication && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        mb: 1
                                    }}
                                >
                                    <Button
                                        color="primary"
                                        onClick={() =>
                                            onForwardApplication(application)
                                        }
                                        size="small"
                                        startIcon={<ForwardToInboxIcon />}
                                        variant="outlined"
                                    >
                                        {i18next.t('Forward documents', {
                                            ns: 'common'
                                        })}
                                    </Button>
                                </Box>
                            )}
                            {isLocked && (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Warning:</strong>
                                        <br />
                                        {i18next.t(
                                            'Program is locked. Contact an agent to unlock this task.',
                                            { ns: 'common' }
                                        )}
                                    </Typography>
                                </Alert>
                            )}
                            <ManualFiles
                                application={application}
                                filetype="ProgramSpecific"
                                handleAsFinalFile={handleAsFinalFile}
                                handleProgramStatus={handleProgramStatus}
                                initGeneralFileThread={initGeneralFileThread}
                                initProgramSpecificFileThread={
                                    initProgramSpecificFileThread
                                }
                                onDeleteFileThread={onDeleteFileThread}
                                openRequirements_ModalWindow={
                                    openRequirements_ModalWindow
                                }
                                student={student}
                            />
                        </AccordionDetails>
                    </Accordion>
                    <Divider sx={{ my: 2 }} />
                </div>
            );
        })}
    </>
);

export default ApplicationAccordionList;
