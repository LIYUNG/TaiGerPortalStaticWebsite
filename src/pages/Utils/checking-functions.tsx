import Linkify from 'react-linkify';
import { Link, Typography } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import {
    IUserAcademicBackground,
    IUserApplicationPreference
} from '@taiger-common/model';

export const HighlightText = ({
    text,
    highlight
}: {
    text: string;
    highlight: string;
}) => {
    if (!highlight) return text;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
            <Typography component="span" key={i} sx={{ fontWeight: 'bold' }}>
                {part}
            </Typography>
        ) : (
            part
        )
    );
};

// TODO test
export const LinkableNewlineText = ({
    text
}: {
    text: string;
}): JSX.Element => {
    const textStyle = {
        wordBreak: 'break-all',
        whiteSpace: 'pre-line' // Preserve newlines and wrap text
    } as const;
    return (
        <div style={textStyle}>
            <Linkify
                componentDecorator={(decoratedHref, decoratedText, key) => (
                    <Link
                        component={LinkDom}
                        key={key}
                        target="_blank"
                        to={decoratedHref}
                        underline="hover"
                    >
                        {decoratedText}
                    </Link>
                )}
            >
                {text}
            </Linkify>
        </div>
    );
};

export const MissingSurveyFieldsListArray = ({
    academic_background,
    application_preference
}: {
    academic_background: IUserAcademicBackground;
    application_preference: IUserApplicationPreference;
}) => {
    const missingFields = [];
    // Check academic background fields
    if (academic_background?.university) {
        const uni = academic_background.university;

        if (!uni.attended_high_school) {
            missingFields.push('High School Name');
        }

        if (
            !uni.high_school_isGraduated ||
            uni.high_school_isGraduated === '-'
        ) {
            missingFields.push('High School graduate status');
        }

        if (
            !academic_background.university.isGraduated ||
            academic_background.university.isGraduated === '-'
        ) {
            missingFields.push('Bachelor Degree graduate status');
        }

        if (
            !uni.isGraduated ||
            uni.isGraduated === '-' ||
            ['Yes', 'pending'].includes(uni.isGraduated)
        ) {
            if (uni.attended_university === '') {
                missingFields.push('University Name (Bachelor degree)');
            }
            if (uni.attended_university_program === '') {
                missingFields.push('Program Name / Not study yet');
            }
            if (
                !uni.Has_Exchange_Experience ||
                uni.Has_Exchange_Experience === '-'
            ) {
                missingFields.push('Exchange Student Experience ?');
            }
            if (
                !uni.Has_Internship_Experience ||
                uni.Has_Internship_Experience === '-'
            ) {
                missingFields.push('Internship Experience ?');
            }
            if (
                !uni.Has_Working_Experience ||
                uni.Has_Working_Experience === '-'
            ) {
                missingFields.push('Full-Time Job Experience ?');
            }
            if (
                uni.isGraduated &&
                ['Yes', 'pending'].includes(uni.isGraduated)
            ) {
                // GPA fields are typed as numbers, but legacy records can still
                // carry the placeholder '-', so compare on the string form.
                if (
                    !uni.Highest_GPA_Uni ||
                    String(uni.Highest_GPA_Uni) === '-'
                ) {
                    missingFields.push(
                        'Highest Score GPA of your university program'
                    );
                }
                if (
                    !uni.Passing_GPA_Uni ||
                    String(uni.Passing_GPA_Uni) === '-'
                ) {
                    missingFields.push(
                        'Passing Score GPA of your university program'
                    );
                }
                if (!uni.My_GPA_Uni || String(uni.My_GPA_Uni) === '-') {
                    missingFields.push('My GPA');
                }
            }
        }
    }

    // Check application preference fields
    if (application_preference) {
        // Every mapped key below points at a string / string[] field.
        type PreferenceField = Exclude<
            keyof IUserApplicationPreference,
            'updatedAt'
        >;
        const fieldMappings: {
            key: PreferenceField;
            label: string;
            check?: (value: string | string[] | undefined) => boolean;
        }[] = [
            {
                key: 'expected_application_date',
                label: 'Expected Application Year'
            },
            {
                key: 'expected_application_semester',
                label: 'Expected Application Semester'
            },
            {
                key: 'target_program_language',
                label: 'Target Program Language'
            },
            { key: 'target_degree', label: 'Target Degree Programs' },
            {
                key: 'targetApplicationSubjects',
                label: 'Target Application Subjects',
                check: (value: string | string[] | undefined) =>
                    !value || value.length === 0
            },
            {
                key: 'considered_privat_universities',
                label: 'Considering private universities? (Tuition Fee: ~15000 EURO/year)',
                check: (value: string | string[] | undefined) => value === '-'
            },
            {
                key: 'application_outside_germany',
                label: 'Considering universities outside Germany?',
                check: (value: string | string[] | undefined) => value === '-'
            }
        ];

        fieldMappings.forEach(({ key, label, check }) => {
            if (
                check
                    ? check(application_preference[key])
                    : !application_preference[key]
            ) {
                missingFields.push(label);
            }
        });
    }

    return missingFields;
};
