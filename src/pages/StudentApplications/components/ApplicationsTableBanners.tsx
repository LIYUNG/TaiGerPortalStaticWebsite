import Banner from '@components/Banner/Banner';
import DEMO from '@store/constant';
import { appConfig } from '../../../config';

const ApplicationsTableBanners = () => (
    <>
        <Banner
            ReadOnlyMode={true}
            bg="primary"
            link_name=""
            notification_key={undefined}
            removeBanner={null}
            text={`${appConfig.companyName} Portal 網站上的學程資訊主要為管理申請進度為主，學校學程詳細資訊仍以學校網站為主。`}
            title="info"
            to={`${DEMO.BASE_DOCUMENTS_LINK}`}
        />
        <Banner
            ReadOnlyMode={true}
            bg="secondary"
            link_name=""
            notification_key={undefined}
            removeBanner={null}
            text="請選擇要申請的學程打在 Decided: Yes，不要申請打的 No。"
            title="warning"
            to={`${DEMO.BASE_DOCUMENTS_LINK}`}
        />
        <Banner
            ReadOnlyMode={true}
            bg="danger"
            link_name=""
            notification_key={undefined}
            removeBanner={null}
            text="請選擇要申請的學程打在 Submitted: Submitted，若想中斷申請請告知顧問，或是 選擇 Withdraw (如果東西都已準備好且解鎖)"
            title="warning"
            to={`${DEMO.BASE_DOCUMENTS_LINK}`}
        />
    </>
);

export default ApplicationsTableBanners;
