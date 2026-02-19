import { useState, useMemo } from 'react';
import { Tabs, Tab, Box, Typography, Breadcrumbs } from '@mui/material';
import { Navigate, Link as LinkDom, useLocation } from 'react-router-dom';
import { Link } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';

import { TabTitle } from '../../Utils/TabTitle';
import DEMO from '@store/constant';
import { appConfig } from '../../../config';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { CustomTabPanel, a11yProps } from '@components/Tabs';
import {
    INTERNAL_DASHBOARD_REVERSED_TABS,
    INTERNAL_DASHBOARD_TABS
} from '@utils/contants';
import OverviewDashboardTab from './OverviewDashboardTab';
import AgentDashboard from './AgentDashboard';
import KPIDashboardTab from './KPIDashboardTab';
import ResponseTimeDashboardTab from './ResponseTimeDashboardTab';
import { calculateDuration } from '../../Utils/util_functions';
import {
    getStatisticsOverviewQuery,
    getStatisticsAgentsQuery,
    getStatisticsKPIQuery,
    getStatisticsResponseTimeQuery
} from '@/api/query';

const InternalDashboard = () => {
    const { user } = useAuth();
    const { hash } = useLocation();
    const [value, setValue] = useState(
        INTERNAL_DASHBOARD_TABS[hash.replace('#', '')] || 0
    );

    // Lazy load data based on active tab
    const {
        data: overviewData,
        isLoading: isLoadingOverview,
        refetch: refetchOverview
    } = useQuery({
        ...getStatisticsOverviewQuery(),
        enabled: value === 0 // Only load when Overview tab is active
    });

    const {
        data: agentsData,
        isLoading: isLoadingAgents,
        refetch: refetchAgents
    } = useQuery({
        ...getStatisticsAgentsQuery(),
        enabled: value === 1 // Only load when Agents tab is active
    });

    const {
        data: kpiData,
        isLoading: isLoadingKPI,
        refetch: refetchKPI
    } = useQuery({
        ...getStatisticsKPIQuery(),
        enabled: value === 2 // Only load when KPI tab is active
    });

    const {
        data: responseTimeData,
        isLoading: isLoadingResponseTime,
        refetch: refetchResponseTime
    } = useQuery({
        ...getStatisticsResponseTimeQuery(),
        enabled: value === 3 // Only load when Response Time tab is active
    });

    // Process KPI data; useMemo must run before any conditional return (rules-of-hooks)
    const kpiProcessedData = useMemo(() => {
        if (!kpiData?.finished_docs) {
            return {
                CVdataWithDuration: [],
                MLdataWithDuration: [],
                RLdataWithDuration: []
            };
        }

        const finished_docs = kpiData.finished_docs;

        const refactor_finished_cv_docs = finished_docs
            .filter(
                (doc) =>
                    doc.messages.length !== 0 &&
                    doc.messages.length > 2 &&
                    doc.file_type === 'CV'
            )
            .map((finished_doc) => {
                const start_date = finished_doc.messages[0].createdAt;
                const end_date =
                    finished_doc.messages[finished_doc.messages.length - 1]
                        .createdAt;
                return {
                    name: `${finished_doc.student_id?.firstname}-${finished_doc.student_id?.lastname}`,
                    start: start_date,
                    end: end_date
                };
            });
        const CVdataWithDuration = refactor_finished_cv_docs.map((item) => ({
            ...item,
            name: `${item.name}`,
            uv: calculateDuration(item.start, item.end)
        }));

        const refactor_finished_ml_docs = finished_docs
            .filter(
                (doc) =>
                    doc.messages.length !== 0 &&
                    doc.messages.length > 2 &&
                    doc.file_type === 'ML'
            )
            .map((finished_doc) => {
                const start_date = finished_doc.messages[0].createdAt;
                const end_date =
                    finished_doc.messages[finished_doc.messages.length - 1]
                        .createdAt;
                return {
                    name: `${finished_doc.student_id?.firstname}-${finished_doc.student_id?.lastname}`,
                    start: start_date,
                    end: end_date
                };
            });
        const MLdataWithDuration = refactor_finished_ml_docs.map((item) => ({
            ...item,
            name: `${item.name}`,
            uv: calculateDuration(item.start, item.end)
        }));

        const refactor_finished_rl_docs = finished_docs
            .filter(
                (doc) =>
                    doc.messages.length !== 0 &&
                    doc.messages.length > 2 &&
                    (doc.file_type === 'RL_A' ||
                        doc.file_type === 'RL_B' ||
                        doc.file_type === 'RL_C' ||
                        doc.file_type === 'Recommendation_Letter_A' ||
                        doc.file_type === 'Recommendation_Letter_B' ||
                        doc.file_type === 'Recommendation_Letter_C')
            )
            .map((finished_doc) => {
                const start_date = finished_doc.messages[0].createdAt;
                const end_date =
                    finished_doc.messages[finished_doc.messages.length - 1]
                        .createdAt;
                return {
                    name: `${finished_doc.student_id?.firstname}-${finished_doc.student_id?.lastname}`,
                    start: start_date,
                    end: end_date
                };
            });
        const RLdataWithDuration = refactor_finished_rl_docs.map((item) => ({
            ...item,
            name: `${item.name}`,
            uv: calculateDuration(item.start, item.end)
        }));

        return { CVdataWithDuration, MLdataWithDuration, RLdataWithDuration };
    }, [kpiData]);

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    // Determine if we need to show loading (after all hooks)
    const shouldShowLoading =
        (value === 0 && (isLoadingOverview || !overviewData)) ||
        (value === 1 && (isLoadingAgents || !agentsData)) ||
        (value === 2 && (isLoadingKPI || !kpiData)) ||
        (value === 3 && (isLoadingResponseTime || !responseTimeData));

    const handleChange = (event, newValue) => {
        setValue(newValue);
        window.location.hash = INTERNAL_DASHBOARD_REVERSED_TABS[newValue];
        // Trigger refetch for the newly active tab if data hasn't been loaded
        if (newValue === 0 && !overviewData) {
            refetchOverview();
        } else if (newValue === 1 && !agentsData) {
            refetchAgents();
        } else if (newValue === 2 && !kpiData) {
            refetchKPI();
        } else if (newValue === 3 && !responseTimeData) {
            refetchResponseTime();
        }
    };

    if (shouldShowLoading) {
        return <Loading />;
    }

    TabTitle(`${appConfig.companyName} Dashboard`);

    return (
        <Box>
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
                    {i18next.t('tenant-team', {
                        ns: 'common',
                        tenant: appConfig.companyName
                    })}
                </Typography>
                <Typography color="text.primary">
                    {i18next.t('tenant-dashboard', {
                        ns: 'common',
                        tenant: appConfig.companyName
                    })}
                </Typography>
            </Breadcrumbs>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    aria-label="basic tabs example"
                    indicatorColor="primary"
                    onChange={handleChange}
                    scrollButtons="auto"
                    value={value}
                    variant="scrollable"
                >
                    <Tab label="Overview" {...a11yProps(value, 0)} />
                    <Tab label="Agents" {...a11yProps(value, 1)} />
                    <Tab label="KPI" {...a11yProps(value, 2)} />
                    <Tab label="Response Time" {...a11yProps(value, 4)} />
                </Tabs>
            </Box>
            <CustomTabPanel index={0} value={value}>
                {overviewData && (
                    <OverviewDashboardTab
                        agentData={overviewData.agents_data}
                        documents={overviewData.documents}
                        editorData={overviewData.editors_data}
                        studentsCreationDates={
                            overviewData.students_creation_dates
                        }
                        studentsYearsPair={overviewData.students_years_pair}
                    />
                )}
            </CustomTabPanel>
            <CustomTabPanel index={1} value={value}>
                {agentsData && (
                    <AgentDashboard
                        agentStudentDistribution={
                            agentsData.agentStudentDistribution
                        }
                    />
                )}
            </CustomTabPanel>
            <CustomTabPanel index={2} value={value}>
                {kpiData && (
                    <KPIDashboardTab
                        CVdataWithDuration={kpiProcessedData.CVdataWithDuration}
                        MLdataWithDuration={kpiProcessedData.MLdataWithDuration}
                        RLdataWithDuration={kpiProcessedData.RLdataWithDuration}
                    />
                )}
            </CustomTabPanel>
            <CustomTabPanel index={3} value={value}>
                {responseTimeData && (
                    <ResponseTimeDashboardTab
                        agents={responseTimeData.agents_data.reduce(
                            (acc, agent) => {
                                acc[agent._id] = {
                                    firstname: agent.firstname,
                                    lastname: agent.lastname
                                };
                                return acc;
                            },
                            {}
                        )}
                        editors={responseTimeData.editors_data.reduce(
                            (acc, editor) => {
                                acc[editor._id] = {
                                    firstname: editor.firstname,
                                    lastname: editor.lastname
                                };
                                return acc;
                            },
                            {}
                        )}
                        studentAvgResponseTime={
                            responseTimeData.studentAvgResponseTime
                        }
                    />
                )}
            </CustomTabPanel>
        </Box>
    );
};

export default InternalDashboard;
