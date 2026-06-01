import { Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { is_TaiGer_role } from '@taiger-common/core';
import { useTranslation } from 'react-i18next';

import CVMLRLOverviewPaginated from '../CVMLRLCenter/CVMLRLOverviewPaginated';
import { TabTitle } from '../Utils/TabTitle';
import {
    AGENT_SUPPORT_DOCUMENTS_A,
    FILE_TYPE_E
} from '../Utils/util_functions';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';

// This page handles the agent-support docs (always shown for supervised
// students) plus essays — but an essay only belongs here when the viewer is the
// outsourced essay writer, so Essay is excluded unless outsourced to the viewer.
const SUPPORT_DOC_FILE_TYPES = [
    FILE_TYPE_E.essay_required,
    ...AGENT_SUPPORT_DOCUMENTS_A
].join(',');
const ESSAY_ONLY_IF_OUTSOURCED = FILE_TYPE_E.essay_required;

const AgentSupportDocuments = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    if (!user || !is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    TabTitle(t('Agent Support Documents', { ns: 'common' }));

    return (
        <Box data-testid="cvmlrlcenter_component">
            <BreadcrumbsNavigation
                items={[
                    { label: appConfig.companyName, link: DEMO.DASHBOARD_LINK },
                    {
                        label: t('My Students', { ns: 'common' }),
                        link: DEMO.DASHBOARD_LINK
                    },
                    {
                        label: t('Agent Support Documents', { ns: 'common' })
                    }
                ]}
            />
            <CVMLRLOverviewPaginated
                excludeFileType={ESSAY_ONLY_IF_OUTSOURCED}
                fileType={SUPPORT_DOC_FILE_TYPES}
                userId={user._id.toString()}
            />
        </Box>
    );
};

export default AgentSupportDocuments;
