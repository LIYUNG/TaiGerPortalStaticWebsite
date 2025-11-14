import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getStudentAndDocLinksQuery } from '../../../../api/query';

export const GeneralRLRequirementsTab = ({ studentId }) => {
    const { t } = useTranslation('cvmlrl');
    const { data: response, isLoading } = useQuery(
        getStudentAndDocLinksQuery({ studentId })
    );

    if (!studentId)
        return (
            <div style={errorStyle}>{t('generalRLTable.missingStudentId')}</div>
        );
    const student = response?.data?.data || null;
    const apps = student?.applications || [];

    // decided field in sample data: "-" = pending/undecided, "O" = decided, "X" = excluded
    const relevantApplications = useMemo(() => {
        const copy = (apps || []).filter((app) => {
            if (!app) return false;
            const d = (app.decided || '').toUpperCase();
            return d !== 'X';
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

    if (isLoading)
        return <div style={infoStyle}>{t('generalRLTable.loading')}</div>;

    if (!relevantApplications.length) {
        console.log(relevantApplications);
        return (
            <div style={infoStyle}>{t('generalRLTable.noApplications')}</div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h3 style={titleStyle}>{t('generalRLTable.title')}</h3>
                <p style={subtitleStyle}>{t('generalRLTable.subtitle')}</p>
            </div>
            <div style={tableWrapperStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={th}>
                                {t('generalRLTable.columns.school')}
                            </th>
                            <th style={th}>
                                {t('generalRLTable.columns.program')}
                            </th>
                            <th style={th}>
                                {t('generalRLTable.columns.deadline')}
                            </th>
                            <th style={th}>
                                {t('generalRLTable.columns.count')}
                            </th>
                            <th style={th}>
                                {t('generalRLTable.columns.notes')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rlRows.map((r) => (
                            <tr
                                key={r.key}
                                style={
                                    r.decided === 'O'
                                        ? undefined
                                        : rowStatusStyles.undecided
                                }
                            >
                                <td style={td}>{r.school}</td>
                                <td style={td}>{r.program_name}</td>
                                <td style={td}>{r.deadline}</td>
                                <td style={td}>{r.count_required}</td>
                                <td style={td}>{r.requirement_text}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={legendStyle}>{t('generalRLTable.legend')}</div>
            </div>
        </div>
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

const containerStyle = {
    padding: '1.5rem',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
    border: '1px solid #edf2f7'
};

const headerStyle = {
    marginBottom: '1rem'
};

const titleStyle = {
    margin: 0,
    fontSize: '1.25rem',
    color: '#1a202c'
};

const subtitleStyle = {
    margin: '0.25rem 0 0',
    color: '#4a5568',
    fontSize: '0.9rem'
};

const tableWrapperStyle = {
    overflowX: 'auto'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
};

const th = {
    borderBottom: '2px solid #e2e8f0',
    textAlign: 'left',
    padding: '10px',
    background: '#f8fafc',
    color: '#2d3748',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const td = {
    borderBottom: '1px solid #edf2f7',
    padding: '10px',
    verticalAlign: 'top',
    color: '#2d3748'
};

const rowStatusStyles = {
    undecided: {
        background: '#f7f7f7'
    }
};

const infoStyle = {
    padding: '0.75rem 1rem',
    background: '#ebf8ff',
    color: '#2b6cb0',
    borderRadius: '8px',
    fontSize: '0.95rem'
};

const errorStyle = {
    padding: '0.75rem 1rem',
    background: '#fff5f5',
    color: '#c53030',
    borderRadius: '8px',
    fontSize: '0.95rem'
};

const legendStyle = {
    marginTop: '0.75rem',
    fontSize: '12px',
    color: '#4a5568'
};

export default GeneralRLRequirementsTab;
