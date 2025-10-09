import React, { useMemo } from 'react';
import { Card, Chip, Link } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { MuiDataGrid } from '../MuiDataGrid';
import DEMO from '../../store/constant';

const transform = (students = []) => {
    const rows = [];

    for (const student of students) {
        const apps = Array.isArray(student?.applications)
            ? student.applications
            : [];

        const finalEnrolments = apps
            .filter((a) => a?.finalEnrolment === true)
            .map((a) => {
                // Prefer programId object; fallback to program[0]
                const p =
                    (a && a.programId) ||
                    (Array.isArray(a?.program) ? a.program[0] : null);

                return {
                    key: a?._id || p?._id || Math.random().toString(36),
                    school: p?.school || '',
                    program_name: p?.program_name || '',
                    degree: p?.degree || '',
                    application_year: a?.application_year || ''
                };
            });

        if (finalEnrolments.length === 0) continue;

        rows.push({
            id: student?._id?.toString(),
            firstname_lastname:
                `${student?.firstname || ''} ${student?.lastname || ''}`.trim(),
            finalEnrolments,
            finalEnrolmentsCount: finalEnrolments.length,
            student
        });
    }

    return rows;
};

const FinalDecisionOverview = ({ students }) => {
    const { t } = useTranslation();

    const columns = useMemo(() => {
        return [
            {
                field: 'firstname_lastname',
                headerName: t('First-/ Last Name', { ns: 'common' }),
                align: 'left',
                headerAlign: 'left',
                width: 180,
                renderCell: (params) => {
                    const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                        params.row.id,
                        DEMO.PROFILE_HASH
                    )}`;
                    return (
                        <Link
                            component={LinkDom}
                            target="_blank"
                            title={params.value}
                            to={linkUrl}
                            underline="hover"
                        >
                            {params.value}
                        </Link>
                    );
                }
            },
            {
                field: 'finalEnrolmentsCount',
                headerName: t('Final Enrolments', { ns: 'common' }),
                width: 120
            },
            {
                field: 'finalEnrolments',
                headerName: t('Program / University', { ns: 'common' }),
                flex: 1,
                minWidth: 360,
                sortable: false,
                renderCell: (params) => {
                    const items = params.value || [];
                    if (!items.length) return '-';
                    return (
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 6
                            }}
                        >
                            {items.map((it) => (
                                <Chip
                                    key={it.key}
                                    label={`${it.school} - ${it.program_name}${it.degree ? ` (${it.degree})` : ''}`}
                                    size="small"
                                />
                            ))}
                        </div>
                    );
                }
            }
        ];
    }, [t]);

    const rows = transform(students);

    return (
        <Card>
            <MuiDataGrid columns={columns} rows={rows} />
        </Card>
    );
};

export default FinalDecisionOverview;
