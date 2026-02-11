import { Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AssignEssayWritersPage from './AssignEssayWritersPage';
import { is_TaiGer_role } from '@taiger-common/core';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../../config';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import { useActiveThreads } from '@hooks/useActiveThreads';
import { file_category_const } from '@pages/Utils/util_functions';
import Loading from '@components/Loading/Loading';

const AssignEssayWriters = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { data, isLoading } = useActiveThreads({
        hasOutsourcedUserId: false,
        hasMessages: true,
        isFinalVersion: false,
        file_type: file_category_const.essay_required
    });

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    console.log(data);

    return (
        <Box>
            <BreadcrumbsNavigation
                items={[
                    { label: appConfig.companyName, link: DEMO.DASHBOARD_LINK },
                    {
                        label: t('Assign Essay Writer', { ns: 'common' })
                    }
                ]}
            />
            {isLoading ? (
                <Loading />
            ) : (
                <AssignEssayWritersPage essayDocumentThreads={data} />
            )}
        </Box>
    );
};

export default AssignEssayWriters;
