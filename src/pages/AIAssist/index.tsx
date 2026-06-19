import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Outlet, useMatch } from 'react-router-dom';

import { TabTitle } from '../Utils/TabTitle';
import AIAssistPage from './AIAssistPage';

const AIAssist = (): JSX.Element => {
    const { t } = useTranslation();
    const isIndexRoute = Boolean(useMatch('/ai-assist'));

    TabTitle(t('TaiGer AI', { ns: 'common' }));

    if (isIndexRoute) {
        // Outlet renders the index child: <Navigate to="portfolio" replace />
        return <Outlet />;
    }

    return (
        <Box data-testid="ai_assist">
            <AIAssistPage />
        </Box>
    );
};

export default AIAssist;
