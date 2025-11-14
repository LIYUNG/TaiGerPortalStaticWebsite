import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Box,
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
import { getStudentAndDocLinksQuery } from '../../../../api/query';

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
        const copy = (apps || []).filter((app) => {
            const program = app.programId || null;
            const generalRLNotRequired =
                !app ||
                !program ||
                !program.rl_required ||
                program.rl_required === '0' ||
                program.is_rl_specific;
            return !generalRLNotRequired && app.decided !== 'X';
        });
        copy.sort((a, b) => {
            const da = (a?.decided || '').toUpperCase();
            const db = (b?.decided || '').toUpperCase();
            if (da === db) return 0;
            if (da === 'O') return -1;
            if (db === 'O') return 1;
            return 0;
        });
        return copy;
    }, [apps]);

    const rlRows = useMemo(() => {
        return relevantApplications.map((app) => {
            const program = app.programId || {};
            const school = program.school || '';
            const programName = program.program_name || '';
            const rlRequiredRaw = program.rl_required; // "0","1","2"
            const rlRequired = normalizeCount(rlRequiredRaw);
            const rlText = (program.rl_requirements || '').trim();
            const decided = (app.decided || '-').toUpperCase();
            const applicationYear = (app.application_year || '').trim();
            const programDeadline = (program.application_deadline || '').trim();
            const deadlineDisplay = buildDeadlineDisplay(
                applicationYear,
                programDeadline,
                t
            );

            return {
                key: app._id,
                school,
                program_name: programName,
                count_required: rlRequired || '',
                requirement_text: rlText || 'No specific instructions provided',
                decided,
                deadline: deadlineDisplay
            };
        });
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
                                        <Typography variant="body2">
                                            {r.program_name}
                                        </Typography>
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

function buildDeadlineDisplay(year, deadline, t) {
    const cleanYear = year || '';
    const cleanDeadline = deadline || '';

    if (cleanYear && cleanDeadline) return `${cleanYear}-${cleanDeadline}`;
    if (cleanYear) return cleanYear;
    if (cleanDeadline) return cleanDeadline;
    return t('generalRLTable.deadline.na');
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
    fontSize: 14
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
