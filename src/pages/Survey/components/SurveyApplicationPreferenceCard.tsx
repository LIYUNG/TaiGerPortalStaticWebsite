import React, { type MouseEvent } from 'react';
import {
    Badge,
    Button,
    Card,
    Grid,
    MenuItem,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { is_TaiGer_Student } from '@taiger-common/core';
import type { IUser } from '@taiger-common/model';

import {
    convertDate,
    DEGREE_ARRAY_OPTIONS,
    EXPECTATION_APPLICATION_YEARS,
    LANGUAGES_PREFERENCE_ARRAY_OPTIONS,
    PROGRAM_SUBJECTS_DETAILED,
    SEMESTER_ARRAY_OPTIONS,
    TRI_STATE_OPTIONS
} from '@utils/contants';
import SearchableMultiSelect from '@components/Input/searchableMuliselect';
import type { SurveyApplicationPreferenceCardProps } from '../types';

const SurveyApplicationPreferenceCard = ({
    survey,
    user,
    t,
    handleChangeApplicationPreference,
    setApplicationPreferenceByField,
    handleApplicationPreferenceSubmit
}: SurveyApplicationPreferenceCardProps) => {
    return (
        <Card sx={{ mt: 2, padding: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h6">{t('Application Preference')}</Typography>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <Tooltip
                        placement="top"
                        title={t('If you want to change this, please contact your agent.')}
                    >
                        <TextField
                            disabled={is_TaiGer_Student(user as IUser)}
                            error={
                                survey.application_preference?.expected_application_date === ''
                            }
                            fullWidth
                            helperText={
                                survey.application_preference?.expected_application_date === ''
                                    ? 'Please provide the info.'
                                    : null
                            }
                            id="expected_application_date"
                            label={`${t('Expected Application Year')} (${t('Agent fill', {
                                ns: 'survey'
                            })})`}
                            name="expected_application_date"
                            onChange={(e) => handleChangeApplicationPreference(e)}
                            select
                            value={
                                survey.application_preference?.expected_application_date || ''
                            }
                        >
                            {EXPECTATION_APPLICATION_YEARS().map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Tooltip>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <Tooltip
                        placement="top"
                        title={t('If you want to change this, please contact your agent.')}
                    >
                        <TextField
                            disabled={!!user && is_TaiGer_Student(user as IUser)}
                            error={
                                survey.application_preference?.expected_application_semester ===
                                ''
                            }
                            fullWidth
                            helperText={
                                survey.application_preference
                                    ?.expected_application_semester === ''
                                    ? 'Please provide the info.'
                                    : null
                            }
                            id="expected_application_semester"
                            label={`${t('Expected Application Semester')} (${t('Agent fill', {
                                ns: 'survey'
                            })})`}
                            name="expected_application_semester"
                            onChange={(e) => handleChangeApplicationPreference(e)}
                            select
                            value={
                                survey?.application_preference?.expected_application_semester ||
                                ''
                            }
                        >
                            {SEMESTER_ARRAY_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Tooltip>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <SearchableMultiSelect
                        data={PROGRAM_SUBJECTS_DETAILED}
                        label={t('Target Application Subjects')}
                        name="target-application-subjects"
                        setValue={setApplicationPreferenceByField('targetApplicationSubjects')}
                        value={
                            (survey.application_preference
                                ?.targetApplicationSubjects as string[]) || []
                        }
                    />
                </Grid>
                {survey.application_preference?.target_application_field != '' ? (
                    <Grid item sm={6} xs={12}>
                        <TextField
                            disabled
                            fullWidth
                            helperText={
                                survey.application_preference?.target_application_field === ''
                                    ? 'Please provide the info.'
                                    : null
                            }
                            id="target_application_field"
                            label={t('Target Application Fields')}
                            name="target_application_field"
                            onChange={(e) => handleChangeApplicationPreference(e)}
                            placeholder="Data Science, Comupter Science, etc. (max. 40 characters)"
                            value={
                                survey.application_preference?.target_application_field || ''
                            }
                            variant="outlined"
                        />
                    </Grid>
                ) : null}
                <Grid item sm={6} xs={12}>
                    <TextField
                        error={survey.application_preference?.target_degree === ''}
                        fullWidth
                        helperText={
                            survey.application_preference?.target_degree === ''
                                ? 'Please provide the info.'
                                : null
                        }
                        id="target_degree"
                        label={t('Target Degree Programs')}
                        name="target_degree"
                        onChange={(e) => handleChangeApplicationPreference(e)}
                        select
                        value={survey.application_preference?.target_degree || ''}
                    >
                        {DEGREE_ARRAY_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <TextField
                        error={!survey.application_preference?.target_program_language}
                        fullWidth
                        helperText={
                            !survey.application_preference?.target_program_language
                                ? 'Please provide the info.'
                                : null
                        }
                        id="target_program_language"
                        label={t('Target Program Language')}
                        name="target_program_language"
                        onChange={(e) => handleChangeApplicationPreference(e)}
                        select
                        value={
                            survey.application_preference?.target_program_language || ''
                        }
                    >
                        {LANGUAGES_PREFERENCE_ARRAY_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {t(option.label)}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <TextField
                        error={
                            survey.application_preference?.application_outside_germany === '-'
                        }
                        fullWidth
                        helperText={
                            survey.application_preference?.application_outside_germany === '-'
                                ? 'Please provide the info.'
                                : null
                        }
                        id="application_outside_germany"
                        label={t('Considering universities outside Germany?')}
                        name="application_outside_germany"
                        onChange={(e) => handleChangeApplicationPreference(e)}
                        select
                        value={
                            survey?.application_preference?.application_outside_germany || '-'
                        }
                    >
                        {TRI_STATE_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <TextField
                        error={
                            survey.application_preference?.considered_privat_universities ===
                            '-'
                        }
                        fullWidth
                        helperText={
                            survey.application_preference?.considered_privat_universities ===
                            '-'
                                ? 'Please provide the info.'
                                : null
                        }
                        id="considered_privat_universities"
                        label={t(
                            'Considering private universities? (Tuition Fee: ~15000 EURO/year)'
                        )}
                        name="considered_privat_universities"
                        onChange={(e) => handleChangeApplicationPreference(e)}
                        select
                        value={
                            survey.application_preference?.considered_privat_universities || ''
                        }
                    >
                        {TRI_STATE_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <TextField
                        fullWidth
                        id="special_wished"
                        inputProps={{ maxLength: 600 }}
                        label={t('Other wish', { ns: 'survey' })}
                        minRows={5}
                        multiline
                        name="special_wished"
                        onChange={(e) => handleChangeApplicationPreference(e)}
                        placeholder="Example: QS Ranking 300, 只要德國"
                        value={survey.application_preference?.special_wished || ''}
                        variant="outlined"
                    />
                    <Badge>
                        {(survey?.application_preference?.special_wished as string)?.length || 0}
                        /600
                    </Badge>
                </Grid>
                <Grid item sm={6} xs={12}>
                    <Typography sx={{ mt: 2 }} variant="body2">
                        {t('Last update at')}:{' '}
                        {survey.application_preference?.updatedAt
                            ? convertDate(
                                  survey.application_preference.updatedAt as string
                              )
                            : ''}
                    </Typography>
                </Grid>
            </Grid>
            {user?.archiv !== true ? (
                <>
                    <br />
                    <Button
                        color="primary"
                        disabled={!survey.changed_application_preference}
                        fullWidth
                        onClick={(e: MouseEvent<HTMLButtonElement>) =>
                            handleApplicationPreferenceSubmit(
                                e,
                                survey.application_preference ?? {}
                            )
                        }
                        variant="contained"
                    >
                        {t('Update', { ns: 'common' })}
                    </Button>
                </>
            ) : null}
        </Card>
    );
};

export default SurveyApplicationPreferenceCard;
