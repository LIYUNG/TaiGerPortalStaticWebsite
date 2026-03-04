import React, { type MouseEvent } from 'react';
import {
    Box,
    Button,
    Card,
    MenuItem,
    Select,
    TextField,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Stack,
    Popover,
    IconButton
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import LinkIcon from '@mui/icons-material/Link';
import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bayerische_Formel, is_TaiGer_Admin } from '@taiger-common/core';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

import {
    BACHELOR_GRADUATE_STATUS_OPTIONS,
    DUAL_STATE_OPTIONS,
    ENGLISH_CERTIFICATE_ARRAY_OPTIONS,
    GERMAN_CERTIFICATE_ARRAY_OPTIONS,
    GMAT_CERTIFICATE_OPTIONS,
    GRE_CERTIFICATE_ARRAY_OPTIONS,
    HIG_SCHOOL_TRI_STATE_OPTIONS,
    IS_PASSED_OPTIONS,
    convertDate
} from '@utils/contants';
import type { IUser } from '@taiger-common/model';
import { APPLICATION_YEARS_FUTURE } from '@utils/contants';
import Banner from '@components/Banner/Banner';
import { useAuth } from '@components/AuthProvider';
import type { SurveyStateActions } from '@components/SurveyProvider/useSurveyState';
import { grey } from '@mui/material/colors';

import { useSurveyEditableLocalState } from './hooks/useSurveyEditableLocalState';
import SurveyMissingFieldsAlerts from './components/SurveyMissingFieldsAlerts';
import SurveyDocLinkEditDialog from './components/SurveyDocLinkEditDialog';
import SurveyApplicationPreferenceCard from './components/SurveyApplicationPreferenceCard';

export interface SurveyEditableComponentProps extends SurveyStateActions {
    docName?: string;
}

