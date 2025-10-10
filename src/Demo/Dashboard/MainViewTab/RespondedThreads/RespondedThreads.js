import React from 'react';
import { Link as LinkDom } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    Chip,
    Grid,
    Stack,
    Typography
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { isProgramDecided } from '@taiger-common/core';

import DEMO from '../../../../store/constant';
import { convertDate } from '../../../../utils/contants';
import { useTranslation } from 'react-i18next';

const RespondedThreads = (props) => {
    const { t } = useTranslation();
    const threads = [];
    let threadCounter = 0;

    if (
        props.student.applications === undefined ||
        props.student.applications.length === 0
    ) {
        return <Stack spacing={2}>{threads}</Stack>;
    }

    // General documents threads
    props.student.generaldocs_threads.forEach((generaldocs_threads, i) => {
        if (
            !generaldocs_threads.isFinalVersion &&
            generaldocs_threads.latest_message_left_by_id ===
                props.student._id.toString()
        ) {
            threadCounter++;
            threads.push(
                <Card
                    key={`general_${i}`}
                    sx={{
                        p: 2,
                        transition: 'all 0.3s',
                        '&:hover': {
                            boxShadow: 2,
                            transform: 'translateY(-2px)'
                        }
                    }}
                    variant="outlined"
                >
                    <Grid alignItems="center" container spacing={2}>
                        <Grid item md={8} xs={12}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1,
                                    mb: 1
                                }}
                            >
                                <Chip
                                    color="default"
                                    label={threadCounter}
                                    size="small"
                                    sx={{ fontWeight: 'bold', minWidth: 32 }}
                                />
                                <Typography
                                    sx={{ fontWeight: 'bold', flex: 1 }}
                                    variant="subtitle1"
                                >
                                    {
                                        generaldocs_threads.doc_thread_id
                                            .file_type
                                    }
                                </Typography>
                            </Box>
                            <Typography
                                color="text.secondary"
                                sx={{ ml: 5, display: 'block' }}
                                variant="caption"
                            >
                                {t('Last update', { ns: 'common' })}:{' '}
                                {convertDate(generaldocs_threads.updatedAt)}
                            </Typography>
                        </Grid>
                        <Grid
                            item
                            md={4}
                            sx={{ textAlign: { xs: 'left', md: 'right' } }}
                            xs={12}
                        >
                            <Button
                                component={LinkDom}
                                endIcon={<LaunchIcon />}
                                size="small"
                                to={DEMO.DOCUMENT_MODIFICATION_LINK(
                                    generaldocs_threads.doc_thread_id._id
                                )}
                                variant="outlined"
                            >
                                {t('View', { ns: 'common' })}
                            </Button>
                        </Grid>
                    </Grid>
                </Card>
            );
        }
    });

    // Application specific document threads
    props.student.applications.forEach((application) => {
        application.doc_modification_thread.forEach(
            (application_doc_thread, idx) => {
                if (
                    !application_doc_thread.isFinalVersion &&
                    application_doc_thread.latest_message_left_by_id ===
                        props.student._id.toString() &&
                    isProgramDecided(application)
                ) {
                    threadCounter++;
                    threads.push(
                        <Card
                            key={`app_${application.programId._id}_${idx}`}
                            sx={{
                                p: 2,
                                transition: 'all 0.3s',
                                '&:hover': {
                                    boxShadow: 2,
                                    transform: 'translateY(-2px)'
                                }
                            }}
                            variant="outlined"
                        >
                            <Grid alignItems="center" container spacing={2}>
                                <Grid item md={8} xs={12}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 1,
                                            mb: 1
                                        }}
                                    >
                                        <Chip
                                            color="default"
                                            label={threadCounter}
                                            size="small"
                                            sx={{
                                                fontWeight: 'bold',
                                                minWidth: 32
                                            }}
                                        />
                                        <Typography
                                            sx={{ fontWeight: 'bold', flex: 1 }}
                                            variant="subtitle1"
                                        >
                                            {
                                                application_doc_thread
                                                    .doc_thread_id.file_type
                                            }
                                        </Typography>
                                    </Box>
                                    <Typography
                                        color="text.secondary"
                                        sx={{ ml: 5 }}
                                        variant="body2"
                                    >
                                        {application.programId.school} -{' '}
                                        {application.programId.program_name}
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            ml: 5,
                                            display: 'block',
                                            mt: 0.5
                                        }}
                                        variant="caption"
                                    >
                                        {t('Last update', { ns: 'common' })}:{' '}
                                        {convertDate(
                                            application_doc_thread.updatedAt
                                        )}
                                    </Typography>
                                </Grid>
                                <Grid
                                    item
                                    md={4}
                                    sx={{
                                        textAlign: { xs: 'left', md: 'right' }
                                    }}
                                    xs={12}
                                >
                                    <Button
                                        component={LinkDom}
                                        endIcon={<LaunchIcon />}
                                        size="small"
                                        to={DEMO.DOCUMENT_MODIFICATION_LINK(
                                            application_doc_thread.doc_thread_id
                                                ._id
                                        )}
                                        variant="outlined"
                                    >
                                        {t('View', { ns: 'common' })}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Card>
                    );
                }
            }
        );
    });

    return <Stack spacing={2}>{threads}</Stack>;
};

export default RespondedThreads;
