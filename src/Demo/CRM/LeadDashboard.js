import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import i18next from 'i18next';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { is_TaiGer_role } from '@taiger-common/core';
import { request } from '../../api/request';

const LeadDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        request
            .get('/api/crm/leads')
            .then((data) => {
                setLeads(data?.data?.data || []);
            })
            .catch((error) => {
                console.error('Failed to fetch leads:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const columns = [
        {
            accessorKey: 'fullName',
            header: 'Full Name',
            size: 200
        },
        {
            accessorKey: 'email',
            header: 'Email',
            size: 250
        },
        {
            accessorKey: 'lineId',
            header: 'Line ID',
            size: 150
        },
        {
            accessorKey: 'source',
            header: 'Source',
            size: 150
        }
    ];

    TabTitle(i18next.t('Leads', { ns: 'common' }));

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
                    {i18next.t('Leads', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>

            <Box sx={{ mt: 2 }}>
                <MaterialReactTable
                    columns={columns}
                    data={leads}
                    enableSorting
                    muiTableBodyRowProps={({ row }) => ({
                        onClick: () => {
                            navigate(`/crm/leads/${row.original.id}`);
                        },
                        sx: {
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }
                    })}
                    state={{ isLoading }}
                />
            </Box>
        </Box>
    );
};

export default LeadDashboard;
