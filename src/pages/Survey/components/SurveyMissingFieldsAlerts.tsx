import React from 'react';
import { Card, Typography } from '@mui/material';
import { differenceInDays } from 'date-fns';

import { MissingSurveyFieldsListArray } from '../../Utils/checking-functions';
import {
    check_academic_background_filled,
    check_languages_filled,
    check_application_preference_filled
} from '../../Utils/util_functions';
import type { IUserAcademicBackground, IUserApplicationPreference } from '@taiger-common/model';
import type { SurveyMissingFieldsAlertsProps } from '../types';

const SurveyMissingFieldsAlerts = ({ survey, t }: SurveyMissingFieldsAlertsProps) => {
    return (
        <>
            {!check_academic_background_filled(survey.academic_background) ||
            !check_application_preference_filled(
                survey.application_preference as IUserApplicationPreference
            ) ? (
                <Card sx={{ padding: 2 }}>
                    <Typography fontWeight="bold">
                        {t('The followings information are still missing')}
                    </Typography>
                    {MissingSurveyFieldsListArray({
                        academic_background:
                            survey.academic_background as IUserAcademicBackground,
                        application_preference:
                            survey.application_preference as IUserApplicationPreference
                    })?.map((field) => (
                        <li key={field}>{t(field)}</li>
                    ))}
                </Card>
            ) : null}
            {!check_languages_filled(survey.academic_background) ? (
                <Card sx={{ padding: 2 }}>
                    <Typography fontWeight="bold">
                        {t(
                            'Your language skills and certificates information are still missing or not up-to-date'
                        )}
                    </Typography>
                    {survey.academic_background?.language?.english_isPassed === '-' ||
                    !survey.academic_background?.language?.english_isPassed ? (
                        <li>{t('Do you need English Test')}?</li>
                    ) : survey.academic_background?.language?.english_isPassed === 'X' &&
                      differenceInDays(
                          new Date(),
                          new Date(
                              (survey.academic_background?.language
                                  ?.english_test_date ?? new Date()) as string | number | Date
                          )
                      ) > 1 ? (
                        <li>{t('English Passed ? (IELTS 6.5 / TOEFL 88)')}</li>
                    ) : survey.academic_background?.language?.english_isPassed !== '--' &&
                      survey.academic_background?.language?.english_test_date === '' ? (
                        <li>{t('English Test Date missing !')}</li>
                    ) : null}
                    {survey.academic_background?.language?.german_isPassed === '-' ||
                    !survey.academic_background?.language?.german_isPassed ? (
                        <li>
                            {t(
                                'German Passed ? (Set Not need if applying English taught programs.)'
                            )}
                        </li>
                    ) : survey.academic_background?.language?.german_isPassed === 'X' &&
                      differenceInDays(
                          new Date(),
                          new Date(
                              (survey.academic_background?.language
                                  ?.german_test_date ?? new Date()) as string | number | Date
                          )
                      ) > 1 ? (
                        <li>
                            {t(
                                'German Passed ? (Set Not need if applying English taught programs.)'
                            )}
                        </li>
                    ) : survey.academic_background?.language?.german_isPassed === 'X' &&
                      survey.academic_background?.language?.german_test_date === '' ? (
                        <li>{t('Expected German Test Date')}</li>
                    ) : null}
                    {survey.academic_background?.language?.gre_isPassed === '-' ||
                    !survey.academic_background?.language?.gre_isPassed ? (
                        <li>{t('Do you need GRE Test')}</li>
                    ) : survey.academic_background?.language?.gre_isPassed === 'X' &&
                      differenceInDays(
                          new Date(),
                          new Date(
                              (survey.academic_background?.language
                                  ?.gre_test_date ?? new Date()) as string | number | Date
                          )
                      ) > 1 ? (
                        <li>{t('GRE Test passed ?')}</li>
                    ) : survey.academic_background?.language?.gre_isPassed === 'X' &&
                      survey.academic_background?.language?.gre_test_date === '' ? (
                        <li>GRE Test Date not given</li>
                    ) : null}
                    {survey.academic_background?.language?.gmat_isPassed === '-' ||
                    !survey.academic_background?.language?.gmat_isPassed ? (
                        <li>{t('Do you need GMAT Test')}?</li>
                    ) : survey.academic_background?.language?.gmat_isPassed === 'X' &&
                      differenceInDays(
                          new Date(),
                          new Date(
                              (survey.academic_background?.language
                                  ?.gmat_test_date ?? new Date()) as string | number | Date
                          )
                      ) > 1 ? (
                        <li>{t('GMAT Test passed ?')}</li>
                    ) : survey.academic_background?.language?.gmat_isPassed === 'X' &&
                      survey.academic_background?.language?.gmat_test_date === '' ? (
                        <li>GMAT Test Date not given</li>
                    ) : null}
                </Card>
            ) : null}
        </>
    );
};

export default SurveyMissingFieldsAlerts;
