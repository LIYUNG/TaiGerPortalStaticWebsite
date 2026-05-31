import { SyntheticEvent, useMemo, useState } from 'react';
import { Tabs, Tab, Box, Typography, Card } from '@mui/material';
import { is_TaiGer_role, isProgramDecided } from '@taiger-common/core';

type ApplicationDecisionLike = Parameters<typeof isProgramDecided>[0];

import {
    frequencyDistribution,
    programs_refactor_v2,
    student_transform
} from '../Utils/util_functions';
import { useAuth } from '@components/AuthProvider';
import { CustomTabPanel, a11yProps } from '@components/Tabs';
import { useTranslation } from 'react-i18next';
import ProgramUpdateStatusTable, {
    type ProgramUpdateStatusRow
} from './ProgramUpdateStatusTable';
import TasksDistributionBarChart from '@components/Charts/TasksDistributionBarChart';
import useStudents from '@hooks/useStudents';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { StudentsTable } from '../StudentDatabase/StudentsTable';
import ApplicationOverviewPaginatedTable from './ApplicationOverviewPaginatedTable';
import type {
    IStudentResponse,
    IApplicationPopulated
} from '@taiger-common/model';

export interface ApplicationOverviewTabsProps {
    students: IStudentResponse[];
    applications: IApplicationPopulated[];
    /**
     * When set, the Application Overview tab scopes to this TaiGer user's
     * supervised students (My Students view). Omit for the all-students view.
     */
    userId?: string;
}

const ApplicationOverviewTabs = ({
    students: stds,
    applications,
    userId
}: ApplicationOverviewTabsProps) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [value, setValue] = useState(0);
    const {
        res_modal_status,
        res_modal_message,
        ConfirmError,
        students,
        submitUpdateAgentlist,
        submitUpdateEditorlist,
        submitUpdateAttributeslist,
        updateStudentArchivStatus
    } = useStudents({
        students: stds as unknown as Array<{
            _id: string;
            [key: string]: unknown;
        }>
    });

    const handleChange = (_event: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const open_applications_arr = useMemo(() => {
        return programs_refactor_v2(applications);
    }, [applications]);

    interface ApplicationDistributionItem {
        closed?: string;
        deadline?: string;
        file_type?: string;
        isPotentials?: boolean;
        show?: boolean;
    }
    const applications_distribution = open_applications_arr.map(
        ({
            closed,
            deadline,
            file_type,
            isPotentials,
            show
        }: ApplicationDistributionItem) => ({
            closed,
            deadline,
            file_type,
            isPotentials,
            show
        })
    );
    const open_distr = frequencyDistribution(applications_distribution);

    const sort_date = Object.keys(open_distr).sort();

    const sorted_date_freq_pair: Array<
        Record<string, string | number> & {
            name: string;
            active: number;
            potentials: number;
        }
    > = [];
    sort_date.forEach((date: string) => {
        const entry = open_distr[date];
        sorted_date_freq_pair.push({
            name: `${date}`,
            active: entry?.show ?? 0,
            potentials: entry?.potentials ?? 0
        });
    });

    const studentsTransformed = student_transform(
        students?.filter((student) => !student.archiv)
    );

    return (
        <>
            <Box sx={{ width: '100%' }}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="h6">
                        {t('Open Applications Distribution', { ns: 'common' })}
                    </Typography>
                    <Typography>
                        <b style={{ color: 'red' }}>active:</b>{' '}
                        {t('Students decided programs', { ns: 'common' })}
                    </Typography>
                    <Typography>
                        <b style={{ color: '#A9A9A9' }}>potentials:</b>{' '}
                        {t(
                            'Students do not decide programs yet. But the applications will be potentially activated when they would decide',
                            { ns: 'common' }
                        )}
                    </Typography>
                    <TasksDistributionBarChart
                        data={sorted_date_freq_pair}
                        k="name"
                        value1="active"
                        value2="potentials"
                        yLabel="Applications"
                    />
                </Card>
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
                        <StudentsTable
                            data={studentsTransformed}
                            isLoading={false}
                            submitUpdateAgentlist={submitUpdateAgentlist}
                            submitUpdateAttributeslist={
                                submitUpdateAttributeslist
                            }
                            submitUpdateEditorlist={submitUpdateEditorlist}
                            updateStudentArchivStatus={
                                updateStudentArchivStatus
                            }
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
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}
        </>
    );
};

export default ApplicationOverviewTabs;
