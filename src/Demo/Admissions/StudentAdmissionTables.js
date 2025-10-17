import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
// import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import StudentOverviewTable from '../../components/StudentOverviewTable';
import FinalDecisionOverview from '../../components/StudentOverviewTable/finalDecisionOverview';
import Loading from '../../components/Loading/Loading';
import { getActiveStudentsQuery } from '../../api/query';

const StudentAdmissionsTables = () => {
    // const { t } = useTranslation();
    const [tab, setTab] = React.useState(0);
    const handleTabChange = (_e, newValue) => setTab(newValue);

    // Fetch all active students (not archived)
    const { data, isLoading } = useQuery(
        getActiveStudentsQuery(queryString.stringify({ archiv: false }))
    );
    const students = data?.data || [];

    return (
        <Box>
            <Tabs
                aria-label="admissions students tables"
                onChange={handleTabChange}
                value={tab}
            >
                <Tab label={i18next.t('Students at Risk', { ns: 'common' })} />
                <Tab label={i18next.t('Final Decisions', { ns: 'common' })} />
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
