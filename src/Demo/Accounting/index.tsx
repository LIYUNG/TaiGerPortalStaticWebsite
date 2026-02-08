import { useMemo } from 'react';
import { Navigate, Link as LinkDom } from 'react-router-dom';
import { Box, Card, Typography } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

import ErrorPage from '../Utils/ErrorPage';
import { getTeamMembersQuery } from '../../api/query';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { appConfig } from '../../config';
import { useAuth } from '../../components/AuthProvider';
import Loading from '../../components/Loading/Loading';
import { BreadcrumbsNavigation } from '../../components/BreadcrumbsNavigation/BreadcrumbsNavigation';

const Accounting = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    // Fetch team members using React Query
    const {
        data: response,
        isLoading,
        error,
        isError
    } = useQuery(getTeamMembersQuery());

    // Memoize filtered lists
    const agents = useMemo(() => {
        if (!response?.data?.data) return [];
        return response.data.data.filter((member) => member.role === 'Agent');
    }, [response]);

    const editors = useMemo(() => {
        if (!response?.data?.data) return [];
        return response.data.data.filter((member) => member.role === 'Editor');
    }, [response]);

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    TabTitle(`${appConfig.companyName} Accounting`);

    if (isLoading) {
        return <Loading />;
    }

    if (isError || !response?.data?.success) {
        const res_status = response?.status || (error?.response?.status ?? 500);
        return <ErrorPage res_status={res_status} />;
    }

    return (
        <Box>
            <BreadcrumbsNavigation
                items={[
                    { label: appConfig.companyName, link: DEMO.DASHBOARD_LINK },
                    {
                        label: t('tenant-team', {
                            ns: 'common',
                            tenant: appConfig.companyName
                        }),
                        link: DEMO.DASHBOARD_LINK
                    },
                    {
                        label: t('tenant-accounting', {
                            ns: 'common',
                            tenant: appConfig.companyName
                        })
                    }
                ]}
            />
            <Card>
                <Typography variant="h5">
                    {t('Agents', {
                        ns: 'common'
                    })}
                    :
                </Typography>
                {agents.map((agent, i) => (
                    <Typography fontWeight="bold" key={i}>
                        <LinkDom
                            to={`${DEMO.ACCOUNTING_USER_ID_LINK(agent._id.toString())}`}
                        >
                            {agent.firstname} {agent.lastname}{' '}
                        </LinkDom>
                    </Typography>
                ))}
                <Typography variant="h5">
                    {t('Editors', {
                        ns: 'common'
                    })}
                    :
                </Typography>
                {editors.map((editor, i) => (
                    <Typography fontWeight="bold" key={i}>
                        <LinkDom
                            to={`${DEMO.ACCOUNTING_USER_ID_LINK(editor._id.toString())}`}
                        >
                            {editor.firstname} {editor.lastname}{' '}
                        </LinkDom>
                    </Typography>
                ))}
            </Card>
        </Box>
    );
};

export default Accounting;
