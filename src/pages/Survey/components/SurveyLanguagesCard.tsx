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
    InputLabel
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

import {
    ENGLISH_CERTIFICATE_ARRAY_OPTIONS,
    GERMAN_CERTIFICATE_ARRAY_OPTIONS,
    GMAT_CERTIFICATE_OPTIONS,
    GRE_CERTIFICATE_ARRAY_OPTIONS,
    IS_PASSED_OPTIONS,
    convertDate
} from '@utils/contants';
import Banner from '@components/Banner/Banner';
import type { SurveyLanguagesCardProps } from '../types';

const SurveyLanguagesCard = ({
    survey,
    user,
    t,
    handleChangeLanguage,
    handleTestDate,
    handleSurveyLanguageSubmit
}: SurveyLanguagesCardProps) => {
    return (
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

                {/* English Section */}
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
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
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

                {/* German Section */}
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
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
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

                {/* GRE Section */}
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
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
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

                {/* GMAT Section */}
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
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
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
    );
};

export default SurveyLanguagesCard;
