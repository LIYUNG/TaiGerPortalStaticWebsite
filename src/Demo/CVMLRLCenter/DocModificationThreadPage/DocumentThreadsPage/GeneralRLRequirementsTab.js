import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Box,
    IconButton,
    Link,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link as LinkDom } from 'react-router-dom';

import { getStudentAndDocLinksQuery } from '../../../../api/query';
import { application_deadline_V2_calculator } from '../../../Utils/checking-functions';
import DEMO from '../../../../store/constant';

export const GeneralRLRequirementsTab = ({ studentId }) => {
    const { t } = useTranslation('cvmlrl');
    const { data: response, isLoading } = useQuery(
        getStudentAndDocLinksQuery({ studentId })
    );

    if (!studentId)
        return (
            <Alert severity="error" sx={statusAlertSx}>
                {t('generalRLTable.missingStudentId')}
            </Alert>
        );
    const student = response?.data?.data || null;
    const apps = student?.applications || [];

    // decided field in sample data: "-" = pending/undecided, "O" = decided, "X" = excluded
    const relevantApplications = useMemo(() => {
        return (apps || []).filter((app) => {
            const program = app.programId || null;
            const generalRLNotRequired =
                !app ||
                !program ||
                !program.rl_required ||
                program.rl_required === '0' ||
                program.is_rl_specific;
            return !generalRLNotRequired && app.decided !== 'X';
        });
    }, [apps]);

    const rlRows = useMemo(() => {
        const rowsWithMeta = relevantApplications.map((app) => {
            const program = app.programId || {};
            const school = program.school || '';
            const programName = program.program_name || '';
            const rlRequiredRaw = program.rl_required; // "0","1","2"
            const rlRequired = normalizeCount(rlRequiredRaw);
            const rlText = (program.rl_requirements || '').trim();
            const decided = (app.decided || '-').toUpperCase();
            const deadlineDisplay = application_deadline_V2_calculator(app);
            const programLinkTarget = program?._id
                ? DEMO.SINGLE_PROGRAM_LINK(
                      typeof program._id === 'string'
                          ? program._id
                          : program._id?.toString?.() || ''
                  )
                : null;

            return {
                key: app._id,
                school,
                program_name: programName,
                program_link: programLinkTarget,
                count_required: rlRequired || '',
                requirement_text: rlText || 'No specific instructions provided',
                decided,
                deadline: deadlineDisplay,
                deadlineSortValue: getDeadlineSortValue(deadlineDisplay)
            };
        });

        rowsWithMeta.sort((a, b) => {
            const decidedCompare = compareDecidedStatus(a.decided, b.decided);
            if (decidedCompare !== 0) return decidedCompare;

            const deadlineCompare = a.deadlineSortValue - b.deadlineSortValue;
            if (deadlineCompare !== 0) return deadlineCompare;

            return a.program_name.localeCompare(b.program_name);
        });

        rowsWithMeta.forEach((row) => {
            delete row.deadlineSortValue;
        });

        return rowsWithMeta;
    }, [relevantApplications]);

    const legendDescription = t('generalRLTable.legendDescription', {
        defaultValue: 'Green rows = decided, Grey rows = pending/undecided.'
    });

    if (isLoading)
        return (
            <Alert severity="info" sx={statusAlertSx}>
                {t('generalRLTable.loading')}
            </Alert>
        );

    if (!relevantApplications.length) {
        console.log(relevantApplications);
        return (
            <Alert severity="info" sx={statusAlertSx}>
                {t('generalRLTable.noApplications')}
            </Alert>
        );
    }

    return (
        <Paper sx={containerSx}>
            <Box sx={headerSx}>
                <Typography sx={titleSx} variant="h6">
                    {t('generalRLTable.title')}
                </Typography>
                <Typography sx={subtitleSx} variant="body2">
                    {t('generalRLTable.subtitle')}
                </Typography>
            </Box>
            <TableContainer sx={tableContainerSx}>
                <Table sx={tableSx}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...thSx, ...columnSx.deadline }}>
                                {t('generalRLTable.columns.deadline')}
                            </TableCell>
                            <TableCell sx={{ ...thSx, ...columnSx.count }}>
                                {t('generalRLTable.columns.count')}
                            </TableCell>
                            <TableCell sx={{ ...thSx, ...columnSx.program }}>
                                {t('generalRLTable.columns.programWithSchool')}
                            </TableCell>
                            <TableCell sx={{ ...thSx, ...columnSx.notes }}>
                                {t('generalRLTable.columns.notes')}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rlRows.map((r) => (
                            <TableRow
                                key={r.key}
                                sx={
                                    r.decided === 'O'
                                        ? rowStatusSx.decided
                                        : rowStatusSx.undecided
                                }
                            >
                                <TableCell
                                    sx={{ ...tdSx, ...columnSx.deadline }}
                                >
                                    {r.deadline}
                                </TableCell>
                                <TableCell sx={{ ...tdSx, ...columnSx.count }}>
                                    {r.count_required}
                                </TableCell>
                                <TableCell
                                    sx={{ ...tdSx, ...columnSx.program }}
                                >
                                    <Stack spacing={0.5}>
                                        <Typography
                                            color="text.secondary"
                                            variant="caption"
                                        >
                                            {r.school ||
                                                t(
                                                    'generalRLTable.unknownSchool'
                                                )}
                                        </Typography>
                                        {r.program_link ? (
                                            <Link
                                                component={LinkDom}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                rel="noopener noreferrer"
                                                sx={programLinkSx}
                                                target="_blank"
                                                to={r.program_link}
                                                underline="hover"
                                            >
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                >
                                                    {r.program_name}
                                                </Typography>
                                                <IconButton
                                                    aria-label="Open program details"
                                                    size="small"
                                                    sx={programLinkIconSx}
                                                >
                                                    <LaunchIcon fontSize="inherit" />
                                                </IconButton>
                                            </Link>
                                        ) : (
                                            <Typography variant="body2">
                                                {r.program_name}
                                            </Typography>
                                        )}
                                    </Stack>
                                </TableCell>
                                <TableCell sx={{ ...tdSx, ...columnSx.notes }}>
                                    {r.requirement_text}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography sx={legendSx} variant="caption">
                {t('generalRLTable.legend')}
            </Typography>
            <Typography sx={{ ...legendSx, mt: 0.5 }} variant="caption">
                {legendDescription}
            </Typography>
        </Paper>
    );
};

