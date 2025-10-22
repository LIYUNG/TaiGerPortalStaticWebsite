/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';

import { CustomTabPanel, a11yProps } from '../../components/Tabs';
import { useTranslation } from 'react-i18next';
import AdmissionTable from './AdmissionTable';
import { getAdmissionsOverviewQuery } from '../../api/query';

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
};

const AdmissionsTables = () => {
    const [value, setValue] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const SUBTAB_KEYS = ['admission', 'rejection', 'pending', 'not-closed'];

    const searchParams = useMemo(
        () => new URLSearchParams(location.search),
        [location.search]
    );
    const currentSubTab = (searchParams.get('subtab') || '').toLowerCase();
    const initialIdx = useMemo(() => {
        const idx = SUBTAB_KEYS.indexOf(currentSubTab);
        return idx >= 0 ? idx : 0;
    }, [currentSubTab]);

    useEffect(() => {
        setValue(initialIdx);
    }, [initialIdx]);
    const { t } = useTranslation();
    const handleChange = (event, newValue) => {
        setValue(newValue);
        const params = new URLSearchParams(location.search);
        params.set('subtab', SUBTAB_KEYS[newValue]);
        // Ensure top-level tab reflects Application for clarity
        params.set('tab', 'application');
        navigate(`${location.pathname}?${params.toString()}`);
    };
    const { data } = useQuery(getAdmissionsOverviewQuery());
    const result = data?.data || [];

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    aria-label="basic tabs example"
                    onChange={handleChange}
                    scrollButtons="auto"
                    value={value}
                    variant="scrollable"
                >
                    <Tab
                        label={`${t('Admissions', {
                            ns: 'admissions'
                        })} ( ${result.admission || 0} )`}
                        {...a11yProps(value, 0)}
                    />
                    <Tab
                        label={`${t('Rejections', { ns: 'admissions' })} ( ${
                            result.rejection || 0
                        } )`}
                        {...a11yProps(value, 1)}
                    />
                    <Tab
                        label={`${t('Pending Result', {
                            ns: 'admissions'
                        })} ( ${result.pending || 0} )`}
                        {...a11yProps(value, 2)}
                    />
                    <Tab
                        label={`${t('Not Closed Yet', { ns: 'admissions' })} ( ${
                            result.notYetSubmitted || 0
                        } )`}
                        {...a11yProps(value, 3)}
                    />
                </Tabs>
            </Box>
            <CustomTabPanel index={0} value={value}>
                <AdmissionTable
                    query={{ decided: 'O', closed: 'O', admission: 'O' }}
                />
            </CustomTabPanel>
            <CustomTabPanel index={1} value={value}>
                <AdmissionTable
                    query={{ decided: 'O', closed: 'O', admission: 'X' }}
                />
            </CustomTabPanel>
            <CustomTabPanel index={2} value={value}>
                <AdmissionTable
                    query={{ decided: 'O', closed: 'O', admission: '-' }}
                />
            </CustomTabPanel>
            <CustomTabPanel index={3} value={value}>
                <AdmissionTable
                    query={{ decided: 'O', closed: '-', admission: '-' }}
                />
            </CustomTabPanel>
        </>
    );
};

export default AdmissionsTables;
