import React, { type MouseEvent } from 'react';
import {
    Button,
    Card,
    MenuItem,
    TextField,
    Typography,
    Grid,
    Stack,
    Popover,
    IconButton
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import LinkIcon from '@mui/icons-material/Link';
import { Link as LinkDom } from 'react-router-dom';
import { Bayerische_Formel, is_TaiGer_Admin } from '@taiger-common/core';
import type { IUser } from '@taiger-common/model';
import { grey } from '@mui/material/colors';

import {
    BACHELOR_GRADUATE_STATUS_OPTIONS,
    DUAL_STATE_OPTIONS,
    HIG_SCHOOL_TRI_STATE_OPTIONS,
    convertDate,
    APPLICATION_YEARS_FUTURE
} from '@utils/contants';
import type { SurveyAcademicBackgroundCardProps } from '../types';

const yearOptionValues = APPLICATION_YEARS_FUTURE().map((o) => o.value);

function validYearSelectValue(raw: unknown): number | '' {
    const numVal = raw === null || raw === undefined ? NaN : Number(raw);
    return !Number.isNaN(numVal) && yearOptionValues.includes(numVal)
        ? numVal
        : '';
}

const SurveyAcademicBackgroundCard = ({
    survey,
    user,
    t,
    handleChangeAcademic,
    handleAcademicBackgroundSubmit,
    openOffcanvasWindow,
    surveyLink,
    anchorEl,
    onClosePopover,
    onOpenPopover
}: SurveyAcademicBackgroundCardProps) => {
    const openPopover = Boolean(anchorEl);

    return (
        <Card sx={{ mt: 2, padding: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        {t('Academic Background Survey')}
                    </Typography>
                    <Typography variant="body1">{t('High School')}</Typography>
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
                            <MenuItem key={option.value} value={option.value}>
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
                                    survey.academic_background?.university
                                        ?.high_school_isGraduated === 'Yes'
                                        ? t('High School Graduate Year')
                                        : survey.academic_background?.university
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
                                onChange={(e) => handleChangeAcademic(e)}
                                placeholder="2016"
                                value={
                                    survey.academic_background?.university
                                        ?.high_school_graduated_year
                                        ? survey.academic_background.university
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
                        {BACHELOR_GRADUATE_STATUS_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
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
                                    survey.academic_background?.university
                                        ?.attended_university === ''
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.university
                                        ?.attended_university === ''
                                        ? 'Please provide University name info.'
                                        : null
                                }
                                id="attended_university"
                                label={t('University Name (Bachelor degree)')}
                                name="attended_university"
                                onChange={(e) => handleChangeAcademic(e)}
                                placeholder="National Yilan University"
                                value={
                                    survey.academic_background?.university
                                        ?.attended_university || ''
                                }
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            <TextField
                                error={
                                    survey.academic_background?.university
                                        ?.attended_university_program === ''
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.university
                                        ?.attended_university_program === ''
                                        ? 'Please provide program name info.'
                                        : null
                                }
                                id="attended_university_program"
                                label={t('Program Name')}
                                name="attended_university_program"
                                onChange={(e) => handleChangeAcademic(e)}
                                placeholder="B.Sc. Electrical Engineering"
                                value={
                                    survey.academic_background?.university
                                        ?.attended_university_program || ''
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
                                        survey.academic_background?.university
                                            ?.expected_grad_date === '-'
                                    }
                                    fullWidth
                                    helperText={
                                        survey.academic_background?.university
                                            ?.expected_grad_date === '-'
                                            ? 'Please provide graduate date info.'
                                            : null
                                    }
                                    id="expected_grad_date"
                                    label={`${
                                        survey?.academic_background?.university
                                            ?.isGraduated === 'No'
                                            ? t('Leaved Year')
                                            : survey?.academic_background
                                                    ?.university
                                                    ?.isGraduated === 'Yes'
                                              ? t('Graduated Year')
                                              : t('Expected Graduate Year')
                                    }`}
                                    name="expected_grad_date"
                                    onChange={(e) => handleChangeAcademic(e)}
                                    select
                                    value={validYearSelectValue(
                                        survey.academic_background?.university
                                            ?.expected_grad_date
                                    )}
                                >
                                    <MenuItem value="">-</MenuItem>
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
                                    survey.academic_background?.university
                                        ?.Has_Exchange_Experience === '-'
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.university
                                        ?.Has_Exchange_Experience === '-'
                                        ? 'Please provide university exchange student info.'
                                        : null
                                }
                                id="Has_Exchange_Experience"
                                label={t('Exchange Student Experience ?')}
                                name="Has_Exchange_Experience"
                                onChange={(e) => handleChangeAcademic(e)}
                                select
                                value={
                                    survey.academic_background?.university
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
                                    survey.academic_background?.university
                                        ?.Highest_GPA_Uni || 0
                                }
                                error={
                                    survey.academic_background?.university
                                        ?.Highest_GPA_Uni === '0' ||
                                    survey.academic_background?.university
                                        ?.Highest_GPA_Uni === null
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.university
                                        ?.Highest_GPA_Uni === '0' ||
                                    survey.academic_background?.university
                                        ?.Highest_GPA_Uni === null
                                        ? 'Please provide highest GPA from your university.'
                                        : null
                                }
                                id="Highest_GPA_Uni"
                                label={t(
                                    'Highest Score GPA of your university program'
                                )}
                                name="Highest_GPA_Uni"
                                onChange={(e) => handleChangeAcademic(e)}
                                placeholder="4.3"
                                type="number"
                            />
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            <TextField
                                defaultValue={
                                    survey.academic_background?.university
                                        ?.Passing_GPA_Uni || 0
                                }
                                error={
                                    survey.academic_background?.university
                                        ?.Passing_GPA_Uni === '0' ||
                                    survey.academic_background?.university
                                        ?.Passing_GPA_Uni === null
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.university
                                        ?.Passing_GPA_Uni === '0' ||
                                    survey.academic_background?.university
                                        ?.Passing_GPA_Uni === null
                                        ? 'Please provide passing GPA from your university.'
                                        : null
                                }
                                id="Passing_GPA_Uni"
                                label={t(
                                    'Passing Score GPA of your university program'
                                )}
                                name="Passing_GPA_Uni"
                                onChange={(e) => handleChangeAcademic(e)}
                                placeholder="1.7"
                                type="number"
                            />
                        </Grid>
                        <Grid item sm={6} xs={12}>
                            <TextField
                                defaultValue={
                                    survey.academic_background?.university
                                        ?.My_GPA_Uni || 0
                                }
                                error={
                                    survey.academic_background?.university
                                        ?.My_GPA_Uni === '0' ||
                                    survey.academic_background?.university
                                        ?.My_GPA_Uni === null
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.university
                                        ?.My_GPA_Uni === '0' ||
                                    survey.academic_background?.university
                                        ?.My_GPA_Uni === null
                                        ? 'Please provide passing GPA from your university.'
                                        : null
                                }
                                id="My_GPA_Uni"
                                label={t('My GPA')}
                                name="My_GPA_Uni"
                                onChange={(e) => handleChangeAcademic(e)}
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
                                        survey.academic_background?.university
                                            ?.Highest_GPA_Uni as number,
                                        survey.academic_background?.university
                                            ?.Passing_GPA_Uni as number,
                                        survey.academic_background?.university
                                            ?.My_GPA_Uni as number
                                    )}
                                </b>
                            ) : (
                                0
                            )}
                        </Typography>
                        <HelpIcon
                            onClick={
                                onOpenPopover as unknown as React.MouseEventHandler<SVGSVGElement>
                            }
                            style={{ color: grey[400] }}
                        />
                        <Popover
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left'
                            }}
                            onClose={onClosePopover}
                            open={openPopover}
                        >
                            <Typography sx={{ m: 2 }}>
                                <b>
                                    {Bayerische_Formel(
                                        (survey.academic_background?.university
                                            ?.Highest_GPA_Uni as number) ?? 0,
                                        (survey.academic_background?.university
                                            ?.Passing_GPA_Uni as number) ?? 0,
                                        (survey.academic_background?.university
                                            ?.My_GPA_Uni as number) ?? 0
                                    )}
                                </b>{' '}
                                = 1 + (3 * (highest - my)) / (highest - passing)
                                = 1 + (3 * (
                                {
                                    survey.academic_background?.university
                                        ?.Highest_GPA_Uni as string
                                }{' '}
                                -{' '}
                                {
                                    survey.academic_background?.university
                                        ?.My_GPA_Uni as string
                                }
                                )) / (
                                {
                                    survey.academic_background?.university
                                        ?.Highest_GPA_Uni as string
                                }{' '}
                                -{' '}
                                {
                                    survey.academic_background?.university
                                        ?.Passing_GPA_Uni as string
                                }
                                )
                            </Typography>
                        </Popover>
                    </Stack>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <Stack alignItems="center" direction="row" spacing={1}>
                        <Typography variant="body1">
                            {t('gpa-instructions')}
                        </Typography>
                        <IconButton
                            component={LinkDom}
                            rel="noopener noreferrer"
                            size="small"
                            target="_blank"
                            to={
                                surveyLink && surveyLink !== ''
                                    ? surveyLink
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
                                    survey.academic_background?.university
                                        ?.isSecondGraduated === '-'
                                }
                                fullWidth
                                helperText={
                                    survey.academic_background?.university
                                        ?.isSecondGraduated === '-'
                                        ? 'Please provide Second Degree info.'
                                        : null
                                }
                                id="isSecondGraduated"
                                label={t('Already Second Degree graduated ?')}
                                name="isSecondGraduated"
                                onChange={(e) => handleChangeAcademic(e)}
                                select
                                value={
                                    survey.academic_background?.university
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
                                    {survey.academic_background?.university
                                        ?.isSecondGraduated !== '-' &&
                                    survey.academic_background?.university
                                        ?.isSecondGraduated !== 'No' ? (
                                        <TextField
                                            error={
                                                survey.academic_background
                                                    ?.university
                                                    ?.expectedSecondDegreeGradDate ===
                                                '-'
                                            }
                                            fullWidth
                                            helperText={
                                                survey.academic_background
                                                    ?.university
                                                    ?.expectedSecondDegreeGradDate ===
                                                '-'
                                                    ? 'Please provide graduate date info.'
                                                    : null
                                            }
                                            id="expectedSecondDegreeGradDate"
                                            label={`${
                                                survey?.academic_background
                                                    ?.university
                                                    ?.isSecondGraduated === 'No'
                                                    ? t('Leaved Year')
                                                    : survey
                                                            ?.academic_background
                                                            ?.university
                                                            ?.isSecondGraduated ===
                                                        'Yes'
                                                      ? t('Graduated Year')
                                                      : t(
                                                            'Expected Graduate Year'
                                                        )
                                            }`}
                                            name="expectedSecondDegreeGradDate"
                                            onChange={(e) =>
                                                handleChangeAcademic(e)
                                            }
                                            select
                                            value={validYearSelectValue(
                                                survey.academic_background
                                                    ?.university
                                                    ?.expectedSecondDegreeGradDate
                                            )}
                                        >
                                            <MenuItem value="">-</MenuItem>
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
                                        defaultValue={
                                            survey.academic_background
                                                ?.university
                                                ?.highestSecondDegreeGPA || 0
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
                                                ?.passingSecondDegreeGPA || 0
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
                                                ?.mySecondDegreeGPA === '0' ||
                                            survey.academic_background
                                                ?.university
                                                ?.mySecondDegreeGPA === null
                                        }
                                        fullWidth
                                        helperText={
                                            survey.academic_background
                                                ?.university
                                                ?.mySecondDegreeGPA === '0' ||
                                            survey.academic_background
                                                ?.university
                                                ?.mySecondDegreeGPA === null
                                                ? 'Please provide passing GPA from your university.'
                                                : null
                                        }
                                        id="mySecondDegreeGPA"
                                        label={t('My Second Degree GPA')}
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
                            <MenuItem key={option.value} value={option.value}>
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
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12}>
                    <Typography sx={{ mt: 2 }} variant="body2">
                        {t('Last update at')}:{' '}
                        {survey.academic_background?.university?.updatedAt
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
    );
};

export default SurveyAcademicBackgroundCard;
