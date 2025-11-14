import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStudentAndDocLinksQuery } from '../../../../api/query';

export const GeneralRLRequirementsTab = ({ studentId }) => {
    const { data: response, isLoading } = useQuery(
        getStudentAndDocLinksQuery({ studentId })
    );

    if (!studentId)
        return <div style={{ color: 'red' }}>Missing studentId</div>;
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

            return {
                key: app._id,
                school,
                program_name: programName,
                count_required: rlRequired || '',
                requirement_text: rlText || 'No specific instructions provided',
                decided
            };
        });
    }, [relevantApplications]);

    if (isLoading) return <div>Loading RL requirements...</div>;

    if (!relevantApplications.length) {
        console.log(relevantApplications);
        return <div>No applications available.</div>;
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h3>Recommendation Letter Requirements</h3>
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                }}
            >
                <thead>
                    <tr>
                        <th style={th}>School</th>
                        <th style={th}>Program</th>
                        <th style={th}>RL Count Required</th>
                        <th style={th}>RL Requirements / Notes</th>
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
                            <td style={td}>{r.count_required}</td>
                            <td style={td}>{r.requirement_text}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

function normalizeCount(v) {
    if (v == null) return '';
    const n = parseInt(String(v).trim(), 10);
    return Number.isNaN(n) ? '' : n;
}

const th = {
    borderBottom: '1px solid #ccc',
    textAlign: 'left',
    padding: '6px',
    background: '#f5f5f5'
};

const td = {
    borderBottom: '1px solid #eee',
    padding: '6px',
    verticalAlign: 'top'
};

const rowStatusStyles = {
    undecided: {
        background: '#f4f4f4'
    }
};

export default GeneralRLRequirementsTab;
