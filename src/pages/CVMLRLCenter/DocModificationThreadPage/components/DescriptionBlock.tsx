import { Link as LinkDom } from 'react-router-dom';
import { Stack, Box, Typography, Button, useTheme } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import { is_TaiGer_role } from '@taiger-common/core';
import type {
    IDocumentthreadPopulated,
    ITemplateWithId
} from '@taiger-common/model';

import { useAuth } from '@components/AuthProvider';
import DEMO from '@store/constant';
import { BASE_URL } from '@/api';
import { appConfig } from '../../../../config';

// What DocModificationThreadPage actually threads down here is an entry of the
// static `templatelist` (name/prop/alias), not a persisted ITemplateWithId. The
// intermediate components still declare the prop as ITemplateWithId, so accept
// both shapes and narrow on the fields we read.
interface TemplateListEntry {
    name: string;
    prop: string;
    alias: string;
}

interface DescriptionBlockProps {
    thread: IDocumentthreadPopulated;
    template_obj: ITemplateWithId | TemplateListEntry | null;
    documentsthreadId: string;
}

const DescriptionBlock = ({
    thread,
    template_obj,
    documentsthreadId
}: DescriptionBlockProps) => {
    const { user } = useAuth();
    const theme = useTheme();
    const { t } = useTranslation();

    const templateProp =
        template_obj && 'prop' in template_obj ? template_obj.prop : '';
    const templateAlias =
        template_obj && 'alias' in template_obj ? template_obj.alias : '';

    return (
        <Stack spacing={2}>
            {template_obj ? (
                <>
                    <Box
                        sx={{
                            p: 1.5,
                            bgcolor: 'info.50',
                            borderLeft: `3px solid ${theme.palette.info.main}`
                        }}
                    >
                        <Typography variant="body2">
                            {thread.file_type === 'CV' ||
                            thread.file_type === 'CV_US'
                                ? t('cv-instructions', { ns: 'cvmlrl' })
                                : t('please-fill-template', {
                                      tenant: appConfig.companyName
                                  })}
                        </Typography>
                    </Box>

                    <Button
                        color="info"
                        component={LinkDom}
                        fullWidth
                        size="small"
                        startIcon={<ArticleIcon />}
                        to={`${DEMO.CV_ML_RL_DOCS_LINK}`}
                        variant="outlined"
                    >
                        View Documentation
                    </Button>

                    <Box>
                        <Typography
                            color="text.secondary"
                            gutterBottom
                            sx={{
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5
                            }}
                            variant="overline"
                        >
                            {t('Download template')}
                        </Typography>
                        <Stack spacing={1}>
                            {templateProp.includes('RL') ||
                            templateAlias.includes('Recommendation') ? (
                                <>
                                    <Button
                                        color="secondary"
                                        component="a"
                                        fullWidth
                                        href={`${BASE_URL}/api/account/files/template/${'RL_academic_survey_lock'}`}
                                        rel="noopener noreferrer"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        target="_blank"
                                        variant="contained"
                                    >
                                        {t('Professor')} Template
                                    </Button>
                                    <Button
                                        color="secondary"
                                        component="a"
                                        fullWidth
                                        href={`${BASE_URL}/api/account/files/template/${`RL_employer_survey_lock`}`}
                                        rel="noopener noreferrer"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        target="_blank"
                                        variant="contained"
                                    >
                                        {t('Supervisor')} Template
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        color="secondary"
                                        component="a"
                                        fullWidth
                                        href={`${BASE_URL}/api/account/files/template/${templateProp}`}
                                        rel="noopener noreferrer"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        target="_blank"
                                        variant="contained"
                                    >
                                        Download Template
                                    </Button>
                                    {user != null && is_TaiGer_role(user) && (
                                        <Button
                                            color="info"
                                            component={LinkDom}
                                            fullWidth
                                            size="small"
                                            to={`${DEMO.DOCUMENT_MODIFICATION_INPUT_LINK(
                                                documentsthreadId
                                            )}`}
                                            variant="outlined"
                                        >
                                            Editor Helper
                                        </Button>
                                    )}
                                </>
                            )}
                        </Stack>
                    </Box>
                </>
            ) : (
                <Box
                    sx={{
                        p: 1.5,
                        borderLeft: `3px solid ${theme.palette.grey[400]}`
                    }}
                >
                    <Typography variant="body2">
                        {thread.file_type === 'Portfolio'
                            ? 'Please upload the portfolio in Microsoft Word form here so that your Editor can help you for the text modification'
                            : thread.file_type === 'Supplementary_Form'
                              ? '請填好這個 program 的 Supplementary Form，並在這討論串夾帶該檔案 (通常為 .xls, xlsm, .pdf 檔) 上傳。'
                              : thread.file_type === 'Curriculum_Analysis'
                                ? '請填好這個 program 的 Curriculum Analysis，並在這討論串夾帶該檔案 (通常為 .xls, xlsm, .pdf 檔) 上傳。'
                                : '-'}
                    </Typography>
                </Box>
            )}
        </Stack>
    );
};

export default DescriptionBlock;
