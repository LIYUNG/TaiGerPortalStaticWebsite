import { Link as LinkDom } from 'react-router-dom';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import Loading from '@components/Loading/Loading';
import { AllCoursesTable } from './AllCoursesTable';
import DEMO from '@store/constant';
import { appConfig } from '../../../config';
import i18next from 'i18next';
import { useAllCourses } from '@hooks/useAllCourses';

const AllCourses = () => {
    const { data: courses, isLoading } = useAllCourses();

    return (
        <>
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.INTERNAL_WIDGET_COURSE_ANALYSER_LINK}`}
                    underline="hover"
                >
                    {i18next.t('Course Analyser', { ns: 'common' })}
                </Link>
                <Typography color="text.primary">
                    {i18next.t('All Courses DB', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            {isLoading ? <Loading /> : null}
            {!isLoading ? (
                <AllCoursesTable courses={courses} isLoading={isLoading} />
            ) : null}
        </>
    );
};

export default AllCourses;
