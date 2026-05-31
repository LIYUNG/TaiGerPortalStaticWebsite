import { SyntheticEvent, useMemo, useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { is_TaiGer_role, isProgramDecided } from '@taiger-common/core';

type ApplicationDecisionLike = Parameters<typeof isProgramDecided>[0];

import { programs_refactor_v2 } from '../Utils/util_functions';
import { useAuth } from '@components/AuthProvider';
import { CustomTabPanel, a11yProps } from '@components/Tabs';
import { useTranslation } from 'react-i18next';
import ProgramUpdateStatusTable, {
    type ProgramUpdateStatusRow
} from './ProgramUpdateStatusTable';
import ApplicationOverviewPaginatedTable from './ApplicationOverviewPaginatedTable';
import { OpenApplicationsDistributionChart } from './OpenApplicationsDistributionChart';
import { StudentsTablePaginated } from '../StudentDatabase/StudentsTablePaginated';
import type { IApplicationPopulated } from '@taiger-common/model';

export interface ApplicationOverviewTabsProps {
    applications: IApplicationPopulated[];
    /**
     * When set, the Application Overview tab scopes to this TaiGer user's
     * supervised students (agent OR editor). Omit for the all-students view.
     */
    userId?: string;
    /** Scope the Active-Student-List tab to students of this agent id. */
    agents?: string;
    /** Scope the Active-Student-List tab to students of this editor id. */
    editors?: string;
}

const ApplicationOverviewTabs = ({
    applications,
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

    const open_applications_arr = useMemo(() => {
        return programs_refactor_v2(applications);
    }, [applications]);

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
                    <ProgramUpdateStatusTable
                        data={open_applications_arr as ProgramUpdateStatusRow[]}
                    />
                </CustomTabPanel>
                <CustomTabPanel index={3} value={value}>
                    <ProgramUpdateStatusTable
                        data={
                            open_applications_arr.filter((application) =>
                                isProgramDecided(
                                    application as ApplicationDecisionLike
                                )
                            ) as ProgramUpdateStatusRow[]
                        }
                    />
                </CustomTabPanel>
            </Box>
        </>
    );
};

export default ApplicationOverviewTabs;
