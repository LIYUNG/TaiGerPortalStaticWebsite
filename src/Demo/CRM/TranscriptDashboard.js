import { Navigate } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import i18next from 'i18next';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';

import { is_TaiGer_role } from '@taiger-common/core';
import { useEffect, useState } from 'react';

import { request } from '../../api/request';

const TranscriptDashboard = () => {
    const { user } = useAuth();
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    // Temporory workaround to fetch transcripts
    // TODO: implement actual/proper API call to fetch transcripts with UseQuery
    const [transcripts, setTranscripts] = useState([]);

    useEffect(() => {
        request
            .get('/api/crm/meeting-summaries')
            .then((data) => {
                setTranscripts(data?.data?.data || []);
            })
            .catch((error) => {
                console.error('Failed to fetch transcripts:', error);
            });
    }, []);

    TabTitle(i18next.t('CRM Overview', { ns: 'common' }));

    const columns = [
        {
            accessorKey: 'leadFullName',
            header: 'Lead',
            size: 150,
            Cell: ({ row }) => row.original.leadFullName || ''
        },
        {
            accessorKey: 'title',
            header: 'Title',
            size: 200
        },
        {
            accessorKey: 'date',
            header: 'Date',
            size: 200,
            Cell: ({ cell }) => {
                const date = new Date(cell.getValue());
                return date.toLocaleString();
            }
        }
    ];

    return (
        <Box data-testid="student_overview">
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component="a"
                    href={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Link
                    color="inherit"
                    component="a"
                    href={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {i18next.t('CRM', { ns: 'common' })}
                </Link>
                <Typography color="text.primary">
                    {i18next.t('Meetings', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <Box sx={{ mt: 2 }}>
                <Typography gutterBottom variant="h4">
                    {i18next.t('CRM Overview', { ns: 'common' })}
                </Typography>
                <Typography sx={{ mb: 2 }} variant="body1">
                    {i18next.t('Transcript Summaries', { ns: 'common' })}
                </Typography>
                <MaterialReactTable
                    columns={columns}
                    data={transcripts}
                    initialState={{
                        density: 'compact',
                        pagination: { pageSize: 10 }
                    }}
                    positionToolbarAlertBanner="bottom"
                />
            </Box>
        </Box>
    );
};

export default TranscriptDashboard;