const SurveyEditableComponent = (props: SurveyEditableComponentProps) => {
    const {
        survey,
        handleChangeAcademic,
        handleTestDate,
        handleChangeLanguage,
        handleChangeApplicationPreference,
        setApplicationPreferenceByField,
        handleAcademicBackgroundSubmit,
        handleSurveyLanguageSubmit,
        handleApplicationPreferenceSubmit,
        updateDocLink,
        onChangeURL
    } = props;
    const { user } = useAuth();
    const { t } = useTranslation();
    const localState = useSurveyEditableLocalState();
    const {
        baseDocsflagOffcanvas,
        baseDocsflagOffcanvasButtonDisable,
        anchorEl,
        closeOffcanvasWindow,
        openOffcanvasWindow,
        openPopover,
        handleClosePopover: handleClose,
        handleRowClick
    } = localState;

    const handleUpdateDocLink = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault();
        localState.setOffcanvasSaving(true);
        updateDocLink(survey.survey_link ?? '', 'Grading_System');
        localState.setOffcanvasSaving(false);
    };

    return (
        <Box>
            <SurveyMissingFieldsAlerts survey={survey} t={t} />
            <Box>
                <Card sx={{ mt: 2, padding: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                {t('Academic Background Survey')}
                            </Typography>
                            <Typography variant="body1">
                                {t('High School')}
                            </Typography>
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            <TextField
                                error={
                                    survey.academic_background?.university
                                        ?.attended_high_school === ''
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.university
                                        ?.attended_high_school === ''
                                        ? 'Please provide High school name'
                                        : null
                                }
                                id="attended_high_school"
                                label={t('High School Name (English)')}
                                name="attended_high_school"
                                onChange={(e) => handleChangeAcademic(e)}
                                placeholder="Taipei First Girls' High School"
                                value={
                                    survey.academic_background?.university
                                        ?.attended_high_school || ''
                                }
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            <TextField
                                error={
                                    survey.academic_background?.university
                                        ?.high_school_isGraduated === '-'
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.university
                                        ?.high_school_isGraduated === '-'
                                        ? 'Please provide High school graduation info'
                                        : null
                                }
                                id="high_school_isGraduated"
                                label={t('High School already graduated')}
                                name="high_school_isGraduated"
                                onChange={(e) => handleChangeAcademic(e)}
                                select
                                value={
                                    survey.academic_background?.university
                                        ?.high_school_isGraduated || '-'
                                }
                            >
                                {HIG_SCHOOL_TRI_STATE_OPTIONS.map((option) => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {t(option.label, { ns: 'common' })}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            {survey.academic_background?.university
                                ?.high_school_isGraduated !== '-' ? (
                                <>
                                    <TextField
                                        fullWidth
                                        id="high_school_graduated_year"
                                        label={`${
                                            survey.academic_background
                                                ?.university
                                                ?.high_school_isGraduated ===
                                            'Yes'
                                                ? t('High School Graduate Year')
                                                : survey.academic_background
                                                        ?.university
                                                        ?.high_school_isGraduated ===
                                                    'No'
                                                  ? t(
                                                        'High School Graduate leaved Year'
                                                    )
                                                  : survey.academic_background
                                                        ?.university
                                                        ?.high_school_isGraduated ===
                                                        'pending' &&
                                                    t(
                                                        'Expected High School Graduate Year'
                                                    )
                                        }`}
                                        name="high_school_graduated_year"
                                        onChange={(e) =>
                                            handleChangeAcademic(e)
                                        }
                                        placeholder="2016"
                                        value={
                                            survey.academic_background
                                                ?.university
                                                ?.high_school_graduated_year
                                                ? survey.academic_background
                                                      .university
                                                      .high_school_graduated_year
                                                : ''
                                        }
                                        variant="outlined"
                                    />
                                    <br />
                                </>
                            ) : null}
                        </Grid>
                        <Grid item sm={6} xs={12} />
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography sx={{ mt: 2 }} variant="body1">
                                {t('University (Bachelor degree)', {
                                    ns: 'survey'
                                })}
                            </Typography>
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            <TextField
                                error={
                                    survey.academic_background?.university
                                        ?.isGraduated === '-'
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.university
                                        ?.isGraduated === '-'
                                        ? 'Please provide Bachelor info.'
                                        : null
                                }
                                id="isGraduated"
                                label={t('Already Bachelor graduated ?')}
                                name="isGraduated"
                                onChange={(e) => handleChangeAcademic(e)}
                                select
                                value={
                                    survey.academic_background?.university
                                        ?.isGraduated || '-'
                                }
                            >
                                {BACHELOR_GRADUATE_STATUS_OPTIONS.map(
                                    (option) => (
                                        <MenuItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    )
                                )}
                            </TextField>
                        </Grid>
                        {['Yes', 'pending'].includes(
                            survey.academic_background?.university
                                ?.isGraduated as string
                        ) ? (
                            <>
                                <Grid item sm={6} xs={12}>
                                    <TextField
                                        error={
                                            survey.academic_background
                                                ?.university
                                                ?.attended_university === ''
                                        }
                                        fullWidth
                                        helperText={
                                            survey.academic_background
                                                ?.university
                                                ?.attended_university === ''
                                                ? 'Please provide University name info.'
                                                : null
                                        }
                                        id="attended_university"
                                        label={t(
                                            'University Name (Bachelor degree)'
                                        )}
                                        name="attended_university"
                                        onChange={(e) =>
                                            handleChangeAcademic(e)
                                        }
                                        placeholder="National Yilan University"
                                        value={
                                            survey.academic_background
                                                ?.university
                                                ?.attended_university || ''
                                        }
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item sm={6} xs={12}>
                                    <TextField
                                        error={
                                            survey.academic_background
                                                ?.university
                                                ?.attended_university_program ===
                                            ''
                                        }
                                        fullWidth
                                        helperText={
                                            survey.academic_background
                                                ?.university
                                                ?.attended_university_program ===
                                            ''
                                                ? 'Please provide program name info.'
                                                : null
                                        }
                                        id="attended_university_program"
                                        label={t('Program Name')}
                                        name="attended_university_program"
                                        onChange={(e) =>
                                            handleChangeAcademic(e)
                                        }
                                        placeholder="B.Sc. Electrical Engineering"
                                        value={
                                            survey.academic_background
                                                ?.university
                                                ?.attended_university_program ||
                                            ''
                                        }
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item sm={6} xs={12}>
                                    {survey.academic_background?.university
                                        ?.isGraduated !== '-' &&
                                    survey.academic_background?.university
                                        ?.isGraduated !== 'No' ? (
                                        <TextField
                                            error={
                                                survey.academic_background
                                                    ?.university
                                                    ?.expected_grad_date === '-'
                                            }
                                            fullWidth
                                            helperText={
                                                survey.academic_background
                                                    ?.university
                                                    ?.expected_grad_date === '-'
                                                    ? 'Please provide graduate date info.'
                                                    : null
                                            }
                                            id="expected_grad_date"
                                            label={`${
                                                survey?.academic_background
                                                    ?.university
                                                    ?.isGraduated === 'No'
                                                    ? t('Leaved Year')
                                                    : survey
                                                            ?.academic_background
                                                            ?.university
                                                            ?.isGraduated ===
                                                        'Yes'
                                                      ? t('Graduated Year')
                                                      : t(
                                                            'Expected Graduate Year'
                                                        )
                                            }`}
                                            name="expected_grad_date"
                                            onChange={(e) =>
                                                handleChangeAcademic(e)
                                            }
                                            select
                                            value={
                                                survey.academic_background
                                                    ?.university
                                                    ?.expected_grad_date || '-'
                                            }
                                        >
                                            {APPLICATION_YEARS_FUTURE().map(
                                                (option) => (
                                                    <MenuItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </MenuItem>
                                                )
                                            )}
                                        </TextField>
                                    ) : null}
                                </Grid>
                                <Grid item sm={6} xs={12}>
                                    <TextField
                                        error={
                                            survey.academic_background
                                                ?.university
                                                ?.Has_Exchange_Experience ===
                                            '-'
                                        }
                                        fullWidth
                                        helperText={
                                            survey.academic_background
                                                ?.university
                                                ?.Has_Exchange_Experience ===
                                            '-'
                                                ? 'Please provide university exchange student info.'
                                                : null
                                        }
                                        id="Has_Exchange_Experience"
                                        label={t(
                                            'Exchange Student Experience ?'
                                        )}
                                        name="Has_Exchange_Experience"
                                        onChange={(e) =>
                                            handleChangeAcademic(e)
                                        }
                                        select
                                        value={
                                            survey.academic_background
                                                ?.university
                                                ?.Has_Exchange_Experience || '-'
                                        }
                                    >
                                        {DUAL_STATE_OPTIONS.map((option) => (
                                            <MenuItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item sm={6} xs={12}>
                                    <TextField
                                        defaultValue={
                                            survey.academic_background
                                                ?.university?.Highest_GPA_Uni ||
                                            0
                                        }
                                        error={
                                            survey.academic_background
                                                ?.university
                                                ?.Highest_GPA_Uni === '0' ||
                                            survey.academic_background
                                                ?.university
                                                ?.Highest_GPA_Uni === null
                                        }
                                        fullWidth
                                        helperText={
                                            survey.academic_background
                                                ?.university
                                                ?.Highest_GPA_Uni === '0' ||
                                            survey.academic_background
                                                ?.university
                                                ?.Highest_GPA_Uni === null
                                                ? 'Please provide highest GPA from your university.'
                                                : null
                                        }
                                        id="Highest_GPA_Uni"
                                        label={t(
                                            'Highest Score GPA of your university program'
                                        )}
                                        name="Highest_GPA_Uni"
                                        onChange={(e) =>
                                            handleChangeAcademic(e)
                                        }
                                        placeholder="4.3"
                                        type="number"
                                    />
                                </Grid>
                                <Grid item sm={6} xs={12}>
                                    <TextField
                                        defaultValue={
                                            survey.academic_background
                                                ?.university?.Passing_GPA_Uni ||
                                            0
                                        }
                                        error={
                                            survey.academic_background
                                                ?.university
                                                ?.Passing_GPA_Uni === '0' ||
                                            survey.academic_background
                                                ?.university
                                                ?.Passing_GPA_Uni === null
                                        }
                                        fullWidth
                                        helperText={
                                            survey.academic_background
                                                ?.university
                                                ?.Passing_GPA_Uni === '0' ||
                                            survey.academic_background
                                                ?.university
                                                ?.Passing_GPA_Uni === null
                                                ? 'Please provide passing GPA from your university.'
                                                : null
                                        }
                                        id="Passing_GPA_Uni"
                                        label={t(
                                            'Passing Score GPA of your university program'
                                        )}
                                        name="Passing_GPA_Uni"
                                        onChange={(e) =>
                                            handleChangeAcademic(e)
                                        }
                                        placeholder="1.7"
                                        type="number"
                                    />
                                </Grid>
                                <Grid item sm={6} xs={12}>
                                    <TextField
                                        defaultValue={
                                            survey.academic_background
                                                ?.university?.My_GPA_Uni || 0
                                        }
                                        error={
                                            survey.academic_background
                                                ?.university?.My_GPA_Uni ===
                                                '0' ||
                                            survey.academic_background
                                                ?.university?.My_GPA_Uni ===
                                                null
                                        }
                                        fullWidth
                                        helperText={
                                            survey.academic_background
                                                ?.university?.My_GPA_Uni ===
                                                '0' ||
                                            survey.academic_background
                                                ?.university?.My_GPA_Uni ===
                                                null
                                                ? 'Please provide passing GPA from your university.'
                                                : null
                                        }
                                        id="My_GPA_Uni"
                                        label={t('My GPA')}
                                        name="My_GPA_Uni"
                                        onChange={(e) =>
                                            handleChangeAcademic(e)
                                        }
                                        placeholder="3.7"
                                        type="number"
                                    />
                                </Grid>
                            </>
                        ) : null}
                        <Grid item sm={6} xs={12}>
                            <Stack
                                direction="row"
                                justifyContent="flex-start"
                                spacing={1}
                            >
                                <Typography>
                                    {t('Corresponding German GPA System')}:{' '}
                                </Typography>
                                <Typography>
                                    {survey.academic_background?.university
                                        ?.My_GPA_Uni &&
                                    survey.academic_background?.university
                                        ?.Passing_GPA_Uni &&
                                    survey.academic_background?.university
                                        ?.Highest_GPA_Uni ? (
                                        <b>
                                            {Bayerische_Formel(
                                                survey.academic_background
                                                    ?.university
                                                    ?.Highest_GPA_Uni as number,
                                                survey.academic_background
                                                    ?.university
                                                    ?.Passing_GPA_Uni as number,
                                                survey.academic_background
                                                    ?.university
                                                    ?.My_GPA_Uni as number
                                            )}
                                        </b>
                                    ) : (
                                        0
                                    )}
                                </Typography>
                                <HelpIcon
                                    onClick={
                                        handleRowClick as unknown as React.MouseEventHandler<SVGSVGElement>
                                    }
                                    style={{ color: grey[400] }}
                                />
                                <Popover
                                    anchorEl={anchorEl}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left'
                                    }}
                                    onClose={handleClose}
                                    open={openPopover}
                                >
                                    <Typography sx={{ m: 2 }}>
                                        <b>
                                            {Bayerische_Formel(
                                                (survey.academic_background
                                                    ?.university
                                                    ?.Highest_GPA_Uni as number) ??
                                                    0,
                                                (survey.academic_background
                                                    ?.university
                                                    ?.Passing_GPA_Uni as number) ??
                                                    0,
                                                (survey.academic_background
                                                    ?.university
                                                    ?.My_GPA_Uni as number) ?? 0
                                            )}
                                        </b>{' '}
                                        = 1 + (3 * (highest - my)) / (highest -
                                        passing) = 1 + (3 * (
                                        {
                                            survey.academic_background
                                                ?.university
                                                ?.Highest_GPA_Uni as string
                                        }{' '}
                                        -{' '}
                                        {
                                            survey.academic_background
                                                ?.university
                                                ?.My_GPA_Uni as string
                                        }
                                        )) / (
                                        {
                                            survey.academic_background
                                                ?.university
                                                ?.Highest_GPA_Uni as string
                                        }{' '}
                                        -{' '}
                                        {
                                            survey.academic_background
                                                ?.university
                                                ?.Passing_GPA_Uni as string
                                        }
                                        )
                                    </Typography>
                                </Popover>
                            </Stack>
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            <Stack
                                alignItems="center"
                                direction="row"
                                spacing={1}
                            >
                                <Typography variant="body1">
                                    {t('gpa-instructions')}
                                </Typography>
                                <IconButton
                                    component={LinkDom}
                                    rel="noopener noreferrer"
                                    size="small"
                                    target="_blank"
                                    to={
                                        survey.survey_link &&
                                        survey.survey_link != ''
                                            ? survey.survey_link
                                            : '/'
                                    }
                                >
                                    <LinkIcon fontSize="small" />
                                </IconButton>
                                {user && is_TaiGer_Admin(user as IUser) ? (
                                    <Button
                                        onClick={openOffcanvasWindow}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {t('Edit', { ns: 'common' })}
                                    </Button>
                                ) : null}
                            </Stack>
                        </Grid>
                        {['Yes'].includes(
                            survey.academic_background?.university
                                ?.isGraduated as string
                        ) ? (
                            <>
                                <Grid item xs={12}>
                                    <Typography sx={{ mt: 2 }} variant="body1">
                                        {t(
                                            'Second degree (Another Bachelor or Master)',
                                            {
                                                ns: 'survey'
                                            }
                                        )}
                                    </Typography>
                                </Grid>
                                <Grid item sm={6} xs={12}>
                                    <TextField
                                        error={
                                            survey.academic_background
                                                ?.university
                                                ?.isSecondGraduated === '-'
                                        }
                                        fullWidth
                                        helperText={
                                            survey.academic_background
                                                ?.university
                                                ?.isSecondGraduated === '-'
                                                ? 'Please provide Second Degree info.'
                                                : null
                                        }
                                        id="isSecondGraduated"
                                        label={t(
                                            'Already Second Degree graduated ?'
                                        )}
                                        name="isSecondGraduated"
                                        onChange={(e) =>
                                            handleChangeAcademic(e)
                                        }
                                        select
                                        value={
                                            survey.academic_background
                                                ?.university
                                                ?.isSecondGraduated || '-'
                                        }
                                    >
                                        {BACHELOR_GRADUATE_STATUS_OPTIONS.map(
                                            (option) => (
                                                <MenuItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </MenuItem>
                                            )
                                        )}
                                    </TextField>
                                </Grid>
                                {['Yes', 'pending'].includes(
                                    survey.academic_background?.university
                                        ?.isSecondGraduated as string
                                ) ? (
                                    <>
                                        <Grid item sm={6} xs={12}>
                                            <TextField
                                                error={
                                                    survey.academic_background
                                                        ?.university
                                                        ?.attendedSecondDegreeUniversity ===
                                                    ''
                                                }
                                                fullWidth
                                                helperText={
                                                    survey.academic_background
                                                        ?.university
                                                        ?.attendedSecondDegreeUniversity ===
                                                    ''
                                                        ? 'Please provide University name info.'
                                                        : null
                                                }
                                                id="attendedSecondDegreeUniversity"
                                                label={t('University Name')}
                                                name="attendedSecondDegreeUniversity"
                                                onChange={(e) =>
                                                    handleChangeAcademic(e)
                                                }
                                                placeholder="National Taipei University"
                                                value={
                                                    survey.academic_background
                                                        ?.university
                                                        ?.attendedSecondDegreeUniversity ||
                                                    ''
                                                }
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item sm={6} xs={12}>
                                            <TextField
                                                error={
                                                    survey.academic_background
                                                        ?.university
                                                        ?.attendedSecondDegreeProgram ===
                                                    ''
                                                }
                                                fullWidth
                                                helperText={
                                                    survey.academic_background
                                                        ?.university
                                                        ?.attendedSecondDegreeProgram ===
                                                    ''
                                                        ? 'Please provide program name info.'
                                                        : null
                                                }
                                                id="attendedSecondDegreeProgram"
                                                label={t('Program Name')}
                                                name="attendedSecondDegreeProgram"
                                                onChange={(e) =>
                                                    handleChangeAcademic(e)
                                                }
                                                placeholder="M.Sc. Electrical Engineering"
                                                value={
                                                    survey.academic_background
                                                        ?.university
                                                        ?.attendedSecondDegreeProgram ||
                                                    ''
                                                }
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item sm={6} xs={12}>
                                            {survey.academic_background
                                                ?.university
                                                ?.isSecondGraduated !== '-' &&
                                            survey.academic_background
                                                ?.university
                                                ?.isSecondGraduated !== 'No' ? (
                                                <TextField
                                                    error={
                                                        survey
                                                            .academic_background
                                                            ?.university
                                                            ?.expectedSecondDegreeGradDate ===
                                                        '-'
                                                    }
                                                    fullWidth
                                                    helperText={
                                                        survey
                                                            .academic_background
                                                            ?.university
                                                            ?.expectedSecondDegreeGradDate ===
                                                        '-'
                                                            ? 'Please provide graduate date info.'
                                                            : null
                                                    }
                                                    id="expectedSecondDegreeGradDate"
                                                    label={`${
                                                        survey
                                                            ?.academic_background
                                                            ?.university
                                                            ?.isSecondGraduated ===
                                                        'No'
                                                            ? t('Leaved Year')
                                                            : survey
                                                                    ?.academic_background
                                                                    ?.university
                                                                    ?.isSecondGraduated ===
                                                                'Yes'
                                                              ? t(
                                                                    'Graduated Year'
                                                                )
                                                              : t(
                                                                    'Expected Graduate Year'
                                                                )
                                                    }`}
                                                    name="expectedSecondDegreeGradDate"
                                                    onChange={(e) =>
                                                        handleChangeAcademic(e)
                                                    }
                                                    select
                                                    value={
                                                        survey
                                                            .academic_background
                                                            ?.university
                                                            ?.expectedSecondDegreeGradDate ||
                                                        '-'
                                                    }
                                                >
                                                    {APPLICATION_YEARS_FUTURE().map(
                                                        (option) => (
                                                            <MenuItem
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                            >
                                                                {option.label}
                                                            </MenuItem>
                                                        )
                                                    )}
                                                </TextField>
                                            ) : null}
                                        </Grid>
                                        <Grid item sm={6} xs={12}>
                                            <TextField
                                                defaultValue={
                                                    survey.academic_background
                                                        ?.university
                                                        ?.highestSecondDegreeGPA ||
                                                    0
                                                }
                                                error={
                                                    survey.academic_background
                                                        ?.university
                                                        ?.highestSecondDegreeGPA ===
                                                        '0' ||
                                                    survey.academic_background
                                                        ?.university
                                                        ?.highestSecondDegreeGPA ===
                                                        null
                                                }
                                                fullWidth
                                                helperText={
                                                    survey.academic_background
                                                        ?.university
                                                        ?.highestSecondDegreeGPA ===
                                                        '0' ||
                                                    survey.academic_background
                                                        ?.university
                                                        ?.highestSecondDegreeGPA ===
                                                        null
                                                        ? 'Please provide highest GPA from your university.'
                                                        : null
                                                }
                                                id="highestSecondDegreeGPA"
                                                label={t(
                                                    'Second Degree highest Score GPA of your university program'
                                                )}
                                                name="highestSecondDegreeGPA"
                                                onChange={(e) =>
                                                    handleChangeAcademic(e)
                                                }
                                                placeholder="4.3"
                                                type="number"
                                            />
                                        </Grid>
                                        <Grid item sm={6} xs={12}>
                                            <TextField
                                                defaultValue={
                                                    survey.academic_background
                                                        ?.university
                                                        ?.passingSecondDegreeGPA ||
                                                    0
                                                }
                                                error={
                                                    survey.academic_background
                                                        ?.university
                                                        ?.passingSecondDegreeGPA ===
                                                        '0' ||
                                                    survey.academic_background
                                                        ?.university
                                                        ?.passingSecondDegreeGPA ===
                                                        null
                                                }
                                                fullWidth
                                                helperText={
                                                    survey.academic_background
                                                        ?.university
                                                        ?.passingSecondDegreeGPA ===
                                                        '0' ||
                                                    survey.academic_background
                                                        ?.university
                                                        ?.passingSecondDegreeGPA ===
                                                        null
                                                        ? 'Please provide passing GPA from your university.'
                                                        : null
                                                }
                                                id="passingSecondDegreeGPA"
                                                label={t(
                                                    'Second Degree passing Score GPA of your university program'
                                                )}
                                                name="passingSecondDegreeGPA"
                                                onChange={(e) =>
                                                    handleChangeAcademic(e)
                                                }
                                                placeholder="1.7"
                                                type="number"
                                            />
                                        </Grid>
                                        <Grid item sm={6} xs={12}>
                                            <TextField
                                                defaultValue={
                                                    survey.academic_background
                                                        ?.university
                                                        ?.mySecondDegreeGPA || 0
                                                }
                                                error={
                                                    survey.academic_background
                                                        ?.university
                                                        ?.mySecondDegreeGPA ===
                                                        '0' ||
                                                    survey.academic_background
                                                        ?.university
                                                        ?.mySecondDegreeGPA ===
                                                        null
                                                }
                                                fullWidth
                                                helperText={
                                                    survey.academic_background
                                                        ?.university
                                                        ?.mySecondDegreeGPA ===
                                                        '0' ||
                                                    survey.academic_background
                                                        ?.university
                                                        ?.mySecondDegreeGPA ===
                                                        null
                                                        ? 'Please provide passing GPA from your university.'
                                                        : null
                                                }
                                                id="mySecondDegreeGPA"
                                                label={t(
                                                    'My Second Degree GPA'
                                                )}
                                                name="mySecondDegreeGPA"
                                                onChange={(e) =>
                                                    handleChangeAcademic(e)
                                                }
                                                placeholder="3.7"
                                                type="number"
                                            />
                                        </Grid>
                                    </>
                                ) : null}
                            </>
                        ) : null}
                        <Grid item xs={12}>
                            <Typography variant="body1">
                                {t('Practical Experience', { ns: 'survey' })}
                            </Typography>
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            <TextField
                                error={
                                    survey.academic_background?.university
                                        ?.Has_Internship_Experience === '-'
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.university
                                        ?.Has_Internship_Experience === '-'
                                        ? 'Please provide internship experience info.'
                                        : null
                                }
                                id={t('Internship Experience ?')}
                                label={t('Internship Experience ?')}
                                name="Has_Internship_Experience"
                                onChange={(e) => handleChangeAcademic(e)}
                                select
                                value={
                                    survey.academic_background?.university
                                        ?.Has_Internship_Experience || '-'
                                }
                            >
                                {DUAL_STATE_OPTIONS.map((option) => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            <TextField
                                error={
                                    survey.academic_background?.university
                                        ?.Has_Working_Experience === '-'
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.university
                                        ?.Has_Working_Experience === '-'
                                        ? 'Please provide full-time working experience info.'
                                        : null
                                }
                                id="Full-TimeJobExperience"
                                label={t('Full-Time Job Experience ?')}
                                name="Has_Working_Experience"
                                onChange={(e) => handleChangeAcademic(e)}
                                select
                                value={
                                    survey.academic_background?.university
                                        ?.Has_Working_Experience || '-'
                                }
                            >
                                {DUAL_STATE_OPTIONS.map((option) => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography sx={{ mt: 2 }} variant="body2">
                                {t('Last update at')}:{' '}
                                {survey.academic_background?.university
                                    ?.updatedAt
                                    ? convertDate(
                                          survey.academic_background?.university
                                              .updatedAt as string
                                      )
                                    : ''}
                                {user?.archiv !== true ? (
                                    <>
                                        <br />
                                        <Button
                                            color="primary"
                                            disabled={!survey.changed_academic}
                                            fullWidth
                                            onClick={(
                                                e: MouseEvent<HTMLButtonElement>
                                            ) =>
                                                handleAcademicBackgroundSubmit(
                                                    e,
                                                    survey.academic_background
                                                        ?.university ?? {}
                                                )
                                            }
                                            sx={{ mt: 2 }}
                                            variant="contained"
                                        >
                                            {t('Update', { ns: 'common' })}
                                        </Button>
                                    </>
                                ) : null}
                            </Typography>
                        </Grid>
                    </Grid>
                </Card>
                <SurveyApplicationPreferenceCard
                    survey={survey}
                    user={user}
                    t={t}
                    handleChangeApplicationPreference={
                        handleChangeApplicationPreference
                    }
                    setApplicationPreferenceByField={
                        setApplicationPreferenceByField
                    }
                    handleApplicationPreferenceSubmit={
                        handleApplicationPreferenceSubmit
                    }
                />
                <Card sx={{ mt: 2, padding: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                {t('Languages Test and Certificates')}
                            </Typography>
                            <Banner
                                link_name=""
                                path="/"
                                text="若還沒考過，請在 Passed 處選 No，並填上檢定以及預計考試時間。若不需要（如德語），請填 Not Needed。方便顧問了解你的進度。"
                                title="warning"
                            />
                            {survey.academic_background?.language
                                ?.english_isPassed === 'X' ||
                            survey.academic_background?.language
                                ?.german_isPassed === 'X' ||
                            survey.academic_background?.language
                                ?.gre_isPassed === 'X' ||
                            survey.academic_background?.language
                                ?.gmat_isPassed === 'X' ? (
                                <Banner
                                    link_name=""
                                    path="/"
                                    text={
                                        <>
                                            報名考試時，請確認 <b>護照</b>{' '}
                                            有無過期。
                                        </>
                                    }
                                    title="warning"
                                />
                            ) : null}
                        </Grid>
                        <Grid item sm={4} xs={12}>
                            <TextField
                                error={
                                    survey.academic_background?.language
                                        ?.english_isPassed === '-'
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.language
                                        ?.english_isPassed === '-'
                                        ? 'Please provide English info.'
                                        : null
                                }
                                id="english_isPassed"
                                label={t(
                                    'English Passed ? (IELTS 6.5 / TOEFL 88)'
                                )}
                                name="english_isPassed"
                                onChange={handleChangeLanguage}
                                select
                                sx={{ mt: 1 }}
                                value={
                                    survey.academic_background?.language
                                        ?.english_isPassed || '-'
                                }
                            >
                                {IS_PASSED_OPTIONS.map((option) => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item sm={4} xs={12}>
                            {survey?.academic_background?.language
                                ?.english_isPassed === 'O' ||
                            survey?.academic_background?.language
                                ?.english_isPassed === 'X' ? (
                                <FormControl fullWidth sx={{ mt: 1 }}>
                                    <InputLabel id="english_certificate">
                                        {t('English Certificate')}
                                    </InputLabel>
                                    <Select
                                        id="english_certificate"
                                        label={t('English Certificate')}
                                        name="english_certificate"
                                        onChange={
                                            handleChangeLanguage as unknown as React.ComponentProps<
                                                typeof Select
                                            >['onChange']
                                        }
                                        value={
                                            survey.academic_background?.language
                                                ?.english_certificate || ''
                                        }
                                    >
                                        {ENGLISH_CERTIFICATE_ARRAY_OPTIONS.map(
                                            (option) => (
                                                <MenuItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </MenuItem>
                                            )
                                        )}
                                    </Select>
                                </FormControl>
                            ) : null}
                        </Grid>
                        <Grid item lg={4} sx={{ mb: 2 }} xs={12}>
                            {['O', 'X'].includes(
                                survey?.academic_background?.language
                                    ?.english_isPassed as string
                            ) ? (
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        format="D. MMM. YYYY"
                                        label={
                                            survey?.academic_background
                                                ?.language?.english_isPassed ===
                                            'X'
                                                ? t(
                                                      'Expected English Test Date'
                                                  )
                                                : t('English Test Date')
                                        }
                                        name="english_test_date"
                                        onChange={(newValue) =>
                                            handleTestDate(
                                                'english_test_date',
                                                newValue
                                            )
                                        }
                                        value={dayjs(
                                            (survey.academic_background
                                                ?.language
                                                ?.english_test_date as string) ||
                                                ''
                                        )}
                                    />
                                </LocalizationProvider>
                            ) : null}
                        </Grid>
                        {survey?.academic_background?.language
                            ?.english_isPassed === 'O' ? (
                            <>
                                <Grid item sm={4} xs={12}>
                                    <TextField
                                        disabled={
                                            survey.academic_background
                                                .language &&
                                            survey.academic_background.language
                                                .english_certificate === 'No'
                                                ? true
                                                : false
                                        }
                                        fullWidth
                                        id="english_score"
                                        label="Overall"
                                        name="english_score"
                                        onChange={(e) =>
                                            handleChangeLanguage(e)
                                        }
                                        placeholder={`${
                                            survey.academic_background.language
                                                .english_certificate === 'IELTS'
                                                ? '6.5'
                                                : '92'
                                        } `}
                                        type="number"
                                        value={
                                            survey.academic_background?.language
                                                ?.english_score || ''
                                        }
                                    />
                                </Grid>
                                <Grid item sm={2} xs={12}>
                                    <TextField
                                        disabled={
                                            survey.academic_background?.language
                                                ?.english_certificate === 'No'
                                                ? true
                                                : false
                                        }
                                        fullWidth
                                        id="english_score_reading"
                                        label="Reading"
                                        name="english_score_reading"
                                        onChange={(e) =>
                                            handleChangeLanguage(e)
                                        }
                                        placeholder={`${
                                            survey.academic_background.language
                                                .english_certificate === 'IELTS'
                                                ? '6.5'
                                                : '21'
                                        } `}
                                        type="number"
                                        value={
                                            survey.academic_background?.language
                                                ?.english_score_reading || ''
                                        }
                                    />
                                </Grid>
                                <Grid item sm={2} xs={12}>
                                    <TextField
                                        disabled={
                                            survey.academic_background?.language
                                                ?.english_certificate === 'No'
                                                ? true
                                                : false
                                        }
                                        fullWidth
                                        id="english_score_listening"
                                        label="Listening"
                                        name="english_score_listening"
                                        onChange={(e) =>
                                            handleChangeLanguage(e)
                                        }
                                        placeholder={`${
                                            survey.academic_background.language
                                                .english_certificate === 'IELTS'
                                                ? '6.5'
                                                : '21'
                                        } `}
                                        type="number"
                                        value={
                                            survey.academic_background?.language
                                                ?.english_score_listening || ''
                                        }
                                    />
                                </Grid>
                                <Grid item sm={2} xs={12}>
                                    <TextField
                                        disabled={
                                            survey.academic_background?.language
                                                ?.english_certificate === 'No'
                                                ? true
                                                : false
                                        }
                                        fullWidth
                                        id="english_score_writing"
                                        label="Writing"
                                        name="english_score_writing"
                                        onChange={(e) =>
                                            handleChangeLanguage(e)
                                        }
                                        placeholder={`${
                                            survey.academic_background.language
                                                .english_certificate === 'IELTS'
                                                ? '6.5'
                                                : '21'
                                        } `}
                                        type="number"
                                        value={
                                            survey.academic_background?.language
                                                ?.english_score_writing || ''
                                        }
                                    />
                                </Grid>
                                <Grid item sm={2} xs={12}>
                                    <TextField
                                        disabled={
                                            survey.academic_background?.language
                                                ?.english_certificate === 'No'
                                                ? true
                                                : false
                                        }
                                        fullWidth
                                        id="english_score_speaking"
                                        label="Speaking"
                                        name="english_score_speaking"
                                        onChange={(e) =>
                                            handleChangeLanguage(e)
                                        }
                                        placeholder={`${
                                            survey.academic_background.language
                                                .english_certificate === 'IELTS'
                                                ? '6.5'
                                                : '21'
                                        } `}
                                        type="number"
                                        value={
                                            survey.academic_background?.language
                                                ?.english_score_speaking || ''
                                        }
                                    />
                                </Grid>
                            </>
                        ) : null}
                        <Grid item sm={4} xs={12}>
                            <TextField
                                error={
                                    survey.academic_background?.language
                                        ?.german_isPassed === '-'
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.language
                                        ?.german_isPassed === '-'
                                        ? 'Please provide German test info.'
                                        : null
                                }
                                id="german_isPassed"
                                label={t(
                                    'German Passed ? (Set Not need if applying English taught programs.)'
                                )}
                                name="german_isPassed"
                                onChange={handleChangeLanguage}
                                select
                                sx={{ mt: 1 }}
                                value={
                                    survey.academic_background?.language
                                        ?.german_isPassed
                                }
                            >
                                {IS_PASSED_OPTIONS.map((option) => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        {survey?.academic_background?.language
                            ?.german_isPassed === 'O' ||
                        survey?.academic_background?.language
                            ?.german_isPassed === 'X' ? (
                            <Grid item sm={4} xs={12}>
                                <FormControl fullWidth sx={{ mt: 1 }}>
                                    <InputLabel id="german_certificate">
                                        {t('German Certificate')}
                                    </InputLabel>
                                    <Select
                                        id="german_certificate"
                                        label={t('German Certificate')}
                                        name="german_certificate"
                                        onChange={
                                            handleChangeLanguage as unknown as React.ComponentProps<
                                                typeof Select
                                            >['onChange']
                                        }
                                        value={
                                            survey.academic_background?.language
                                                ?.german_certificate || ''
                                        }
                                    >
                                        {GERMAN_CERTIFICATE_ARRAY_OPTIONS.map(
                                            (option) => (
                                                <MenuItem
                                                    disabled={option.disabled}
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </MenuItem>
                                            )
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>
                        ) : null}
                        <Grid item sm={4} xs={12}>
                            {['O', 'X'].includes(
                                survey?.academic_background?.language
                                    ?.german_isPassed as string
                            ) ? (
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        format="D. MMM. YYYY"
                                        label={
                                            survey?.academic_background
                                                ?.language?.german_isPassed ===
                                            'X'
                                                ? t('Expected German Test Date')
                                                : t('German Test Date')
                                        }
                                        name="german_test_date"
                                        onChange={(newValue) =>
                                            handleTestDate(
                                                'german_test_date',
                                                newValue
                                            )
                                        }
                                        value={dayjs(
                                            (survey.academic_background
                                                ?.language
                                                ?.german_test_date as string) ||
                                                ''
                                        )}
                                    />
                                </LocalizationProvider>
                            ) : null}
                        </Grid>
                        <Grid item sm={12} xs={12}>
                            {survey?.academic_background?.language
                                ?.german_isPassed === 'O' ? (
                                <TextField
                                    disabled={
                                        survey.academic_background?.language
                                            ?.german_certificate === 'No'
                                            ? true
                                            : false
                                    }
                                    id="german_score"
                                    label={t('German Test Score')}
                                    name="german_score"
                                    onChange={(e) => handleChangeLanguage(e)}
                                    placeholder="(i.e. TestDaF: 4, or DSH: 2) "
                                    value={
                                        survey.academic_background?.language
                                            ?.german_score || ''
                                    }
                                />
                            ) : null}
                        </Grid>
                        <Grid item sm={4} xs={12}>
                            <TextField
                                error={
                                    survey.academic_background?.language
                                        ?.gre_isPassed === '-'
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.language
                                        ?.gre_isPassed === '-'
                                        ? 'Please provide GRE info.'
                                        : null
                                }
                                id="gre_isPassed"
                                label="GRE Test ? (At least V145 Q160 )"
                                name="gre_isPassed"
                                onChange={handleChangeLanguage}
                                select
                                sx={{ mt: 1 }}
                                value={
                                    survey.academic_background?.language
                                        ?.gre_isPassed
                                }
                            >
                                {IS_PASSED_OPTIONS.map((option) => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item sm={4} xs={12}>
                            {survey.academic_background?.language
                                ?.gre_isPassed === 'O' ||
                            survey.academic_background?.language
                                ?.gre_isPassed === 'X' ? (
                                <FormControl fullWidth sx={{ mt: 1 }}>
                                    <InputLabel id="gre_certificate">
                                        {t('GRE Test')}
                                    </InputLabel>
                                    <Select
                                        id="gre_certificate"
                                        label="GRE Test"
                                        name="gre_certificate"
                                        onChange={
                                            handleChangeLanguage as unknown as React.ComponentProps<
                                                typeof Select
                                            >['onChange']
                                        }
                                        value={
                                            survey.academic_background?.language
                                                ?.gre_certificate || ''
                                        }
                                    >
                                        {GRE_CERTIFICATE_ARRAY_OPTIONS.map(
                                            (option) => (
                                                <MenuItem
                                                    disabled={option.disabled}
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </MenuItem>
                                            )
                                        )}
                                    </Select>
                                </FormControl>
                            ) : null}
                        </Grid>
                        <Grid item sm={4} xs={12}>
                            {['O', 'X'].includes(
                                survey.academic_background?.language
                                    ?.gre_isPassed as string
                            ) ? (
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        format="D. MMM. YYYY"
                                        label={
                                            survey.academic_background?.language
                                                ?.gre_isPassed === 'X'
                                                ? t('Expected GRE Test Date')
                                                : t('GRE Test Date')
                                        }
                                        name="gre_test_date"
                                        onChange={(newValue) =>
                                            handleTestDate(
                                                'gre_test_date',
                                                newValue
                                            )
                                        }
                                        value={dayjs(
                                            (survey.academic_background
                                                ?.language
                                                ?.gre_test_date as string) || ''
                                        )}
                                    />
                                </LocalizationProvider>
                            ) : null}
                        </Grid>
                        {survey.academic_background?.language?.gre_isPassed ===
                            'O' &&
                        survey.academic_background?.language
                            ?.gre_certificate !== '' ? (
                            <Grid item sm={12} xs={12}>
                                <TextField
                                    disabled={
                                        survey.academic_background?.language
                                            ?.gre_certificate === 'No'
                                            ? true
                                            : false
                                    }
                                    fullWidth
                                    id="gre_score"
                                    label={t('GRE Test Score')}
                                    name="gre_score"
                                    onChange={(e) => handleChangeLanguage(e)}
                                    placeholder="(i.e. V152Q167A3.5) "
                                    value={
                                        survey.academic_background?.language
                                            ?.gre_score || ''
                                    }
                                    variant="outlined"
                                />
                            </Grid>
                        ) : null}

                        <Grid item sm={4} xs={12}>
                            <TextField
                                error={
                                    survey.academic_background?.language
                                        ?.gmat_isPassed === '-'
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.language
                                        ?.gmat_isPassed === '-'
                                        ? 'Please provide GMAT info.'
                                        : null
                                }
                                id="gmat_isPassed"
                                label="GMAT Test ? (At least 600 )"
                                name="gmat_isPassed"
                                onChange={handleChangeLanguage}
                                select
                                sx={{ mt: 1 }}
                                value={
                                    survey.academic_background?.language
                                        ?.gmat_isPassed
                                }
                            >
                                {IS_PASSED_OPTIONS.map((option) => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        {survey.academic_background?.language?.gmat_isPassed ===
                            'O' ||
                        survey.academic_background?.language?.gmat_isPassed ===
                            'X' ? (
                            <Grid item sm={4} xs={12}>
                                <FormControl fullWidth sx={{ mt: 1 }}>
                                    <InputLabel id="gmat_certificate">
                                        {t('GMAT Test')}
                                    </InputLabel>
                                    <Select
                                        id="gmat_certificate"
                                        label="GMAT Test"
                                        name="gmat_certificate"
                                        onChange={
                                            handleChangeLanguage as unknown as React.ComponentProps<
                                                typeof Select
                                            >['onChange']
                                        }
                                        value={
                                            survey.academic_background?.language
                                                ?.gmat_certificate || ''
                                        }
                                    >
                                        {GMAT_CERTIFICATE_OPTIONS.map(
                                            (option) => (
                                                <MenuItem
                                                    disabled={option.disabled}
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </MenuItem>
                                            )
                                        )}
                                    </Select>
                                </FormControl>
                            </Grid>
                        ) : null}
                        <Grid item sm={4} xs={12}>
                            {['O', 'X'].includes(
                                survey.academic_background?.language
                                    ?.gmat_isPassed as string
                            ) ? (
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                >
                                    <DatePicker
                                        format="D. MMM. YYYY"
                                        label={
                                            survey.academic_background?.language
                                                ?.gmat_isPassed === 'X'
                                                ? t('Expected GMAT Test Date')
                                                : t('GMAT Test Date')
                                        }
                                        name="gmat_test_date"
                                        onChange={(newValue) =>
                                            handleTestDate(
                                                'gmat_test_date',
                                                newValue
                                            )
                                        }
                                        value={dayjs(
                                            (survey.academic_background
                                                ?.language
                                                ?.gmat_test_date as string) ||
                                                ''
                                        )}
                                    />
                                </LocalizationProvider>
                            ) : null}
                        </Grid>
                        {survey.academic_background?.language?.gmat_isPassed ===
                            'O' &&
                        survey.academic_background?.language
                            ?.gmat_certificate !== '' ? (
                            <Grid item sm={12} xs={12}>
                                <TextField
                                    disabled={
                                        survey.academic_background?.language
                                            ?.gmat_certificate === 'No'
                                            ? true
                                            : false
                                    }
                                    fullWidth
                                    id="gmat_score"
                                    label={t('GMAT Test Score')}
                                    name="gmat_score"
                                    onChange={(e) => handleChangeLanguage(e)}
                                    placeholder="(i.e. 550, 620) "
                                    type="number"
                                    value={
                                        survey.academic_background?.language
                                            ?.gmat_score || ''
                                    }
                                    variant="outlined"
                                />
                            </Grid>
                        ) : null}
                    </Grid>
                    <Box>
                        <Typography sx={{ mt: 2 }} variant="body2">
                            {t('Last update at')}:
                            {survey.academic_background?.language &&
                            survey.academic_background?.language.updatedAt
                                ? convertDate(
                                      survey.academic_background?.language
                                          .updatedAt as string
                                  )
                                : ''}
                            {user?.archiv !== true ? (
                                <>
                                    <br />
                                    <Button
                                        color="primary"
                                        disabled={!survey.changed_language}
                                        fullWidth
                                        onClick={(
                                            e: MouseEvent<HTMLButtonElement>
                                        ) =>
                                            handleSurveyLanguageSubmit(
                                                e,
                                                survey.academic_background
                                                    ?.language ?? {}
                                            )
                                        }
                                        sx={{ mt: 2 }}
                                        variant="contained"
                                    >
                                        {t('Update', { ns: 'common' })}
                                    </Button>
                                </>
                            ) : null}{' '}
                        </Typography>
                    </Box>
                </Card>
            </Box>
            <SurveyDocLinkEditDialog
                open={baseDocsflagOffcanvas}
                onClose={closeOffcanvasWindow}
                onSave={handleUpdateDocLink}
                surveyLink={survey.survey_link}
                onChangeURL={onChangeURL}
                docName={props?.docName}
                saving={baseDocsflagOffcanvasButtonDisable}
                t={t}
            />
        </Box>
    );
};

export default SurveyEditableComponent;
