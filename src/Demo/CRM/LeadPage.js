import { useParams } from 'react-router-dom';

const LeadPage = () => {
    const { leadId } = useParams();

    return (
        <div>
            <h1>Lead Details</h1>
            <p>Displaying details for lead ID: {leadId}</p>
            {/* Additional lead details and components can be added here */}
        </div>
    );
};

export default LeadPage;
