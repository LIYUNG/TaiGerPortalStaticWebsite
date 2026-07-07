import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_role } from '@taiger-common/core';

import AdmissionsTables from './AdmissionsTables';
import Overview from './Overview';
import StudentAdmissionsTables from './StudentAdmissionTables';
import AdmissionsStat from './AdmissionsStat';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { appConfig } from '../../config';
import { useAuth } from '@components/AuthProvider';
import { a11yProps, CustomTabPanel } from '@components/Tabs';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';

const TAB_KEYS = ['overview', 'application', 'student', 'program'];

const Admissions = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

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

    // Keep internal tab state in sync when URL changes externally (back/forward or link)
    useEffect(() => {
        setValue(initialTabIndex);
    }, [initialTabIndex]);

    const handleChange = (_event: SyntheticEvent, newValue: number) => {
        setValue(newValue);
        // Update the URL with the selected tab while preserving existing params
        const params = new URLSearchParams(location.search);
        params.set('tab', TAB_KEYS[newValue]);
        navigate(`${location.pathname}?${params.toString()}`, {
            replace: false
        });
    };

    if (!is_TaiGer_role(user!)) {
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
                <AdmissionsStat />
            </CustomTabPanel>
        </Box>
    );
};

export default Admissions;
