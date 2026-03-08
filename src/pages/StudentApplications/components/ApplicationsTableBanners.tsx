import { appConfig } from '../../../config';
import { Alert } from '@mui/material';

const ApplicationsTableBanners = () => (
    <>
        <Alert severity="info" data-testid="banner-primary">
            {appConfig.companyName} Portal
            網站上的學程資訊主要為管理申請進度為主，學校學程詳細資訊仍以學校網站為主。
        </Alert>
        <Alert severity="warning" data-testid="banner-secondary">
            請選擇要申請的學程打在 Decided: Yes，不要申請打的 No。
        </Alert>
        <Alert severity="warning" data-testid="banner-danger">
            請選擇要申請的學程打在 Submitted:
            Submitted，若想中斷申請請告知顧問，或是 選擇 Withdraw
            (如果東西都已準備好且解鎖)
        </Alert>
    </>
);

export default ApplicationsTableBanners;
