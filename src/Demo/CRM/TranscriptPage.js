import { useParams } from 'react-router-dom';

const TranscriptPage = () => {
    const { meetingId } = useParams();

    return (
        <div>
            <h1>Meeting Details</h1>
            <p>Displaying details for lead ID: {meetingId}</p>
            {/* Additional lead details and components can be added here */}
        </div>
    );
};

export default TranscriptPage;
