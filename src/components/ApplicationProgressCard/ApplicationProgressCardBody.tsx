import { Link as LinkDom } from 'react-router-dom';
import { IconButton, Link, List, ListItem, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { isProgramSubmitted } from '@taiger-common/core';

import DEMO from '@store/constant';
import { isEnglishOK } from '@pages/Utils/util_functions';
import {
    FILE_MISSING_SYMBOL,
    FILE_OK_SYMBOL,
    convertDateUXFriendly
} from '@utils/contants';
import { red } from '@mui/material/colors';
import { Application, IStudentResponse } from '@api/types';

interface ApplicationProgressCardBodyProps {
    application: Application;
    student: IStudentResponse;
}

const DocumentOkIcon = () => FILE_OK_SYMBOL;
const DocumentMissingIcon = () => FILE_MISSING_SYMBOL;

export default function ApplicationProgressCardBody(
    props: ApplicationProgressCardBodyProps
) {
    const application = props.application;
    const student = props.student;

    return (
        <List>
            {student?.generaldocs_threads?.map((thread) => (
                <ListItem key={thread.doc_thread_id._id.toString()}>
                    <Typography>
                        <Link
                            color="inherit"
                            component={LinkDom}
                            to={DEMO.DOCUMENT_MODIFICATION_LINK(
                                thread.doc_thread_id._id.toString()
                            )}
                            underline="hover"
                        >
                            {thread.isFinalVersion ? (
                                <IconButton>
                                    <DocumentOkIcon />
                                </IconButton>
                            ) : (
                                <IconButton>
                                    <DocumentMissingIcon />
                                </IconButton>
                            )}{' '}
                            {thread.doc_thread_id?.file_type}
                        </Link>
                        {' - '}{' '}
                        {convertDateUXFriendly(thread.doc_thread_id?.updatedAt)}
                    </Typography>
                </ListItem>
            ))}
            {application?.programId?.ielts || application?.programId?.toefl ? (
                student?.academic_background?.language?.english_isPassed ===
                'O' ? (
                    isEnglishOK(application?.programId, props.student) ? (
                        <ListItem>
                            <Typography>
                                <Link
                                    color="inherit"
                                    component={LinkDom}
                                    to={`${DEMO.SURVEY_LINK}`}
                                    underline="hover"
                                >
                                    <IconButton>
                                        <DocumentOkIcon />
                                    </IconButton>{' '}
                                    English{' '}
                                </Link>
                                {' - '}
                                {
                                    student.academic_background?.language
                                        ?.english_certificate
                                }
                                {' - '}
                                {
                                    student.academic_background?.language
                                        ?.english_score
                                }
                            </Typography>
                        </ListItem>
                    ) : (
                        <ListItem title="English Requirements not met with your input in Profile">
                            <Typography>
                                <Link
                                    color="inherit"
                                    component={LinkDom}
                                    to={`${DEMO.SURVEY_LINK}`}
                                    underline="hover"
                                >
                                    <IconButton>
                                        <WarningIcon
                                            fontSize="small"
                                            sx={{ color: red[700] }}
                                        />
                                    </IconButton>{' '}
                                    English
                                </Link>
                                {' - '}
                                {
                                    student.academic_background?.language
                                        ?.english_certificate
                                }
                                {' - '}
                                {
                                    student.academic_background?.language
                                        ?.english_score
                                }
                            </Typography>
                        </ListItem>
                    )
                ) : (
                    <ListItem>
                        <Typography>
                            <Link
                                color="inherit"
                                component={LinkDom}
                                to={`${DEMO.SURVEY_LINK}`}
                                underline="hover"
                            >
                                <IconButton>
                                    <DocumentMissingIcon />
                                </IconButton>{' '}
                                English
                            </Link>
                            {' - '}{' '}
                            {
                                student.academic_background?.language
                                    ?.english_test_date
                            }
                        </Typography>
                    </ListItem>
                )
            ) : null}
            {application?.programId?.testdaf ? (
                application?.programId?.testdaf === '-' ? null : student
                      ?.academic_background?.language?.german_isPassed ===
                  'O' ? (
                    <ListItem>
                        <Typography>
                            <Link
                                color="inherit"
                                component={LinkDom}
                                to={`${DEMO.SURVEY_LINK}`}
                                underline="hover"
                            >
                                <IconButton>
                                    <DocumentOkIcon />
                                </IconButton>{' '}
                                German
                            </Link>
                        </Typography>
                    </ListItem>
                ) : (
                    <ListItem>
                        <Typography>
                            <Link
                                color="inherit"
                                component={LinkDom}
                                to={`${DEMO.SURVEY_LINK}`}
                                underline="hover"
                            >
                                <IconButton>
                                    <DocumentMissingIcon />
                                </IconButton>{' '}
                                German
                            </Link>
                        </Typography>
                    </ListItem>
                )
            ) : null}
            {application?.programId?.gre ? (
                application?.programId?.gre === '-' ? null : student
                      ?.academic_background?.language?.gre_isPassed === 'O' ? (
                    <ListItem>
                        <Typography>
                            <Link
                                color="inherit"
                                component={LinkDom}
                                to={`${DEMO.SURVEY_LINK}`}
                                underline="hover"
                            >
                                <IconButton>
                                    <DocumentOkIcon />
                                </IconButton>
                                GRE
                            </Link>
                        </Typography>
                    </ListItem>
                ) : (
                    <ListItem>
                        <Typography>
                            <Link
                                color="inherit"
                                component={LinkDom}
                                to={`${DEMO.SURVEY_LINK}`}
                                underline="hover"
                            >
                                <IconButton>
                                    <DocumentMissingIcon />
                                </IconButton>{' '}
                                GRE
                            </Link>
                        </Typography>
                    </ListItem>
                )
            ) : null}
            {application?.programId?.gmat ? (
                application?.programId?.gmat === '-' ? null : student
                      ?.academic_background?.language?.gmat_isPassed === 'O' ? (
                    <ListItem>
                        <Typography>
                            <Link
                                color="inherit"
                                component={LinkDom}
                                to={`${DEMO.SURVEY_LINK}`}
                                underline="hover"
                            >
                                <IconButton>
                                    <DocumentOkIcon />
                                </IconButton>{' '}
                                GMAT
                            </Link>
                        </Typography>
                    </ListItem>
                ) : (
                    <ListItem>
                        <Typography>
                            <Link
                                color="inherit"
                                component={LinkDom}
                                to={`${DEMO.SURVEY_LINK}`}
                                underline="hover"
                            >
                                <IconButton>
                                    <DocumentMissingIcon />
                                </IconButton>{' '}
                                GMAT
                            </Link>
                        </Typography>
                    </ListItem>
                )
            ) : null}
            {application?.programId?.application_portal_a ||
            application?.programId?.application_portal_b ? (
                <ListItem>
                    <Typography>
                        <Link
                            color="inherit"
                            component={LinkDom}
                            to={DEMO.PORTALS_MANAGEMENT_STUDENTID_LINK(
                                student._id?.toString() ?? ''
                            )}
                            underline="hover"
                        >
                            {(application?.programId?.application_portal_a &&
                                !application.credential_a_filled) ||
                            (application?.programId?.application_portal_b &&
                                !application.credential_b_filled) ? (
                                <IconButton>
                                    <DocumentMissingIcon />
                                </IconButton>
                            ) : (
                                <IconButton>
                                    <DocumentOkIcon />
                                </IconButton>
                            )}{' '}
                            Register University Portal
                        </Link>
                    </Typography>
                </ListItem>
            ) : null}
            {application?.doc_modification_thread?.map((thread) => (
                <ListItem key={thread.doc_thread_id?._id?.toString()}>
                    <Typography>
                        <Link
                            color="inherit"
                            component={LinkDom}
                            to={DEMO.DOCUMENT_MODIFICATION_LINK(
                                thread.doc_thread_id?._id?.toString() ?? ''
                            )}
                            underline="hover"
                        >
                            {thread.isFinalVersion ? (
                                <IconButton>
                                    <DocumentOkIcon />
                                </IconButton>
                            ) : (
                                <IconButton>
                                    <DocumentMissingIcon />
                                </IconButton>
                            )}{' '}
                            {thread.doc_thread_id?.file_type?.replace(
                                /_/g,
                                ' '
                            )}
                        </Link>
                        {' - '}
                        {convertDateUXFriendly(thread.doc_thread_id?.updatedAt)}
                    </Typography>
                </ListItem>
            ))}

            {(
                application?.programId?.uni_assist as string[] | undefined
            )?.includes('VPD') ? (
                <ListItem>
                    <Typography>
                        <Link
                            color="inherit"
                            component={LinkDom}
                            to={`${DEMO.UNI_ASSIST_LINK}`}
                            underline="hover"
                        >
                            {application?.uni_assist?.status ===
                            'notstarted' ? (
                                <IconButton>
                                    <DocumentMissingIcon />
                                </IconButton>
                            ) : (
                                <IconButton>
                                    <DocumentOkIcon />
                                </IconButton>
                            )}{' '}
                            Uni-Assist VPD
                            {' - '}{' '}
                            {convertDateUXFriendly(
                                application?.uni_assist?.updatedAt
                            )}
                        </Link>
                    </Typography>
                </ListItem>
            ) : null}

            <ListItem>
                <Typography>
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={DEMO.STUDENT_APPLICATIONS_ID_LINK(
                            student._id?.toString() ?? ''
                        )}
                        underline="hover"
                    >
                        {isProgramSubmitted(application) ? (
                            <IconButton>
                                <DocumentOkIcon />
                            </IconButton>
                        ) : (
                            <IconButton>
                                <DocumentMissingIcon />
                            </IconButton>
                        )}
                        Submit
                    </Link>
                </Typography>
            </ListItem>
        </List>
    );
}
