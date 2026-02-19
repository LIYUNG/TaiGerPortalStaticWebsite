import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';

import { TabTitle } from '../Utils/TabTitle';
import { useAuth } from '@components/AuthProvider';
import DEMO from '@store/constant';
import { appConfig } from '../../config';
import { BaseDocumentsTable } from './BaseDocumentsTable';
import { useStudentsAndDocLinks } from '@hooks/useStudentsAndDocLinks';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import Loading from '@components/Loading/Loading';

const AllBaseDocuments = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    const { students, isLoading, isError, error } =
        useStudentsAndDocLinks({ archiv: false });

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    TabTitle(t('All Documents', { ns: 'common' }));

    return (
        <Box>
            <BreadcrumbsNavigation
                items={[
                    { label: appConfig.companyName, link: DEMO.DASHBOARD_LINK },
                    {
                        label: t('All Students', { ns: 'common' }),
                        link: DEMO.DASHBOARD_LINK
                    },
                    {
                        label: t('All Documents', { ns: 'common' })
                    }
                ]}
            />
            {isLoading ? <Loading /> : null}
            {isError ? error?.message : null}

            {!isLoading && !isError ? (
                is_TaiGer_role(user) ? (
                    <BaseDocumentsTable students={students} />
                ) : null
            ) : null}
        </Box>
    );
};

export default AllBaseDocuments;
