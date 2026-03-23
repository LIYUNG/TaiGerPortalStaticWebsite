import { Link as LinkDom } from 'react-router-dom';
import { Box, Link, TableCell, TableRow, Typography } from '@mui/material';

import { convertDate } from '@utils/contants';
import DEMO from '@store/constant';
import type { IStudentResponse } from '@taiger-common/model';

const BaseDocumentCheckingTasks = ({
    student
}: {
    student: IStudentResponse;
}) => {
    return (
        <>
            {/* check program ready to be submitted */}
            {student.profile?.map(
                (file, i) =>
                    file.status === 'uploaded' && (
                        <TableRow
                            key={i}
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider'
                            }}
                        >
                            <TableCell sx={{ minWidth: 120 }}>
                                <Link
                                    component={LinkDom}
                                    to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                        student._id.toString(),
                                        DEMO.PROFILE_HASH
                                    )}`}
                                >
                                    <b>
                                        {student.firstname} {student.lastname}
                                    </b>
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.25
                                    }}
                                >
                                    <Typography component="span">
                                        {file.name}
                                    </Typography>
                                    <Typography
                                        component="span"
                                        variant="subtitle2"
                                        color="text.secondary"
                                    >
                                        {convertDate(file.updatedAt)}
                                    </Typography>
                                </Box>
                            </TableCell>
                        </TableRow>
                    )
            )}
        </>
    );
};

export default BaseDocumentCheckingTasks;
