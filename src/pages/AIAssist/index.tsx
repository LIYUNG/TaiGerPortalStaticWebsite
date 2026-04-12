import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { TabTitle } from '../Utils/TabTitle';
import AIAssistPage from './AIAssistPage';

const AIAssist = (): JSX.Element => {
    const { t } = useTranslation();

    TabTitle(t('TaiGer AI', { ns: 'common' }));

    return (
        <Box data-testid="ai_assist">
            <AIAssistPage />
        </Box>
    );
};

export default AIAssist;
