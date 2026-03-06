import {
    Box,
    Breadcrumbs,
    Button,
    CircularProgress,
    Link,
    TextField,
    Typography
} from '@mui/material';
import { Link as LinkDom, useNavigate, useParams } from 'react-router-dom';
import { appConfig } from '../../../config';
import DEMO from '@store/constant';
import i18next from 'i18next';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createCourse, updateCourse } from '@/api';
import { useSnackBar } from '@contexts/use-snack-bar';
import { queryClient } from '@/api';
import { getCoursessQuery } from '@/api/query';

interface CourseFormProps {
    mode: 'create' | 'edit';
}

const CourseForm = ({ mode }: CourseFormProps) => {
    const { courseId } = useParams<{ courseId?: string }>();
    const { data } = useQuery({
        ...getCoursessQuery(courseId),
        enabled: mode === 'edit' && !!courseId
    });
    const [course, setCourse] = useState({
        all_course_chinese: data?.data?.all_course_chinese || '',
        all_course_english: data?.data?.all_course_english || ''
    });
    const navigate = useNavigate();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();

    const { mutate, isPending } = useMutation({
        mutationFn: mode === 'create' ? createCourse : updateCourse,
        onSuccess: () => {
            setSeverity('success');
            setMessage('Updated program successfully!');
            setOpenSnackbar(true);
            queryClient.invalidateQueries({ queryKey: ['all-courses/all'] });
            navigate(DEMO.COURSE_DATABASE);
        },
        onError: (error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCourse((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (mode === 'create') {
            mutate({ payload: course });
        } else {
            mutate({ courseId, payload: course });
        }
    };

    const isCreate = mode === 'create';

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
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.COURSE_DATABASE}`}
                    underline="hover"
                >
                    {i18next.t('All Courses DB', { ns: 'common' })}
                </Link>
                <Typography color="text.primary">
                    {isCreate
                        ? i18next.t('New Course', { ns: 'common' })
                        : i18next.t('Edit Course', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <Box>
                <Typography sx={{ mb: 2 }} variant="h5">
                    {isCreate
                        ? i18next.t('New Course', { ns: 'common' })
                        : i18next.t('Edit Course', { ns: 'common' })}
                </Typography>
                <Typography sx={{ mb: 2 }} variant="body1">
                    {isCreate
                        ? i18next.t('Create a new course', { ns: 'common' })
                        : i18next.t('Edit course details', { ns: 'common' })}
                </Typography>
                <form onSubmit={(e) => onSubmit(e)}>
                    <TextField
                        fullWidth
                        id="all_course_chinese"
                        inputProps={{ maxLength: 200 }}
                        label={i18next.t('Course Name in Chinese', {
                            ns: 'common'
                        })}
                        name="all_course_chinese"
                        onChange={handleChange}
                        placeholder="物理"
                        value={course.all_course_chinese}
                    />
                    <TextField
                        fullWidth
                        id="all_course_english"
                        inputProps={{ maxLength: 200 }}
                        label={i18next.t('Course Name in English', {
                            ns: 'common'
                        })}
                        name="all_course_english"
                        onChange={handleChange}
                        placeholder="Physics"
                        sx={{ my: 1 }}
                        value={course.all_course_english}
                    />
                    <Button
                        disabled={
                            course.all_course_chinese === '' ||
                            course.all_course_english === ''
                        }
                        startIcon={
                            isPending ? <CircularProgress size={20} /> : null
                        }
                        type="submit"
                        variant="contained"
                    >
                        {isCreate
                            ? i18next.t('Create', { ns: 'common' })
                            : i18next.t('Update', { ns: 'common' })}
                    </Button>
                    {!isCreate && (
                        <Button
                            color="primary"
                            component={LinkDom}
                            to={`${DEMO.COURSE_DATABASE}`}
                            variant="outlined"
                        >
                            {i18next.t('Back', { ns: 'common' })}
                        </Button>
                    )}
                </form>
            </Box>
        </>
    );
};

export default CourseForm;
