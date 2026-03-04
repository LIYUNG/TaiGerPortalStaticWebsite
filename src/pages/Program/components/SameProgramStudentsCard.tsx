import React, { useState } from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Card,
    Link,
    Skeleton,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tabs,
    Typography
} from '@mui/material';
import { isProgramWithdraw } from '@taiger-common/core';
import { isApplicationOpen } from '../../Utils/util_functions';
import DEMO from '@store/constant';
import { a11yProps, CustomTabPanel } from '@components/Tabs';
import type { SingleProgramViewStudent } from '../SingleProgramView';

export interface SameProgramStudentsCardProps {
    students: SingleProgramViewStudent[];
    isLoading: boolean;
}

const SameProgramStudentsCard = ({
    students,
    isLoading
}: SameProgramStudentsCardProps) => {
    const { t } = useTranslation();
    const [studentsTabValue, setStudentsTabValue] = useState(0);

    const handleStudentsTabChange = (
        _event: React.SyntheticEvent,
        newValue: number
    ) => {
        setStudentsTabValue(newValue);
    };

    return (
        <Card className="card-with-scroll" sx={{ p: 2 }}>
            <div className="card-scrollable-body">
                <Tabs
                    aria-label="basic tabs example"
                    onChange={handleStudentsTabChange}
                    scrollButtons="auto"
                    value={studentsTabValue}
                    variant="scrollable"
                >
                    <Tab
                        label="In Progress"
                        {...a11yProps(studentsTabValue, 0)}
                    />
                    <Tab label="Closed" {...a11yProps(studentsTabValue, 1)} />
                </Tabs>
                <CustomTabPanel index={0} value={studentsTabValue}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    {t('Name', { ns: 'common' })}
                                </TableCell>
                                <TableCell>
                                    {t('Agent', { ns: 'common' })}
                                </TableCell>
                                <TableCell>
                                    {t('Editor', { ns: 'common' })}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        <Skeleton
                                            height={40}
                                            variant="text"
                                            width="100%"
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students
                                    ?.filter((student) =>
                                        isApplicationOpen(student)
                                    )
                                    .map((student, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <Link
                                                    component={LinkDom}
                                                    to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                                        student._id?.toString(),
                                                        DEMO.PROFILE_HASH
                                                    )}`}
                                                >
                                                    {student.firstname}{' '}
                                                    {student.lastname}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {student.agents?.map(
                                                    (agent) => (
                                                        <Link
                                                            component={LinkDom}
                                                            key={agent._id}
                                                            sx={{ mr: 1 }}
                                                            to={`${DEMO.TEAM_AGENT_LINK(
                                                                agent._id?.toString()
                                                            )}`}
                                                        >
                                                            {agent.firstname}
                                                        </Link>
                                                    )
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {student.editors?.map(
                                                    (editor) => (
                                                        <Link
                                                            component={LinkDom}
                                                            key={editor._id}
                                                            sx={{ mr: 1 }}
                                                            to={`${DEMO.TEAM_EDITOR_LINK(
                                                                editor._id?.toString()
                                                            )}`}
                                                        >
                                                            {editor.firstname}
                                                        </Link>
                                                    )
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </CustomTabPanel>
                <CustomTabPanel index={1} value={studentsTabValue}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    {t('Name', { ns: 'common' })}
                                </TableCell>
                                <TableCell>
                                    {t('Year', { ns: 'common' })}
                                </TableCell>
                                <TableCell>
                                    {t('Admission', { ns: 'admissions' })}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3}>
                                        <Skeleton
                                            height={40}
                                            variant="text"
                                            width="100%"
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students
                                    ?.filter(
                                        (student) => !isApplicationOpen(student)
                                    )
                                    .map((student, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <Link
                                                    component={LinkDom}
                                                    to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                                        student._id?.toString(),
                                                        DEMO.PROFILE_HASH
                                                    )}`}
                                                >
                                                    {student.firstname}{' '}
                                                    {student.lastname}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {student.application_year
                                                    ? student.application_year
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {isProgramWithdraw(student)
                                                    ? 'WITHDREW'
                                                    : student.admission}
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                    <Typography sx={{ mt: 2 }} variant="string">
                        O: admitted, X: rejected, -: not confirmed{' '}
                    </Typography>
                </CustomTabPanel>
            </div>
        </Card>
    );
};

export default SameProgramStudentsCard;
