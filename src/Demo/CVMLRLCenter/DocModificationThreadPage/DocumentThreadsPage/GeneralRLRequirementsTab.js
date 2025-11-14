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
    console.log(`studentData ${studentId}: `, response);

    // decided field in sample data: "-" = undecided, "O" = decided
    const decidedApplications = useMemo(() => {
        return apps.filter((app) => {
            if (!app) return false;
            const d = (app.decided || '').toUpperCase();
            return d === 'O';
        });
    }, [apps]);

    const rlRows = useMemo(() => {
        return decidedApplications.map((app) => {
            const program = app.programId || {};
            const school = program.school || '';
            const programName = program.program_name || '';
            const rlRequiredRaw = program.rl_required; // "0","1","2"
            const rlRequired = normalizeCount(rlRequiredRaw);
            const rlText = (program.rl_requirements || '').trim();

            return {
                key: app._id,
                school,
                program_name: programName,
                count_required: rlRequired || '',
                requirement_text: rlText || 'No specific instructions provided'
            };
        });
    }, [decidedApplications]);

    if (isLoading) return <div>Loading RL requirements...</div>;

    if (!decidedApplications.length) {
        console.log(decidedApplications);
        return <div>No decided applications available.</div>;
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h3>Recommendation Letter Requirements for Decided Applications</h3>
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
                        <tr key={r.key}>
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

export default GeneralRLRequirementsTab;
