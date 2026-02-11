import { useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    Stack,
    Typography
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpIcon from '@mui/icons-material/Help';
import { green, grey } from '@mui/material/colors';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_Student } from '@taiger-common/core';

import { putOriginAuthorConfirmedByStudent } from '@api';
import { appConfig } from '../../../../config';

const OriginAuthorStatementBar = ({ thread, theme, user }) => {
    const [openOriginAuthorModal, setOpenOriginAuthorModal] = useState(false);
    const [originAuthorConfirmed, setOriginAuthorConfirmed] = useState(
        thread?.isOriginAuthorDeclarationConfirmedByStudent
    );
    const [isLoading, setIsLoading] = useState(false);
    const [originAuthorCheckboxConfirmed, setOriginAuthorCheckboxConfirmed] =
        useState(false);
    const { t } = useTranslation();

    const postOriginAuthorConfirmed = (checked) => {
        setOriginAuthorConfirmed(checked);
        setIsLoading(true);
        putOriginAuthorConfirmedByStudent(
            thread._id,
            thread.student_id._id,
            originAuthorCheckboxConfirmed
        ).then(
            (resp) => {
                const { success } = resp.data;
                if (success) {
                    setOriginAuthorConfirmed(true);
                }
            },
            () => {}
        );
    };
    const student_name = `${thread.student_id.lastname}${thread.student_id.firstname}`;
    const student_name_zh = `${thread.student_id.lastname_chinese}${thread.student_id.firstname_chinese}`;

    return (
        <Box>
            <Stack alignItems="center" direction="row" mt={1} spacing={1}>
                {originAuthorConfirmed ? (
                    <>
                        <CheckCircleIcon
                            size={18}
                            style={{ color: green[500] }}
                            title="Agree"
                        />
                        <Typography variant="body1">
                            {t('confirmDocument', {
                                ns: 'documents',
                                studentName: student_name,
                                studentNameZh: student_name_zh
                            })}
                            <span
                                onClick={() =>
                                    setOpenOriginAuthorModal(
                                        !openOriginAuthorModal
                                    )
                                }
                                style={{
                                    color: theme.palette.primary.main,
                                    cursor: 'pointer'
                                }}
                            >
                                {t('Read More')}
                            </span>
                        </Typography>
                    </>
                ) : (
                    <>
                        <HelpIcon size={18} style={{ color: grey[400] }} />
                        <Typography variant="body1">
                            {t('notConfirmDocument', {
                                ns: 'documents',
                                studentName: student_name,
                                studentNameZh: student_name_zh
                            })}
                            &nbsp;
                            <span
                                onClick={() =>
                                    setOpenOriginAuthorModal(
                                        !openOriginAuthorModal
                                    )
                                }
                                style={{
                                    color: theme.palette.primary.main,
                                    cursor: 'pointer'
                                }}
                            >
                                {t('Read More')}
                            </span>
                        </Typography>
                    </>
                )}
            </Stack>
            <Dialog
                aria-labelledby="modal-orginal-declaration"
                onClose={() => {}}
                open={
                    (thread.file_type === 'Essay' &&
                        is_TaiGer_Student(user) &&
                        !originAuthorConfirmed) ||
                    openOriginAuthorModal
                }
            >
                <DialogTitle>{t('Warning', { ns: 'common' })}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Typography sx={{ my: 2 }} variant="body1">
                            {t('hello-students', {
                                ns: 'common',
                                tenant: appConfig.companyName
                            })}
                        </Typography>
                        <Typography sx={{ my: 2 }} variant="body1">
                            {t('essay-responsibility-declaration-content', {
                                ns: 'common',
                                tenant: appConfig.companyFullName
                            })}
                        </Typography>
                        <Typography sx={{ my: 2 }} variant="body1">
                            {t('essay-responsibility-declaration-signature', {
                                ns: 'common',
                                tenant: appConfig.companyFullName
                            })}
                        </Typography>
                    </DialogContentText>
                    {is_TaiGer_Student(user) ? (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={
                                        originAuthorCheckboxConfirmed ||
                                        thread.isOriginAuthorDeclarationConfirmedByStudent
                                    }
                                    disabled={
                                        thread.isOriginAuthorDeclarationConfirmedByStudent
                                    }
                                    onChange={() =>
                                        setOriginAuthorCheckboxConfirmed(
                                            !originAuthorCheckboxConfirmed
                                        )
                                    }
                                />
                            }
                            label={`${t('i-declare-without-help-of-ai', {
                                ns: 'common',
                                studentFullName: `${student_name} ${student_name_zh}`
                            })}`}
                            sx={{ my: 2 }}
                        />
                    ) : null}
                    <br />
                    {is_TaiGer_Student(user) ? (
                        thread?.isOriginAuthorDeclarationConfirmedByStudent ? (
                            <Button
                                color="primary"
                                fullWidth
                                onClick={() =>
                                    setOpenOriginAuthorModal(
                                        !openOriginAuthorModal
                                    )
                                }
                                sx={{ mr: 2 }}
                                variant="contained"
                            >
                                {t('Close', { ns: 'common' })}
                            </Button>
                        ) : (
                            <Button
                                color="primary"
                                disabled={!originAuthorCheckboxConfirmed}
                                fullWidth
                                onClick={() =>
                                    postOriginAuthorConfirmed(
                                        originAuthorCheckboxConfirmed
                                    )
                                }
                                sx={{ mr: 2 }}
                                variant="contained"
                            >
                                {isLoading ? (
                                    <CircularProgress />
                                ) : (
                                    t('I Agree', { ns: 'common' })
                                )}
                            </Button>
                        )
                    ) : (
                        <Button
                            color="primary"
                            fullWidth
                            onClick={() =>
                                setOpenOriginAuthorModal(!openOriginAuthorModal)
                            }
                            sx={{ mr: 2 }}
                            variant="contained"
                        >
                            {t('Close', { ns: 'common' })}
                        </Button>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default OriginAuthorStatementBar;
