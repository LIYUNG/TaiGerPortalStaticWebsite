import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_role } from '@taiger-common/core';
import queryString from 'query-string';

import AdmissionsTables from './AdmissionsTables';
import Overview from './Overview';
import StudentAdmissionsTables from './StudentAdmissionTables';
import AdmissionsStat from './AdmissionsStat';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { appConfig } from '../../config';
import { useAuth } from '../../components/AuthProvider';
import Loading from '../../components/Loading/Loading';
import { a11yProps, CustomTabPanel } from '../../components/Tabs';
import { getAdmissionsQuery } from '../../api/query';
import { BreadcrumbsNavigation } from '../../components/BreadcrumbsNavigation/BreadcrumbsNavigation';

const Admissions = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const TAB_KEYS = ['overview', 'application', 'student', 'program'];

    // Read search params from router location
    const searchParams = useMemo(
        () => new URLSearchParams(location.search),
        [location.search]
    );

    const currentTabParam = (searchParams.get('tab') || '').toLowerCase();
    const initialTabIndex = useMemo(() => {
        const idx = TAB_KEYS.indexOf(currentTabParam);
        return idx >= 0 ? idx : 0;
    }, [currentTabParam]);

    const [value, setValue] = useState(initialTabIndex);
    const { t } = useTranslation();
    const decided = searchParams.get('decided') || 'O';
    const closed = searchParams.get('closed');
    const admission = searchParams.get('admission');
    const { data, isLoading, isError, error } = useQuery(
        getAdmissionsQuery(
            queryString.stringify({ decided, closed, admission })
        )
    );

    // Keep internal tab state in sync when URL changes externally (back/forward or link)
    useEffect(() => {
        setValue(initialTabIndex);
    }, [initialTabIndex]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
        // Update the URL with the selected tab while preserving existing params
        const params = new URLSearchParams(location.search);
        params.set('tab', TAB_KEYS[newValue]);
        navigate(`${location.pathname}?${params.toString()}`, {
            replace: false
        });
    };

    const result = data?.result;

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    TabTitle(`${appConfig.companyName} Admissions`);

    return (
        <Box data-testid="admissinos_page">
            <BreadcrumbsNavigation
                items={[
                    { label: appConfig.companyName, link: DEMO.DASHBOARD_LINK },
                    {
                        label: t('All Students', { ns: 'common' }),
                        link: DEMO.DASHBOARD_LINK
                    },
                    {
                        label: t('tenant-admissions', {
                            ns: 'common',
                            tenant: appConfig.companyName
                        })
                    }
                ]}
            />
            {isLoading ? <Loading /> : null}
            {isError ? error : null}
            {!isLoading && !isError ? (
                <>
                    <Box>
                        <Tabs
                            aria-label="basic tabs example"
                            onChange={handleChange}
                            scrollButtons="auto"
                            value={value}
                            variant="scrollable"
                        >
                            <Tab
                                label={`${t('Overview', {
                                    ns: 'translation'
                                })}`}
                                {...a11yProps(value, 0)}
                            />
                            <Tab
                                label={`${t('Application', {
                                    ns: 'common'
                                })}`}
                                {...a11yProps(value, 1)}
                            />
                            <Tab
                                label={`${t('Student', { ns: 'common' })}`}
                                {...a11yProps(value, 2)}
                            />
                            <Tab
                                label={`${t('Program', { ns: 'common' })}`}
                                {...a11yProps(value, 3)}
                            />
                        </Tabs>
                    </Box>
                    <CustomTabPanel index={0} value={value}>
                        <Overview />
                    </CustomTabPanel>
                    <CustomTabPanel index={1} value={value}>
                        <AdmissionsTables />
                    </CustomTabPanel>
                    <CustomTabPanel index={2} value={value}>
                        <StudentAdmissionsTables />
                    </CustomTabPanel>
                    <CustomTabPanel index={3} value={value}>
                        <AdmissionsStat result={result} />
                    </CustomTabPanel>
                </>
            ) : null}
        </Box>
    );
};

export default Admissions;
