import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Divider
} from '@mui/material';

import DEMO from '../../store/constant';
import Loading from '../../components/Loading/Loading';
// import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { getCRMLeadQuery } from '../../api/query';

const LeadPage = () => {
    const { leadId } = useParams();

    const { data, isLoading } = useQuery(getCRMLeadQuery(leadId));
    const lead = data?.data?.data || [];

    if (isLoading) {
        return <Loading />;
    }

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1.5 }}>
                    <Link
                        color="inherit"
                        component="a"
                        href={`${DEMO.DASHBOARD_LINK}`}
                        underline="hover"
                    >
                        {appConfig.companyName}
                    </Link>
                    <Link
                        color="inherit"
                        component="a"
                        href="/crm"
                        underline="hover"
                    >
                        CRM
                    </Link>
                    <Link
                        color="inherit"
                        component="a"
                        href="/crm/leads"
                        underline="hover"
                    >
                        Leads
                    </Link>
                    <Typography color="text.primary">
                        {lead.fullName}
                    </Typography>
                </Breadcrumbs>
            </Box>

            {lead && Object.keys(lead).length > 0 ? (
                <Grid container spacing={3}>
                    {/* Personal Information */}
                    <Grid item md={6} xs={12}>
                        <Card>
                            <CardContent>
                                <Typography
                                    color="primary"
                                    gutterBottom
                                    variant="h6"
                                >
                                    Personal Information
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Full Name
                                    </Typography>
                                    <Typography
                                        fontWeight="medium"
                                        variant="body1"
                                    >
                                        {lead.fullName}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Gender
                                    </Typography>
                                    <Typography variant="body1">
                                        {lead.gender}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Role
                                    </Typography>
                                    <Typography variant="body1">
                                        {lead.applicantRole}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Status
                                    </Typography>
                                    <Chip
                                        color={
                                            lead.status === 'new'
                                                ? 'primary'
                                                : 'default'
                                        }
                                        label={lead.status}
                                        size="small"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Contact Information */}
                    <Grid item md={6} xs={12}>
                        <Card>
                            <CardContent>
                                <Typography
                                    color="primary"
                                    gutterBottom
                                    variant="h6"
                                >
                                    Contact Information
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Email
                                    </Typography>
                                    <Typography variant="body1">
                                        {lead.email}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Phone
                                    </Typography>
                                    <Typography variant="body1">
                                        {lead.phone}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Preferred Contact
                                    </Typography>
                                    <Typography variant="body1">
                                        {lead.preferredContact}
                                    </Typography>
                                </Box>
                                {lead.lineId && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            LINE ID
                                        </Typography>
                                        <Typography variant="body1">
                                            {lead.lineId}
                                        </Typography>
                                    </Box>
                                )}
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Source
                                    </Typography>
                                    <Typography variant="body1">
                                        {lead.source}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Educational Background */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography
                                    color="primary"
                                    gutterBottom
                                    variant="h6"
                                >
                                    Educational Background
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item md={4} xs={12}>
                                        <Typography
                                            fontWeight="bold"
                                            variant="subtitle2"
                                        >
                                            High School
                                        </Typography>
                                        <Typography variant="body2">
                                            {lead.highschoolName}
                                        </Typography>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            GPA: {lead.highschoolGPA}
                                        </Typography>
                                    </Grid>
                                    <Grid item md={4} xs={12}>
                                        <Typography
                                            fontWeight="bold"
                                            variant="subtitle2"
                                        >
                                            Bachelor&apos;s Degree
                                        </Typography>
                                        <Typography variant="body2">
                                            {lead.bachelorSchool}
                                        </Typography>
                                        <Typography variant="body2">
                                            {lead.bachelorProgramName}
                                        </Typography>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            GPA: {lead.bachelorGPA}
                                        </Typography>
                                    </Grid>
                                    <Grid item md={4} xs={12}>
                                        <Typography
                                            fontWeight="bold"
                                            variant="subtitle2"
                                        >
                                            Master&apos;s Degree
                                        </Typography>
                                        <Typography variant="body2">
                                            {lead.masterSchool}
                                        </Typography>
                                        <Typography variant="body2">
                                            {lead.masterProgramName}
                                        </Typography>
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            GPA: {lead.masterGPA}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Divider sx={{ my: 2 }} />
                                <Box>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Highest Education
                                    </Typography>
                                    <Typography
                                        fontWeight="medium"
                                        variant="body1"
                                    >
                                        {lead.highestEducation}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Intended Programs */}
                    <Grid item md={6} xs={12}>
                        <Card>
                            <CardContent>
                                <Typography
                                    color="primary"
                                    gutterBottom
                                    variant="h6"
                                >
                                    Intended Programs
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Target Universities
                                    </Typography>
                                    <Typography variant="body1">
                                        {lead.intendedPrograms}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Direction
                                    </Typography>
                                    <Typography variant="body1">
                                        {lead.intendedDirection}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Program Level
                                    </Typography>
                                    <Typography variant="body1">
                                        {lead.intendedProgramLevel}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Start Time
                                    </Typography>
                                    <Typography variant="body1">
                                        {lead.intendedStartTime}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Language Skills */}
                    <Grid item md={6} xs={12}>
                        <Card>
                            <CardContent>
                                <Typography
                                    color="primary"
                                    gutterBottom
                                    variant="h6"
                                >
                                    Language Skills
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        English Level
                                    </Typography>
                                    <Typography variant="body1">
                                        {lead.englishLevel}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        German Level
                                    </Typography>
                                    <Typography variant="body1">
                                        {lead.germanLevel || 'N/A'}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Work Experience */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography
                                    color="primary"
                                    gutterBottom
                                    variant="h6"
                                >
                                    Work Experience
                                </Typography>
                                <Typography
                                    sx={{ whiteSpace: 'pre-line' }}
                                    variant="body1"
                                >
                                    {lead.workExperience}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Additional Information */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography
                                    color="primary"
                                    gutterBottom
                                    variant="h6"
                                >
                                    Additional Information
                                </Typography>
                                {lead.additionalInfo && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            fontWeight="bold"
                                            variant="subtitle2"
                                        >
                                            Additional Info
                                        </Typography>
                                        <Typography variant="body1">
                                            {lead.additionalInfo}
                                        </Typography>
                                    </Box>
                                )}
                                {lead.reasonsToStudyAbroad && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            fontWeight="bold"
                                            variant="subtitle2"
                                        >
                                            Reasons to Study Abroad
                                        </Typography>
                                        <Typography variant="body1">
                                            {lead.reasonsToStudyAbroad}
                                        </Typography>
                                    </Box>
                                )}
                                <Box
                                    sx={{
                                        mt: 2,
                                        display: 'flex',
                                        gap: 1,
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Created:{' '}
                                        {new Date(
                                            lead.createdAt
                                        ).toLocaleDateString()}
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        variant="body2"
                                    >
                                        Updated:{' '}
                                        {new Date(
                                            lead.updatedAt
                                        ).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            ) : (
                <Typography color="text.secondary" variant="body1">
                    Loading lead information...
                </Typography>
            )}
        </Box>
    );
};

export default LeadPage;
