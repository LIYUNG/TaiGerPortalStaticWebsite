import React, { useState, useEffect } from 'react';
import {
    Badge,
    Box,
    Breadcrumbs,
    Button,
    Card,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    Grid,
    Link,
    List,
    ListItem,
    Tab,
    TableContainer,
    Tabs,
    Typography,
    useTheme
} from '@mui/material';
import { DataSheetGrid, keyColumn, textColumn } from 'react-datasheet-grid';
import { Navigate, Link as LinkDom, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MessageIcon from '@mui/icons-material/Message';

// import 'react-datasheet-grid/dist/style.css';
import './react-datasheet-customize.css';

import { convertDate } from '@utils/contants';
import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import {
    is_TaiGer_AdminAgent,
    is_TaiGer_Guest,
    is_TaiGer_role
} from '@taiger-common/core';

import { getMycourses, putMycourses, transcriptanalyser_testV2 } from '@api';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@api/client';
import { getMycoursesQuery } from '@api/query';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { appConfig } from '../../config';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { TopBar } from '@components/TopBar/TopBar';
import { a11yProps, CustomTabPanel } from '@components/Tabs';
import { ProgramRequirementsTableWrapper } from './ProgramRequirementsTableWrapper';
import i18next from 'i18next';
import { useSnackBar } from '@contexts/use-snack-bar';

export default function MyCourses() {
    const { student_id } = useParams();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [value, setValue] = useState(0);
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();

    const theme = useTheme(); // Get the current theme from Material UI

    const [statedata, setStatedata] = useState({
        error: '',
        isLoaded: false,
        coursesdata: {},
        table_data_string_locked: false,
        coursesdata_taiger_guided: [
            {
                course_chinese: '',
                course_english: '',
                credits: '',
                grades: ''
            }
        ],
        analysis: {},
        success: false,
        student: null,
        file: '',
        analysis_language: '',
        analyzed_course: '',
        expand: true,
        isAnalysing: false,
        isUpdating: false,
        isDownloading: false,
        res_status: 0,
        res_modal_status: 0,
        res_modal_message: ''
    });

    useEffect(() => {
        const studentId = student_id || user._id.toString();
        //TODO: what if student_id not found : handle status 500
        getMycourses(studentId).then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success) {
                    const course_from_database = data.table_data_string
                        ? JSON.parse(data.table_data_string)
                        : {};
                    const course_taiger_guided_from_database =
                        data.table_data_string_taiger_guided
                            ? JSON.parse(data.table_data_string_taiger_guided)
                            : {};
                    setStatedata((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        updatedAt: data.updatedAt,
                        coursesdata: course_from_database,
                        table_data_string_locked: data.table_data_string_locked,
                        coursesdata_taiger_guided:
                            course_taiger_guided_from_database,
                        analysis: data.analysis,
                        student: data.student_id, // populated
                        success: success,
                        res_status: status
                    }));
                } else {
                    setStatedata((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_status: status
                    }));
                }
            },
            (error) => {
                setStatedata((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_status: 500
                }));
            }
        );
    }, []);

    const handleChangeValue = (event, newValue) => {
        setValue(newValue);
    };

    const onChange = (new_data) => {
        setStatedata((prevState) => ({
            ...prevState,
            coursesdata: new_data
        }));
    };

    const onChange_ReadOnly = () => {
        setStatedata((prevState) => ({
            ...prevState,
            res_modal_status: 423,
            res_modal_message: (
                <>
                    <Typography>
                        <b>表格一</b>已鎖，請更新新的課程至<b>表格二</b>
                    </Typography>
                    <Typography>
                        This table is locked. Please update new courses in{' '}
                        <b>Table 2</b>
                    </Typography>
                </>
            )
        }));
    };

    const onChange_taiger_guided = (new_data) => {
        setStatedata((prevState) => ({
            ...prevState,
            coursesdata_taiger_guided: new_data
        }));
    };

    const { mutate: mutateLockTable } = useMutation({
        mutationFn: ({ studentId, table_data_string_locked }) =>
            putMycourses(studentId, { table_data_string_locked }),
        onSuccess: (resp, variables) => {
            setSeverity('success');
            setMessage(i18next.t('Locked updated successfully!'));
            setOpenSnackbar(true);
            setStatedata((prevState) => ({
                ...prevState,
                table_data_string_locked: variables.table_data_string_locked
            }));
            queryClient.invalidateQueries({
                queryKey: getMycoursesQuery(variables.studentId).queryKey
            });
        },
        onError: (error) => {
            setSeverity('error');
            setMessage(
                error.message || 'Locked Update failed. Please try it later.'
            );
            setOpenSnackbar(true);
        }
    });

    const handleLockTable = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const table_data_string_locked_temp =
            statedata.table_data_string_locked;
        mutateLockTable({
            studentId: statedata.student._id.toString(),
            table_data_string_locked: !table_data_string_locked_temp
        });
    };

    const { mutate: mutateSubmit, isPending: isSubmitting } = useMutation({
        mutationFn: ({
            studentId,
            student,
            coursesdata_string,
            coursesdata_taiger_guided_string
        }) =>
            putMycourses(studentId, {
                student_id: studentId,
                name: student.firstname,
                table_data_string: coursesdata_string,
                table_data_string_taiger_guided:
                    coursesdata_taiger_guided_string
            }),
        onSuccess: (resp, variables) => {
            const { data, success } = resp.data;
            const { status } = resp;
            const course_from_database = JSON.parse(data.table_data_string);
            setStatedata((prevState) => ({
                ...prevState,
                isLoaded: true,
                updatedAt: data.updatedAt,
                coursesdata: course_from_database,
                success: success,
                res_modal_status: status
            }));
            queryClient.invalidateQueries({
                queryKey: getMycoursesQuery(variables.studentId).queryKey
            });
            setSeverity('success');
            setMessage(i18next.t('Course updated successfully!'));
            setOpenSnackbar(true);
        },
        onError: (error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
        }
    });

    const onSubmit = () => {
        const coursesdata_string = JSON.stringify(statedata.coursesdata);
        const coursesdata_taiger_guided_string = JSON.stringify(
            statedata.coursesdata_taiger_guided
        );
        mutateSubmit({
            studentId: statedata.student._id.toString(),
            student: statedata.student,
            coursesdata_string,
            coursesdata_taiger_guided_string
        });
    };

    const ConfirmError = () => {
        setStatedata((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    const onAnalyseV2 = async (requirementIds, lang, factor) => {
        try {
            const response = await transcriptanalyser_testV2({
                language: lang,
                studentId: statedata.student._id.toString(),
                requirementIds,
                factor
            });
            const { data, success } = response.data;
            const { status } = response;

            if (success) {
                setSeverity('success');
                setMessage(i18next.t('Transcript analysed successfully!'));
                setOpenSnackbar(true);
                setStatedata((prevState) => ({
                    ...prevState,
                    analysis: data,
                    success: success,
                    res_modal_status: status
                }));
            } else {
                setStatedata((prevState) => ({
                    ...prevState,
                    res_modal_status: status,
                    res_modal_message:
                        'Make sure that you updated your courses and select the right target group and language!'
                }));
            }
        } catch (error) {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
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
        {
            ...keyColumn('grades', textColumn),
            title: 'Grades'
        }
    ];

    if (!statedata.isLoaded) {
        return <Loading />;
    }
    if (!student_id) {
        if (is_TaiGer_role(user)) {
            return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
        }
    }

    if (statedata.res_status >= 400) {
        return <ErrorPage res_status={statedata.res_status} />;
    }
    TabTitle(
        `Student ${statedata.student.firstname} - ${statedata.student.lastname} || Courses List`
    );

    return (
        <Box data-testid="student_course_view">
            {statedata.res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={statedata.res_modal_message}
                    res_modal_status={statedata.res_modal_status}
                />
            ) : null}
            {statedata.student.archiv ? (
                <Box className="sticky-top">
                    <TopBar />
                </Box>
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
                {is_TaiGer_role(user) ? (
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                            statedata.student._id.toString(),
                            DEMO.PROFILE_HASH
                        )}`}
                        underline="hover"
                    >
                        {statedata.student.firstname}{' '}
                        {statedata.student.lastname}
                    </Link>
                ) : null}
                <Typography color="text.primary">
                    {t('My Courses', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            {/* <Card sx={{ mt: 2, padding: 2, minWidth: '450px' }}> */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ pt: 2 }} variant="h6">
                    請把大學及碩士成績單 上面出現的所有課程填入這個表單內
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

            <Box>
                <Typography variant="h6">
                    Please fill{' '}
                    <b>all your courses in the Bachelor&apos;s study</b> in this
                    table
                </Typography>
                <List>
                    <ListItem>
                        <Typography variant="body1">
                            若您仍是高中生、申請大學部者，請忽略此表格
                        </Typography>
                    </ListItem>
                    <ListItem>
                        <Typography variant="body1">
                            若有交換，請填入交換時的修過的課
                        </Typography>
                    </ListItem>
                    <ListItem>
                        <Typography variant="body1">
                            若有在大學部時期修過的碩士課程也可以放上去
                        </Typography>
                    </ListItem>
                    <ListItem>
                        <Typography variant="body1">
                            若有同名課程(如微積分一、微積分二)，請各自獨立一行，不能自行疊加在一行
                        </Typography>
                    </ListItem>
                    <ListItem>
                        <Typography variant="body1">
                            若你已就讀碩士或仍然是碩士班在學，請將碩士班課程標記&quot;碩士&quot;在，Grades那行。
                        </Typography>
                    </ListItem>
                    <ListItem>
                        <Typography variant="body1">
                            若目前尚未畢業，請每學期選完課確定下學課表後更新這個表單
                        </Typography>
                    </ListItem>
                </List>
            </Box>
            <Typography variant="h6">
                <b>表格一</b>：請放 {appConfig.companyName} 服務開始<b>前</b>
                已經修過的課程
            </Typography>
            <Typography sx={{ my: 1 }}>
                您只需在 {appConfig.companyName} 服務開始初期更新一次
                <b>表格一</b>
                ，往後新的學期，新課程請更新在
                <b>表格二</b>
            </Typography>
            <Typography sx={{ mb: 1 }}>
                若您已畢業，只需更新<b>表格一</b>即可。
            </Typography>
            <TableContainer style={{ overflowX: 'auto' }}>
                <DataSheetGrid
                    autoAddRow={true}
                    columns={columns}
                    disableContextMenu={false}
                    disableExpandSelection={false}
                    headerRowHeight={30}
                    height={6000}
                    id={1}
                    onChange={
                        statedata.table_data_string_locked
                            ? onChange_ReadOnly
                            : onChange
                    }
                    rowHeight={25}
                    style={{
                        minWidth: '450px',
                        '--dsg-selection-border-color':
                            theme.palette.text.primary,
                        '--dsg-cell-color': theme.palette.text.primary,
                        '--dsg-cell-background-color':
                            theme.palette.background.default,
                        '--dsg-header-text-color': theme.palette.text.primary,
                        '--dsg-header-active-text-color':
                            theme.palette.text.primary
                    }}
                    value={statedata.coursesdata}
                />
            </TableContainer>
            <Card
                sx={{
                    mt: 2,
                    color: theme.palette.primary.contrastText,
                    backgroundColor: theme.palette.primary.main
                }}
            >
                <Typography sx={{ p: 2 }} variant="h6">
                    <b>表格二</b>：請放 {appConfig.companyName} 服務開始
                    <b>後</b>
                    所選的修課程
                </Typography>
                <Typography sx={{ px: 2, pb: 2 }}>
                    如此一來顧問才能了解哪些課程是 {appConfig.companyName}
                    服務開始後要求修的課程。到畢業前所有新修的課程， 只需更新
                    <b>表格二</b>。
                </Typography>
                <TableContainer style={{ overflowX: 'auto' }}>
                    <DataSheetGrid
                        autoAddRow={true}
                        columns={columns}
                        disableContextMenu={true}
                        disableExpandSelection={false}
                        headerRowHeight={30}
                        height={6000}
                        id={2}
                        onChange={onChange_taiger_guided}
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
                        value={statedata.coursesdata_taiger_guided}
                    />
                </TableContainer>
            </Card>
            {is_TaiGer_AdminAgent(user) ? (
                <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={statedata.table_data_string_locked}
                                onChange={(e) => handleLockTable(e)}
                                value="is locked"
                            />
                        }
                        label="Lock Table 1 preventing student modifying it."
                    />
                </Box>
            ) : null}
            <Typography sx={{ my: 2 }} variant="body2">
                {t('Last update', { ns: 'common' })}&nbsp;
                {convertDate(statedata.updatedAt)}
            </Typography>
            <Button
                color="primary"
                disabled={statedata.isUpdating || isSubmitting}
                onClick={onSubmit}
                size="small"
                startIcon={
                    statedata.isUpdating || isSubmitting ? (
                        <CircularProgress size={20} />
                    ) : null
                }
                sx={{ mb: 2 }}
                variant="contained"
            >
                {statedata.isUpdating || isSubmitting
                    ? t('Updating', { ns: 'common' })
                    : t('Update', { ns: 'common' })}
            </Button>
            <Typography variant="body2">
                {t(
                    'After you updated the course table, please contact your agent for your course analysis.',
                    { ns: 'courses' }
                )}
            </Typography>
            {is_TaiGer_Guest(user) ? (
                <Card sx={{ mt: 2 }}>
                    <Typography>
                        Do you want to see result? Contact our consultant!
                    </Typography>
                    <br />
                </Card>
            ) : null}

            <Card sx={{ mt: 2, p: 2 }}>
                {is_TaiGer_AdminAgent(user) ? (
                    <>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs
                                aria-label="basic tabs example"
                                onChange={handleChangeValue}
                                scrollButtons="auto"
                                value={value}
                                variant="scrollable"
                            >
                                {/* <Tab label="Default" {...a11yProps(value, 0)} /> */}
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
                            <Typography variant="h5">
                                Attention: This is <b>IN</b> production BUT
                                student WILL NOT be informed. Please share the
                                analysed page URL link to the student.
                            </Typography>
                            <ProgramRequirementsTableWrapper
                                onAnalyseV2={onAnalyseV2}
                            />
                        </CustomTabPanel>
                    </>
                ) : null}
                {value === 0 ? (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                {t('Courses Analysis', { ns: 'courses' })}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            {statedata.analysis &&
                            statedata.analysis.isAnalysedV2 ? (
                                <>
                                    <Typography>
                                        {/* <Button
                                            color="primary"
                                            disabled={statedata.isDownloading}
                                            onClick={onDownload}
                                            size="small"
                                            startIcon={<DownloadIcon />}
                                            sx={{ marginRight: 2 }}
                                            variant="contained"
                                        >
                                            {t('Download', { ns: 'common' })}
                                        </Button> */}
                                        <LinkDom
                                            target="_blank"
                                            to={`${DEMO.COURSES_ANALYSIS_RESULT_V2_LINK(
                                                statedata.student._id.toString()
                                            )}`}
                                        >
                                            <Button
                                                color="secondary"
                                                size="small"
                                                variant="contained"
                                            >
                                                {t('View Online', {
                                                    ns: 'courses'
                                                })}
                                            </Button>
                                        </LinkDom>
                                    </Typography>
                                    <Typography sx={{ mt: 2 }}>
                                        {t('Last analysis at', {
                                            ns: 'courses'
                                        })}
                                        :{' '}
                                        {statedata.analysis
                                            ? convertDate(
                                                  statedata.analysis.updatedAtV2
                                              )
                                            : ''}
                                    </Typography>
                                </>
                            ) : (
                                <Typography>
                                    {t('No analysis yet', { ns: 'courses' })}
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                ) : null}
            </Card>
        </Box>
    );
}
