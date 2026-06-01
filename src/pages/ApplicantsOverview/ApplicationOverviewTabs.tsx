import { SyntheticEvent, useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';

import { useAuth } from '@components/AuthProvider';
import { CustomTabPanel, a11yProps } from '@components/Tabs';
import { useTranslation } from 'react-i18next';
import ApplicationOverviewPaginatedTable from './ApplicationOverviewPaginatedTable';
import { OpenApplicationsDistributionChart } from './OpenApplicationsDistributionChart';
import { ProgramUpdateStatusTab } from './ProgramUpdateStatusTab';
import { StudentsTablePaginated } from '../StudentDatabase/StudentsTablePaginated';

export interface ApplicationOverviewTabsProps {
    /**
     * When set, the chart, Application Overview, and Programs Update tabs scope
     * to this TaiGer user's supervised students (agent OR editor). Omit for the
     * all-students view.
     */
    userId?: string;
    /** Scope the Active-Student-List tab to students of this agent id. */
    agents?: string;
    /** Scope the Active-Student-List tab to students of this editor id. */
    editors?: string;
}

const ApplicationOverviewTabs = ({
    userId,
    agents,
    editors
}: ApplicationOverviewTabsProps) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [value, setValue] = useState(0);

    const handleChange = (_event: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <>
            <Box sx={{ width: '100%' }}>
                <OpenApplicationsDistributionChart userId={userId} />
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        aria-label="basic tabs example"
                        onChange={handleChange}
                        scrollButtons="auto"
                        value={value}
                        variant="scrollable"
                    >
                        <Tab
                            data-testid="application_overview_component_active_student_list_tab"
                            label={t('Active Student List')}
                            {...a11yProps(value, 0)}
                        />
                        <Tab
                            data-testid="application_overview_component_application_overview_tab"
                            label={t('Application Overview', { ns: 'common' })}
                            {...a11yProps(value, 1)}
                        />
                        <Tab
                            data-testid="application_overview_component_programs_update_tab"
                            label={t('Programs Update Status')}
                            {...a11yProps(value, 2)}
                        />
                        <Tab
                            data-testid="application_overview_component_decided_programs_update_tab"
                            label={t('Decided Programs Update Status')}
                            {...a11yProps(value, 3)}
                        />
                    </Tabs>
                </Box>
                <CustomTabPanel index={0} value={value}>
                    {user &&
                    user.role &&
                    is_TaiGer_role(user as unknown as { role: string }) ? (
                        <StudentsTablePaginated
                            agents={agents}
                            archiv={false}
                            editors={editors}
                        />
                    ) : null}
                </CustomTabPanel>
                <CustomTabPanel index={1} value={value}>
                    <ApplicationOverviewPaginatedTable userId={userId} />
                </CustomTabPanel>
                <CustomTabPanel index={2} value={value}>
                    <ProgramUpdateStatusTab userId={userId} />
                </CustomTabPanel>
                <CustomTabPanel index={3} value={value}>
                    <ProgramUpdateStatusTab decidedOnly userId={userId} />
                </CustomTabPanel>
            </Box>
        </>
    );
};

export default ApplicationOverviewTabs;
