import React, { useMemo, useState } from 'react';
import { Tabs, Tab, Box, Typography, Link, Tooltip, Chip } from '@mui/material';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link as LinkDom } from 'react-router-dom';
import { is_TaiGer_Student } from '@taiger-common/core';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { c1_mrt, ATTRIBUTES, COLORS } from '../../utils/contants';
import DEMO from '../../store/constant';
import { APPROVAL_COUNTRIES } from '../Utils/checking-functions';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import Banner from '../../components/Banner/Banner';
import { CustomTabPanel, a11yProps } from '../../components/Tabs';
import ExampleWithLocalizationProvider from '../../components/MaterialReactTable';

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
};

const CVMLRLDashboard = (props) => {
    const { t } = useTranslation();
    const { user } = props;
    // Create columns with essay difficulty indicator
    const memoizedColumnsMrt = useMemo(() => {
        return c1_mrt.map((col) => {
            if (col.accessorKey === 'document_name') {
                return {
                    ...col,
                    Cell: (params) => {
                        const { row } = params;
                        const linkUrl = `${DEMO.DOCUMENT_MODIFICATION_LINK(
                            row.original.thread_id
                        )}`;
                        const isLocked =
                            row.original?.isApplicationLocked === true ||
                            row.original?.isProgramLocked === true;
                        const programCountry =
                            row.original?.country ||
                            (typeof row.original?.program_id === 'object' &&
                            row.original?.program_id?.country
                                ? row.original.program_id.country
                                : null);
                        const isNonApprovalCountry = programCountry
                            ? !APPROVAL_COUNTRIES.includes(
                                  String(programCountry).toLowerCase()
                              )
                            : false;

                        // Check if this is an Essay and get difficulty
                        const isEssay = row.original.file_type === 'Essay';
                        const program =
                            row.original.program || row.original.program_id_obj;
                        const essayDifficulty = program?.essay_difficulty;
                        const isHardEssay =
                            isEssay && essayDifficulty === 'HARD';
                        const isEasyEssay =
                            isEssay &&
                            (essayDifficulty === 'EASY' ||
                                essayDifficulty === undefined);

                        return (
                            <Box>
                                {row.original?.attributes?.map(
                                    (attribute) =>
                                        [1, 3, 9, 10, 11].includes(
                                            attribute.value
                                        ) && (
                                            <Tooltip
                                                key={attribute._id}
                                                title={`${attribute.name}: ${
                                                    ATTRIBUTES[
                                                        attribute.value - 1
                                                    ].definition
                                                }`}
                                            >
                                                <Chip
                                                    color={
                                                        COLORS[attribute.value]
                                                    }
                                                    data-testid={`chip-${attribute.name}`}
                                                    label={attribute.name[0]}
                                                    size="small"
                                                />
                                            </Tooltip>
                                        )
                                )}
                                {/* Essay difficulty indicator (exclude students) */}
                                {!is_TaiGer_Student(user) &&
                                    isEssay &&
                                    (isHardEssay || isEasyEssay) && (
                                        <Tooltip
                                            title={
                                                isHardEssay
                                                    ? t(
                                                          'Hard Essay (above 1000 words, scientific research style)',
                                                          {
                                                              ns: 'common'
                                                          }
                                                      )
                                                    : t(
                                                          'Easy Essay (below 1000 words, non-scientific research style)',
                                                          {
                                                              ns: 'common'
                                                          }
                                                      )
                                            }
                                        >
                                            <Chip
                                                color={
                                                    isHardEssay
                                                        ? 'error'
                                                        : 'success'
                                                }
                                                label={
                                                    isHardEssay
                                                        ? 'HARD'
                                                        : 'EASY'
                                                }
                                                size="small"
                                                sx={{ ml: 0.5, mr: 0.5 }}
                                                variant="outlined"
                                            />
                                        </Tooltip>
                                    )}
                                {isNonApprovalCountry && (
                                    <Tooltip
                                        title={t('Lack of experience country', {
                                            ns: 'common'
                                        })}
                                    >
                                        <WarningAmberIcon
                                            fontSize="small"
                                            sx={{
                                                color: 'warning.main',
                                                ml: 0.5,
                                                mr: 0.5
                                            }}
                                        />
                                    </Tooltip>
                                )}
                                {isLocked ? (
                                    <Tooltip
                                        title={t(
                                            'Program is locked. Contact an agent to unlock this task.',
                                            { ns: 'common' }
                                        )}
                                    >
                                        <Box>
                                            <Link
                                                component={LinkDom}
                                                sx={{
                                                    color: 'text.disabled',
                                                    pointerEvents: 'none'
                                                }}
                                                target="_blank"
                                                title={params.value}
                                                to={linkUrl}
                                                underline="hover"
                                            >
                                                {row.original.file_type}{' '}
                                                {row.original.program_id
                                                    ? ' - ' +
                                                      row.original
                                                          .program_name +
                                                      ' - ' +
                                                      row.original.degree
                                                    : ''}
                                            </Link>
                                            <Typography
                                                color="text.secondary"
                                                sx={{
                                                    display: 'block',
                                                    mt: 0.25
                                                }}
                                                variant="caption"
                                            >
                                                {row.original.school}
                                            </Typography>
                                        </Box>
                                    </Tooltip>
                                ) : (
                                    <>
                                        <Link
                                            component={LinkDom}
                                            target="_blank"
                                            title={params.value}
                                            to={linkUrl}
                                            underline="hover"
                                        >
                                            {row.original.file_type}{' '}
                                            {row.original.program_id
                                                ? ' - ' +
                                                  row.original.program_name +
                                                  ' - ' +
                                                  row.original.degree
                                                : ''}
                                        </Link>
                                        <Typography
                                            color="text.secondary"
                                            sx={{ display: 'block', mt: 0.25 }}
                                            variant="caption"
                                        >
                                            {row.original.school}
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        );
                    }
                };
            }
            return col;
        });
    }, [user, t]);
    const [cVMLRLDashboardState, setCVMLRLDashboardState] = useState({
        error: '',
        data: null,
        SetAsFinalFileModel: false,
        open_tasks_arr: props.open_tasks_arr,
        isFinalVersion: false,
        status: '', //reject, accept... etc
        res_status: 0,
        res_modal_message: '',
        res_modal_status: 0
    });
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const ConfirmError = () => {
        setCVMLRLDashboardState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    const { res_modal_status, res_modal_message } = cVMLRLDashboardState;

    const open_tasks_arr = props.open_tasks_arr;

    const cvmlrl_active_tasks = open_tasks_arr.filter(
        (open_task) =>
            open_task.show &&
            !open_task.isFinalVersion &&
            open_task.latest_message_left_by_id !== '- None - '
    );
    const cvmlrl_idle_tasks = open_tasks_arr.filter(
        (open_task) =>
            open_task.show &&
            !open_task.isFinalVersion &&
            open_task.latest_message_left_by_id === '- None - '
    );

    const cvmlrl_closed_v2 = open_tasks_arr.filter(
        (open_task) => open_task.show && open_task.isFinalVersion
    );

    const cvmlrl_all_v2 = open_tasks_arr.filter((open_task) => open_task.show);

    return (
        <>
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    aria-label="basic tabs example"
                    onChange={handleChange}
                    scrollButtons="auto"
                    value={value}
                    variant="scrollable"
                >
                    <Tab
                        label={`${t('In Progress', { ns: 'common' })} (${
                            cvmlrl_active_tasks?.length || 0
                        })`}
                        {...a11yProps(value, 0)}
                    />
                    <Tab
                        label={`${t('No Input', { ns: 'common' })} (${
                            cvmlrl_idle_tasks?.length || 0
                        })`}
                        {...a11yProps(value, 1)}
                    />
                    <Tab
                        label={`${t('Closed', { ns: 'common' })} (${
                            cvmlrl_closed_v2?.length || 0
                        })`}
                        {...a11yProps(value, 2)}
                    />
                    <Tab
                        label={`${t('All', { ns: 'common' })} (${
                            cvmlrl_all_v2?.length || 0
                        })`}
                        {...a11yProps(value, 2)}
                    />
                </Tabs>
            </Box>
            <CustomTabPanel index={0} value={value}>
                <Banner
                    ReadOnlyMode={true}
                    bg="primary"
                    link_name=""
                    notification_key={undefined}
                    path="/"
                    removeBanner={null}
                    text="Received students inputs and Active Tasks. Be aware of the deadline!"
                    title="warning"
                />
                <ExampleWithLocalizationProvider
                    col={memoizedColumnsMrt}
                    data={cvmlrl_active_tasks}
                />
            </CustomTabPanel>
            <CustomTabPanel index={1} value={value}>
                <Banner
                    ReadOnlyMode={true}
                    bg="info"
                    link_name=""
                    notification_key={undefined}
                    path="/"
                    removeBanner={null}
                    text="No student inputs tasks. Agents should push students"
                    title="info"
                />
                <ExampleWithLocalizationProvider
                    col={memoizedColumnsMrt}
                    data={cvmlrl_idle_tasks}
                />
            </CustomTabPanel>
            <CustomTabPanel index={2} value={value}>
                <Banner
                    ReadOnlyMode={true}
                    bg="success"
                    link_name=""
                    notification_key={undefined}
                    path="/"
                    removeBanner={null}
                    text="These tasks are closed"
                    title="success"
                />
                <Typography sx={{ p: 2 }}>
                    {t(
                        'Note: if the documents are not closed but locate here, it is because the applications are already submitted. The documents can safely closed eventually.',
                        { ns: 'cvmlrl' }
                    )}
                </Typography>
                <ExampleWithLocalizationProvider
                    col={memoizedColumnsMrt}
                    data={cvmlrl_closed_v2}
                />
            </CustomTabPanel>
            <CustomTabPanel index={3} value={value}>
                <Banner
                    ReadOnlyMode={true}
                    bg="success"
                    link_name=""
                    notification_key={undefined}
                    path="/"
                    removeBanner={null}
                    text="All tasks"
                    title="info"
                />
                <ExampleWithLocalizationProvider
                    col={memoizedColumnsMrt}
                    data={cvmlrl_all_v2}
                />
            </CustomTabPanel>
        </>
    );
};

export default CVMLRLDashboard;
