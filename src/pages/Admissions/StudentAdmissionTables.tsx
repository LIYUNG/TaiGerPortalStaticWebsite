import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import StudentOverviewTable from '@components/StudentOverviewTable';
import FinalDecisionOverview from '@components/StudentOverviewTable/finalDecisionOverview';
import Loading from '@components/Loading/Loading';
import { useActiveStudents } from '@hooks/useActiveStudents';

const STUDENT_TAB_KEYS = ['risk', 'final'];

const StudentAdmissionsTables = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [tab, setTab] = useState<number>(0);

    const handleTabChange = (_e: SyntheticEvent, newValue: number) => {
        setTab(newValue);
        const params = new URLSearchParams(location.search);
        params.set('studentTab', STUDENT_TAB_KEYS[newValue]);
        // Ensure top-level tab reflects Student
        params.set('tab', 'student');
        navigate(`${location.pathname}?${params.toString()}`);
    };

    // Fetch all active students (not archived)
    const { data: students, isLoading } = useActiveStudents({ archiv: false });

    return (
        <Box>
            <Tabs
                aria-label="admissions students tables"
                onChange={handleTabChange}
                value={tab}
            >
                <Tab label={t('Students at Risk', { ns: 'common' })} />
                <Tab label={t('Final Decisions', { ns: 'common' })} />
            </Tabs>
            <Box sx={{ mt: 2 }}>
                {isLoading ? (
                    <Loading />
                ) : tab === 0 ? (
                    <StudentOverviewTable
                        riskOnly
                        students={students}
                        title="Risk"
                    />
                ) : (
                    <FinalDecisionOverview students={students} />
                )}
            </Box>
        </Box>
    );
};

export default StudentAdmissionsTables;
