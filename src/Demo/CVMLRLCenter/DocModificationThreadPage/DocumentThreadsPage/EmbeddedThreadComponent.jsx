import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMessagThreadQuery } from '../../../../api/query';
import Loading from '../../../../components/Loading/Loading';
import ErrorPage from '../../../Utils/ErrorPage';
import DocModificationThreadPage from '../DocModificationThreadPage';

export const EmbeddedThreadComponent = () => {
    const { documentsthreadId } = useParams();
    const { data, isLoading, error } = useQuery(
        getMessagThreadQuery(documentsthreadId)
    );

    if (isLoading) {
        return <Loading />;
    }
    if (error) {
        return <ErrorPage />;
    }
    const thread = data.data?.data;
    const similarThreads = data.data?.similarThreads;

    return (
        <DocModificationThreadPage
            isEmbedded={true}
            similarThreads={similarThreads}
            threadProps={thread}
        />
    );
};
