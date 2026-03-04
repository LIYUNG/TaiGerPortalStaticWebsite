import React, { useState, useCallback, useMemo } from 'react';
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Typography,
    Grid,
    Stack,
    Tabs,
    Tab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Bayerische_Formel } from '@taiger-common/core';
import i18next from 'i18next';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SortIcon from '@mui/icons-material/Sort';
import GaugeCard from '@components/GaugeCard';
import { a11yProps, CustomTabPanel } from '@components/Tabs';
import type { IStudentResponse } from '@taiger-common/model';

import type { ProgramSheet } from './utils';
import {
    settings,
    allRequiredECTSCrossPrograms,
    allAcquiredECTSCrossPrograms,
    allMissCoursesCrossPrograms
} from './utils';
import GPACard from './GPACard';
import ProgramMatchingScores from './ProgramMatchingScores';
import CourseTable from './CourseTable';

interface GeneralCourseAnalysisComponentProps {
    sheets: Record<string, ProgramSheet>;
    student: IStudentResponse;
    onProgramSelect: (index: number) => void;
}

export const GeneralCourseAnalysisComponent = ({
    sheets,
    student,
    onProgramSelect
}: GeneralCourseAnalysisComponentProps) => {
    const [tabTag, setTabTag] = useState(0);
    const theme = useTheme();

    const handleTabChange = useCallback(
        (_event: React.SyntheticEvent, newValue: number) => {
            setTabTag(newValue);
        },
        []
    );

    const programSheetsArray = useMemo(
        () =>
            Object.entries(sheets)
                .filter(([key]) => !['General'].includes(key))
                .map(([key, value]) => ({ key, value })),
        [sheets]
    );

    const generalSheetKeysArray = useMemo(
        () => Object.keys(sheets?.General || {}),
        [sheets?.General]
    );

    const myGermanGPA = useMemo(
        () =>
            Bayerische_Formel(
                student?.academic_background?.university?.Highest_GPA_Uni,
                student?.academic_background?.university?.Passing_GPA_Uni,
                student?.academic_background?.university?.My_GPA_Uni
            ),
        [student?.academic_background?.university]
    );

    const matchingOverallECTSPercentage = useMemo(() => {
        const required = allRequiredECTSCrossPrograms(programSheetsArray);
        return required > 0
            ? (allAcquiredECTSCrossPrograms(programSheetsArray) * 100) /
                  required
            : 0;
    }, [programSheetsArray]);

    const missingCoursesRanking = useMemo(() => {
        const missing_courses_ranking =
            allMissCoursesCrossPrograms(programSheetsArray);
        return missing_courses_ranking;
    }, [programSheetsArray]);

    const topMissingCourses = useMemo(() => {
        return Object.entries(missingCoursesRanking)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 20)
            .map(([course, count]) => ({ course, count }));
    }, [missingCoursesRanking]);

    const numPrograms = useMemo(
        () =>
            Object.entries(sheets).filter(([key]) => !['General'].includes(key))
                ?.length,
        [sheets]
    );

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
                aria-label="Course analysis tabs"
                onChange={handleTabChange}
                scrollButtons="auto"
                sx={{
                    mb: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    '& .MuiTab-root': {
                        minWidth: 120,
                        fontWeight: 'medium',
                        minHeight: 40,
                        py: 0.5
                    },
                    '& .MuiTab-iconWrapper': {
                        marginRight: 1,
                        marginBottom: '0 !important'
                    }
                }}
                value={tabTag}
                variant="scrollable"
            >
                <Tab
                    label={i18next.t('Overview', { ns: 'courses' })}
                    {...a11yProps(tabTag, 0)}
                    icon={<AssessmentIcon sx={{ fontSize: 20 }} />}
                    iconPosition="start"
                />
                <Tab
                    label="Course Sorting"
                    {...a11yProps(tabTag, 1)}
                    icon={<SortIcon sx={{ fontSize: 20 }} />}
                    iconPosition="start"
                />
            </Tabs>

            <CustomTabPanel index={0} value={tabTag}>
                <Grid container spacing={2}>
                    <Grid item md={3} xs={12}>
                        <Card sx={{ height: 280 }}>
                            <CardHeader
                                subheader="Total number of programs being analyzed"
                                title="Analyzed Programs"
                                titleTypography={{
                                    variant: 'h6',
                                    fontWeight: 'medium'
                                }}
                            />
                            <CardContent>
                                <Stack
                                    alignItems="center"
                                    justifyContent="center"
                                    spacing={2}
                                    sx={{ height: '100%' }}
                                >
                                    <Typography
                                        color="primary"
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: '4rem'
                                        }}
                                        variant="h1"
                                    >
                                        {numPrograms}
                                    </Typography>
                                    <Typography
                                        align="center"
                                        color="text.secondary"
                                        variant="subtitle1"
                                    >
                                        {numPrograms === 1
                                            ? 'Program'
                                            : 'Programs'}{' '}
                                        Analyzed
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <GaugeCard
                            CardHeaderProps={{
                                titleTypography: {
                                    variant: 'h6',
                                    fontWeight: 'medium'
                                }
                            }}
                            score={Number(
                                matchingOverallECTSPercentage
                            ).toFixed(0)}
                            settings={settings}
                            subtitle="Average course requirement coverage across all programs"
                            sx={{ height: 280 }}
                            title="Overall Matching Score"
                        />
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <GPACard myGermanGPA={myGermanGPA} student={student} />
                    </Grid>
                    <Grid item md={3} xs={12}>
                        <Card sx={{ height: 280, overflowY: 'auto' }}>
                            <CardHeader
                                title="Top Missing Courses"
                                titleTypography={{
                                    variant: 'h6',
                                    fontWeight: 'medium'
                                }}
                            />
                            <CardContent>
                                <Box
                                    sx={{
                                        height: 'calc(100% - 48px)',
                                        overflowY: 'auto',
                                        '&::-webkit-scrollbar': {
                                            width: '8px'
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: '#f1f1f1',
                                            borderRadius: '4px'
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: '#888',
                                            borderRadius: '4px',
                                            '&:hover': {
                                                background: '#555'
                                            }
                                        }
                                    }}
                                >
                                    {topMissingCourses.map((course) => (
                                        <Typography
                                            key={course.course}
                                            sx={{
                                                py: 0.5,
                                                borderBottom: '1px solid',
                                                borderColor: 'divider',
                                                '&:last-child': {
                                                    borderBottom: 'none'
                                                }
                                            }}
                                        >
                                            {course.course} ({course.count})
                                        </Typography>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <ProgramMatchingScores
                            onProgramSelect={onProgramSelect}
                            programSheetsArray={programSheetsArray}
                        />
                    </Grid>
                </Grid>
            </CustomTabPanel>
            <CustomTabPanel index={1} value={tabTag}>
                <Grid container spacing={3}>
                    {generalSheetKeysArray?.map((keyName) => (
                        <Grid item key={keyName} xs={12}>
                            <Card
                                elevation={2}
                                sx={{
                                    p: 3,
                                    '&:hover': {
                                        boxShadow: theme.shadows[4]
                                    },
                                    transition: 'box-shadow 0.3s ease-in-out'
                                }}
                            >
                                <Typography
                                    color="primary"
                                    gutterBottom
                                    variant="h6"
                                >
                                    {sheets.General?.[keyName][0][keyName]}
                                </Typography>
                                <CourseTable
                                    data={sheets.General?.[keyName] || []}
                                    tableKey="courses"
                                />
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </CustomTabPanel>
        </Box>
    );
};

export default GeneralCourseAnalysisComponent;