function normalizeCount(v) {
    if (v == null) return '';
    const n = parseInt(String(v).trim(), 10);
    return Number.isNaN(n) ? '' : n;
}

// Large sentinel keeps undated/rolling entries after concrete deadlines.
const DEADLINE_FALLBACK_SORT_VALUE = Number.MAX_SAFE_INTEGER;

function compareDecidedStatus(a, b) {
    const da = (a || '').toUpperCase();
    const db = (b || '').toUpperCase();
    if (da === db) return 0;
    if (da === 'O') return -1;
    if (db === 'O') return 1;
    return 0;
}

function getDeadlineSortValue(deadlineText) {
    if (!deadlineText) return DEADLINE_FALLBACK_SORT_VALUE;
    const normalized = String(deadlineText).trim();
    if (!normalized) return DEADLINE_FALLBACK_SORT_VALUE;

    const normalizedLower = normalized.toLowerCase();
    if (normalizedLower === 'withdraw') return DEADLINE_FALLBACK_SORT_VALUE;
    if (normalizedLower === 'no data') return DEADLINE_FALLBACK_SORT_VALUE;
    if (normalized.includes('<TBD>')) return DEADLINE_FALLBACK_SORT_VALUE;
    if (normalizedLower.includes('rolling')) {
        return DEADLINE_FALLBACK_SORT_VALUE - 1;
    }
    if (normalized.includes('/')) {
        const timestamp = new Date(normalized).getTime();
        return Number.isNaN(timestamp)
            ? DEADLINE_FALLBACK_SORT_VALUE
            : timestamp;
    }

    return DEADLINE_FALLBACK_SORT_VALUE;
}

const containerSx = {
    p: 3,
    borderRadius: 3,
    boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
    border: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'background.paper'
};

const headerSx = {
    mb: 2
};

const titleSx = {
    fontWeight: 600,
    color: 'text.primary'
};

const subtitleSx = {
    color: 'text.secondary',
    mt: 0.5
};

const tableContainerSx = {
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    overflowX: 'auto'
};

const tableSx = {
    width: '100%',
    tableLayout: 'fixed'
};

const columnSx = {
    deadline: { width: { xs: '25%', md: '18%' } },
    count: { width: { xs: '15%', md: '10%' } },
    program: { width: { xs: '30%', md: '32%' } },
    notes: { width: { xs: '30%', md: '40%' } }
};

const programLinkSx = {
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.25
};

const programLinkIconSx = {
    ml: 0.25,
    p: 0.25
};

const thSx = {
    borderBottom: '2px solid',
    borderColor: 'divider',
    textAlign: 'left',
    py: 1.25,
    px: 1.5,
    backgroundColor: 'grey.50',
    color: 'text.secondary',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase'
};

const tdSx = {
    borderBottom: '1px solid',
    borderColor: 'divider',
    py: 1.5,
    px: 1.5,
    verticalAlign: 'top',
    color: 'text.primary',
    fontSize: 14,
    whiteSpace: 'normal',
    wordBreak: 'break-word'
};

const rowStatusSx = {
    decided: {
        backgroundColor: '#edf7ed',
        boxShadow: 'inset 3px 0 0 #2e7d32',
        '& td': {
            borderColor: '#c8e6c9'
        }
    },
    undecided: {
        backgroundColor: 'grey.50'
    }
};

const legendSx = {
    mt: 1.5,
    color: 'text.secondary'
};

const statusAlertSx = {
    borderRadius: 2
};

export default GeneralRLRequirementsTab;
