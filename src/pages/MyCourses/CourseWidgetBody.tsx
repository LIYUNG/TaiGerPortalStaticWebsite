import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    Link,
    Typography,
    Badge,
    Tabs,
    Tab,
    useTheme
} from '@mui/material';
import { DataSheetGrid, textColumn, keyColumn } from 'react-datasheet-grid';
import { Navigate, Link as LinkDom, useParams } from 'react-router-dom';
// import 'react-datasheet-grid/dist/style.css';
import { is_TaiGer_role } from '@taiger-common/core';
import './react-datasheet-customize.css';
import i18next from 'i18next';

import { convertDateUXFriendly } from '@utils/contants';
import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { WidgetTranscriptanalyserV2 } from '@/api';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { a11yProps, CustomTabPanel } from '@components/Tabs';
import { useSnackBar } from '@contexts/use-snack-bar';
import { ProgramRequirementsTable } from '@components/ProgramRequirementsTable/ProgramRequirementsTable';
import { IProgramrequirement } from '@taiger-common/model';

export interface CourseWidgetBodyProps {
    programRequirements: IProgramrequirement[];
}

export default function CourseWidgetBody({
    programRequirements
}: CourseWidgetBodyProps) {
    const { user } = useAuth();
    const theme = useTheme(); // Get the current theme from Material UI
    const { student_id } = useParams();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();
    const [statedata, setStatedata] = useState({
        error: '',
        coursesdata: [
            {
                course_chinese: '電子學',
                course_english: 'Electronics',
                credits: '3',
                grades: 'B'
            }
        ],
        analysis: {},
        success: false,
        student: null,
        analysis_language: '',
        analyzed_course: '',
        isAnalysing: false,
        isDownloading: false,
        res_status: 0,
        res_modal_status: 0,
        res_modal_message: ''
    });

    const [value, setValue] = useState(0);

    const handleChangeValue = (event, newValue) => {
        setValue(newValue);
    };

    const onChange = (new_data) => {
        setStatedata((state) => ({
            ...state,
            coursesdata: new_data
        }));
    };

    const ConfirmError = () => {
        setStatedata((state) => ({
            ...state,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    const transformedData = programRequirements.map((row) => {
        return {
            ...row, // Spread the original row object
            program_name: `${row.programId[0]?.school} ${row.programId[0]?.program_name} ${row.programId[0]?.degree}`,
            lang: `${row.programId[0]?.lang}`,
            degree: `${row.programId[0]?.degree}`,
            attributes: `${row.attributes?.join('-')}`,
            country: `${row.programId[0]?.country}`,
            updatedAt: convertDateUXFriendly(row.updatedAt),
            id: row._id // Map MongoDB _id to id property
            // other properties...
        };
    });

    const onAnalyseV2 = async (
        requirementIds: string[],
        lang: string,
        factor: string
    ) => {
        setStatedata((state) => ({
            ...state,
            isAnalysing: true
        }));

        try {
            const resp = await WidgetTranscriptanalyserV2(
                lang,
                statedata.coursesdata,
                requirementIds,
                factor
            );

            const { data, success } = resp.data;
            const { status } = resp;
            if (success) {
                setSeverity('success');
                setMessage(i18next.t('Transcript analysed successfully!'));
                setOpenSnackbar(true);
                setStatedata((state) => ({
                    ...state,
                    analysis: data,
                    success: success,
                    isAnalysing: false,
                    res_modal_status: status
                }));
            } else {
                setStatedata((state) => ({
                    ...state,
                    isAnalysing: false,
                    res_modal_status: status,
                    res_modal_message:
                        'Make sure that you updated your courses and select the right target group and language!'
                }));
            }
        } catch (error) {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setStatedata((state) => ({
                ...state,
                isAnalysing: false,
                error,
                res_modal_status: 500,
                res_modal_message:
                    'Make sure that you updated your courses and select the right target group and language!'
            }));
        }
    };

    const columns = [
        {
            ...keyColumn('course_chinese', textColumn),
            title: 'Courses Name Chinese'
        },
        {
            ...keyColumn('course_english', textColumn),
            title: 'Courses Name English'
        },
        {
            ...keyColumn('credits', textColumn),
            title: 'Credits'
        },
        { ...keyColumn('grades', textColumn), title: 'Grades' }
    ];

    if (!student_id) {
        if (!is_TaiGer_role(user)) {
            return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
        }
    }

    if (statedata.res_status >= 400) {
        return <ErrorPage res_status={statedata.res_status} />;
    }

    return (
        <Box>
            {statedata.res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={statedata.res_modal_message}
                    res_modal_status={statedata.res_modal_status}
                />
            ) : null}

            <Box
                alignItems="center"
                display="flex"
                justifyContent="space-between"
                sx={{ my: 1 }}
            >
                <Typography variant="h6">
                    {i18next.t('Course Analyser', { ns: 'common' })}
                </Typography>
                <Box>
                    <Button
                        color="primary"
                        component={LinkDom}
                        sx={{ mr: 2 }}
                        target="_blank"
                        to={`${DEMO.KEYWORDS_EDIT}`}
                        variant="outlined"
                    >
                        {i18next.t('Edit Keywords', { ns: 'common' })}
                    </Button>
                    <Button
                        color="success"
                        component={LinkDom}
                        sx={{ mr: 2 }}
                        to={`${DEMO.COURSE_DATABASE}`}
                        variant="contained"
                    >
                        {i18next.t('Courses DB', { ns: 'common' })}
                    </Button>
                    <Button
                        color="secondary"
                        component={LinkDom}
                        sx={{ mr: 1 }}
                        to={DEMO.PROGRAM_ANALYSIS}
                        variant="contained"
                    >
                        {i18next.t('Program Requirements', { ns: 'common' })}
                    </Button>
                    <Button
                        color="primary"
                        component={LinkDom}
                        target="_blank"
                        to={`${DEMO.CREATE_NEW_PROGRAM_ANALYSIS}`}
                        variant="contained"
                    >
                        {i18next.t('Create New Analysis', { ns: 'common' })}
                    </Button>
                </Box>
            </Box>
            <Box>
                <Card sx={{ p: 2 }}>
                    <Typography sx={{ pt: 1 }}>
                        1. Please fill the courses.
                    </Typography>
                    <Typography>2. Select study group</Typography>
                    <Typography sx={{ mb: 1 }}>
                        3. Select language. <b>Chinese</b> is more accurate.
                    </Typography>
                    <DataSheetGrid
                        autoAddRow={true}
                        columns={columns}
                        disableContextMenu={true}
                        disableExpandSelection={false}
                        headerRowHeight={30}
                        height={1000}
                        onChange={onChange}
                        rowHeight={25}
                        style={{
                            minWidth: '450px',
                            '--dsg-selection-border-color':
                                theme.palette.text.primary,
                            '--dsg-cell-color': theme.palette.text.primary,
                            '--dsg-cell-background-color':
                                theme.palette.background.default,
                            '--dsg-header-text-color':
                                theme.palette.text.primary,
                            '--dsg-header-active-text-color':
                                theme.palette.text.primary
                        }}
                        value={statedata.coursesdata}
                    />
                    <br />
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            aria-label="basic tabs example"
                            onChange={handleChangeValue}
                            scrollButtons="auto"
                            value={value}
                            variant="scrollable"
                        >
                            <Tab
                                label={
                                    <Badge badgeContent="V2" color="error">
                                        New Analyzer
                                    </Badge>
                                }
                                {...a11yProps(value, 0)}
                            />
                        </Tabs>
                    </Box>

                    <CustomTabPanel index={0} value={value}>
                        <Box
                            alignItems="center"
                            display="flex"
                            justifyContent="space-between"
                            sx={{ my: 1 }}
                        >
                            <Typography variant="h6" />
                            <Box />
                        </Box>
                        <ProgramRequirementsTable
                            data={transformedData}
                            onAnalyseV2={onAnalyseV2}
                        />
                        <Typography>
                            {statedata.analysis &&
                            statedata.analysis.isAnalysedV2 ? (
                                <Link
                                    component={LinkDom}
                                    target="_blank"
                                    to={`${DEMO.INTERNAL_WIDGET_V2_LINK(user._id.toString())}`}
                                >
                                    {i18next.t('View Online', {
                                        ns: 'courses'
                                    })}
                                </Link>
                            ) : (
                                i18next.t('No analysis yet', { ns: 'courses' })
                            )}
                        </Typography>
                    </CustomTabPanel>
                </Card>
            </Box>
        </Box>
    );
}
