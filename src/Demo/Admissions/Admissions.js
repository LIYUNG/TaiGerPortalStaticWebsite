import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_role } from '@taiger-common/core';
import queryString from 'query-string';

import AdmissionsTables from './AdmissionsTables';
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
    const [value, setValue] = useState(0);
    const { t } = useTranslation();
    const query = new URLSearchParams(window.location.search);
    const decided = query.get('decided') || 'O';
    const closed = query.get('closed');
    const admission = query.get('admission');
    const { data, isLoading, isError, error } = useQuery(
        getAdmissionsQuery(
            queryString.stringify({ decided, closed, admission })
        )
    );

    const handleChange = (event, newValue) => {
        // navigate(`${window.location.pathname}?${query.toString()}`);
        setValue(newValue);
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
                                label={`${t('Application', {
                                    ns: 'common'
                                })}`}
                                {...a11yProps(value, 0)}
                            />
                            <Tab
                                label={`${t('Student', { ns: 'common' })}`}
                                {...a11yProps(value, 1)}
                            />
                            <Tab
                                label={`${t('Program', { ns: 'common' })}`}
                                {...a11yProps(value, 2)}
                            />
                        </Tabs>
                    </Box>
                    <CustomTabPanel index={0} value={value}>
                        <AdmissionsTables />
                    </CustomTabPanel>
                    <CustomTabPanel index={1} value={value}>
                        <StudentAdmissionsTables />
                    </CustomTabPanel>
                    <CustomTabPanel index={2} value={value}>
                        <AdmissionsStat result={result} />
                    </CustomTabPanel>
                </>
            ) : null}
        </Box>
    );
};

export default Admissions;
