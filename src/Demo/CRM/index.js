import React, { useState } from 'react';
import { Navigate, Link as LinkDom } from 'react-router-dom';
import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Card,
    CardContent,
    CardActions,
    Grid,
    Collapse,
    IconButton
} from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
// import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';

// import firefilies-transcript.json file as dummy data
import firefiliesTranscript from './fireflies-transcript.json';

const CRMDashboard = () => {
    const { user } = useAuth();
    const [expandedIdx, setExpandedIdx] = useState(null);

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    TabTitle(i18next.t('CRM Overview', { ns: 'common' }));

    return (
        <Box data-testid="student_overview">
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Typography color="text.primary">
                    {i18next.t('All Students', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>

            <Box sx={{ mt: 2 }}>
                <Typography gutterBottom variant="h4">
                    {i18next.t('CRM Overview', { ns: 'common' })}
                </Typography>
                <Typography sx={{ mb: 2 }} variant="body1">
                    {i18next.t('Transcript Summaries', { ns: 'common' })}
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 4 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Duration (min)</TableCell>
                                <TableCell>Transcript</TableCell>
                                <TableCell>Audio</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {firefiliesTranscript.data.transcripts
                                .filter((t) => t && t.title)
                                .map((t, idx) => (
                                    <TableRow key={t.id || idx}>
                                        <TableCell>{t.title}</TableCell>
                                        <TableCell>
                                            {t.dateString
                                                ? new Date(
                                                      t.dateString
                                                  ).toLocaleString()
                                                : ''}
                                        </TableCell>
                                        <TableCell>
                                            {t.duration
                                                ? (t.duration / 60).toFixed(1)
                                                : ''}
                                        </TableCell>
                                        <TableCell>
                                            {t.transcript_url ? (
                                                <Button
                                                    href={t.transcript_url}
                                                    rel="noopener"
                                                    size="small"
                                                    target="_blank"
                                                    variant="outlined"
                                                >
                                                    View
                                                </Button>
                                            ) : (
                                                ''
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {t.audio_url ? (
                                                <Button
                                                    href={t.audio_url}
                                                    rel="noopener"
                                                    size="small"
                                                    target="_blank"
                                                    variant="outlined"
                                                >
                                                    Audio
                                                </Button>
                                            ) : (
                                                ''
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Typography sx={{ mb: 2 }} variant="h6">
                    {i18next.t('Transcript Details', { ns: 'common' })}
                </Typography>
                <Grid container spacing={2}>
                    {firefiliesTranscript.data.transcripts
                        .filter((t) => t && t.title)
                        .map((t, idx) => {
                            // Extract summary fields with fallbacks
                            let shortSummary = '';
                            let detailedSummary = '';
                            if (t.summary) {
                                shortSummary =
                                    t.summary.shorthand_bullet ||
                                    t.summary.short_summary ||
                                    t.summary.bullet_gist ||
                                    t.summary.overview ||
                                    '';
                                detailedSummary =
                                    t.summary.overview ||
                                    t.summary.bullet_gist ||
                                    (Array.isArray(
                                        t.summary.transcript_chapters
                                    ) &&
                                    t.summary.transcript_chapters.length > 0
                                        ? t.summary.transcript_chapters
                                              .map((c) => c.summary || '')
                                              .join('\n')
                                        : '');
                            }
                            return (
                                <Grid
                                    item
                                    key={t.id || idx}
                                    lg={4}
                                    md={6}
                                    xs={12}
                                >
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography
                                                gutterBottom
                                                variant="h6"
                                            >
                                                {t.title}
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                gutterBottom
                                                variant="body2"
                                            >
                                                Date:{' '}
                                                {t.dateString
                                                    ? new Date(
                                                          t.dateString
                                                      ).toLocaleString()
                                                    : 'N/A'}
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                gutterBottom
                                                variant="body2"
                                            >
                                                Duration:{' '}
                                                {t.duration
                                                    ? (t.duration / 60).toFixed(
                                                          1
                                                      ) + ' min'
                                                    : 'N/A'}
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                gutterBottom
                                                variant="body2"
                                            >
                                                Participants:{' '}
                                                {t.participants &&
                                                t.participants.length > 0
                                                    ? t.participants.join(', ')
                                                    : 'N/A'}
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                gutterBottom
                                                variant="body2"
                                            >
                                                Attendees:{' '}
                                                {Array.isArray(
                                                    t.meeting_attendees
                                                ) &&
                                                t.meeting_attendees.length > 0
                                                    ? t.meeting_attendees
                                                          .map((a) =>
                                                              typeof a ===
                                                              'string'
                                                                  ? a
                                                                  : a.display_name ||
                                                                    a.email ||
                                                                    JSON.stringify(
                                                                        a
                                                                    )
                                                          )
                                                          .join(', ')
                                                    : 'N/A'}
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                gutterBottom
                                                variant="body2"
                                            >
                                                Calendar ID:{' '}
                                                {t.calendar_id || 'N/A'}
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                gutterBottom
                                                variant="body2"
                                            >
                                                Meeting Link:{' '}
                                                {t.meeting_link ? (
                                                    <a
                                                        href={t.meeting_link}
                                                        rel="noopener noreferrer"
                                                        target="_blank"
                                                    >
                                                        {t.meeting_link}
                                                    </a>
                                                ) : (
                                                    'N/A'
                                                )}
                                            </Typography>
                                            {shortSummary && (
                                                <Typography
                                                    color="primary"
                                                    sx={{
                                                        mt: 1,
                                                        whiteSpace: 'pre-line'
                                                    }}
                                                    variant="body2"
                                                >
                                                    {shortSummary}
                                                </Typography>
                                            )}
                                            {detailedSummary && (
                                                <>
                                                    <IconButton
                                                        aria-expanded={
                                                            expandedIdx === idx
                                                        }
                                                        aria-label="show more"
                                                        onClick={() =>
                                                            setExpandedIdx(
                                                                expandedIdx ===
                                                                    idx
                                                                    ? null
                                                                    : idx
                                                            )
                                                        }
                                                        size="small"
                                                        sx={{ p: 0, ml: 1 }}
                                                    >
                                                        <ExpandMoreIcon
                                                            style={{
                                                                transform:
                                                                    expandedIdx ===
                                                                    idx
                                                                        ? 'rotate(180deg)'
                                                                        : 'rotate(0deg)',
                                                                transition:
                                                                    '0.2s'
                                                            }}
                                                        />
                                                    </IconButton>
                                                    <Collapse
                                                        in={expandedIdx === idx}
                                                        timeout="auto"
                                                        unmountOnExit
                                                    >
                                                        <Typography
                                                            color="text.secondary"
                                                            sx={{ mt: 1 }}
                                                            variant="body2"
                                                        >
                                                            {detailedSummary}
                                                        </Typography>
                                                    </Collapse>
                                                </>
                                            )}
                                        </CardContent>
                                        <CardActions>
                                            {t.transcript_url && (
                                                <Button
                                                    href={t.transcript_url}
                                                    rel="noopener"
                                                    size="small"
                                                    target="_blank"
                                                    variant="outlined"
                                                >
                                                    Transcript
                                                </Button>
                                            )}
                                            {t.audio_url && (
                                                <Button
                                                    href={t.audio_url}
                                                    rel="noopener"
                                                    size="small"
                                                    target="_blank"
                                                    variant="outlined"
                                                >
                                                    Audio
                                                </Button>
                                            )}
                                        </CardActions>
                                    </Card>
                                </Grid>
                            );
                        })}
                </Grid>
            </Box>
        </Box>
    );
};

export default CRMDashboard;
