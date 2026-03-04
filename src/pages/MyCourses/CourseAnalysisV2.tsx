import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as LinkDom, useParams } from 'react-router-dom';
import 'react-datasheet-grid/dist/style.css';
import {
    is_TaiGer_AdminAgent,
    is_TaiGer_role
} from '@taiger-common/core';
import MessageIcon from '@mui/icons-material/Message';

import {
    convertDate
} from '@utils/contants';
import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { analyzedFileV2Download, WidgetanalyzedFileV2Download } from '@/api';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { appConfig } from '../../config';
import type { SelectChangeEvent } from '@mui/material';

import { GeneralCourseAnalysisComponent } from './components/GeneralCourseAnalysisComponent';
import { CourseAnalysisComponent } from './components/CourseAnalysisComponent';

export default function CourseAnalysisV2() {
    const { user_id } = useParams();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [value, setValue] = useState(0);
    const [sheetName, setSheetName] = useState('General');
    const [statedata, setStatedata] = useState({
        error: '',
        isLoaded: false,
        sheets: {},
        sheetNames: [],
        success: false,
        student: null,
        excel_file: {},
        studentId: '',
        file: '',
        isDownloading: false,
        LastModified: '',
        res_status: 0,
        res_modal_status: 0,
        res_modal_message: ''
    });
    useEffect(() => {
        const downloadFn = window.location.href.includes('internal')
            ? WidgetanalyzedFileV2Download
            : analyzedFileV2Download; // Get the full URI
        downloadFn(user_id).then(
            (resp) => {
                const { success, json, student } = resp.data;
                if (success) {
                    const timestamp = json['timestamp'];
                    delete json['timestamp'];
                    const factor = json['factor'];
                    delete json['factor'];
                    setStatedata((prevState) => ({
                        ...prevState,
                        sheetNames: Object.keys(json),
                        sheets: json,
                        factor,
                        student,
                        isLoaded: true,
                        timestamp
                    }));
                    setSheetName('General');
                } else {
                    const { statusText } = resp;
                    setStatedata((state) => ({
                        ...state,
                        isLoaded: true,
                        res_modal_status: status,
                        res_modal_message: statusText
                    }));
                }
            },
            (error) => {
                setStatedata((state) => ({
                    ...state,
                    isLoaded: true,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    }, [user_id]);

    const handleProgramChange = useCallback(
        (event: SelectChangeEvent<number>) => {
            const selectedIndex = (event.target.value as number) + 1;
            setValue(selectedIndex);
            setSheetName(statedata.sheetNames[selectedIndex]);
        },
        [statedata.sheetNames]
    );

    const handleProgramSelect = useCallback(
        (index: number) => {
            const selectedIndex = index + 1;
            setValue(selectedIndex);
            setSheetName(statedata.sheetNames[selectedIndex]);
            // Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        [statedata.sheetNames]
    );

    const handleBackToOverview = useCallback(() => {
        setValue(0);
        setSheetName('General');
    }, []);

    const ConfirmError = () => {
        setStatedata((state) => ({
            ...state,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    if (!statedata?.isLoaded) {
        return <Loading />;
    }
    const student_name = `${statedata.student?.firstname} ${statedata.student?.lastname}`;
    TabTitle(`Student ${student_name} || Courses Analysis`);
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
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                {!window.location.href.includes('internal') &&
                is_TaiGer_role(user) ? (
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                            statedata.student?._id?.toString(),
                            DEMO.PROFILE_HASH
                        )}`}
                        underline="hover"
                    >
                        {student_name}
                    </Link>
                ) : null}
                {window.location.href.includes('internal') ? (
                    <Typography>{t('Tools', { ns: 'common' })}</Typography>
                ) : null}
                {window.location.href.includes('internal') ? (
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.INTERNAL_WIDGET_COURSE_ANALYSER_LINK}`}
                        underline="hover"
                    >
                        {t('Course Analyser', { ns: 'common' })}
                    </Link>
                ) : null}
                {!window.location.href.includes('internal') ? (
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.COURSES_INPUT_LINK(statedata.student?._id?.toString())}`}
                        underline="hover"
                    >
                        {t('My Courses')}
                    </Link>
                ) : null}
                <Typography color="text.primary">
                    {t('Courses Analysis')}
                </Typography>
            </Breadcrumbs>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.primary" sx={{ pt: 2 }} variant="h6">
                    {t('Courses Analysis')}
                </Typography>
                {is_TaiGer_AdminAgent(user) ? (
                    <Link
                        color="inherit"
                        component={LinkDom}
                        sx={{ mr: 1 }}
                        to={`${DEMO.COMMUNICATIONS_TAIGER_MODE_LINK(
                            statedata.student._id.toString()
                        )}`}
                        underline="hover"
                    >
                        <Button
                            color="primary"
                            size="small"
                            startIcon={<MessageIcon />}
                            variant="contained"
                        >
                            <b>{t('Message', { ns: 'common' })}</b>
                        </Button>
                    </Link>
                ) : null}
            </Box>
            {sheetName === 'General' ? (
                <GeneralCourseAnalysisComponent
                    onProgramSelect={handleProgramSelect}
                    sheets={statedata.sheets}
                    student={statedata.student}
                />
            ) : null}
            {sheetName !== 'General' ? (
                <CourseAnalysisComponent
                    currentProgram={value}
                    factor={statedata.factor}
                    onBackToOverview={handleBackToOverview}
                    onProgramChange={handleProgramChange}
                    programs={statedata.sheetNames.filter(
                        (name) => name !== 'General'
                    )}
                    sheet={statedata.sheets?.[sheetName]}
                    student={statedata.student}
                />
            ) : null}
            {t('Last update', { ns: 'common' })}{' '}
            {convertDate(statedata.timestamp)}
        </Box>
    );
}
