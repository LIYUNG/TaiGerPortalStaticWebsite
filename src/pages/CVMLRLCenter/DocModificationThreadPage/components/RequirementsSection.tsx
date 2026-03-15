import { Link as LinkDom } from 'react-router-dom';
import {
    Typography,
    Button,
    Card,
    Box,
    IconButton,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditIcon from '@mui/icons-material/Edit';

import { is_TaiGer_AdminAgent } from '@taiger-common/core';
import type {
    IUserWithId,
    IDocumentthreadPopulated,
    ITemplateWithId,
    IProgramWithId
} from '@taiger-common/model';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';

import DEMO from '@store/constant';
import RequirementsBlock from './RequirementsBlock';

interface RequirementsSectionProps {
    thread: IDocumentthreadPopulated;
    user: IUserWithId;
    isGeneralRL: boolean;
    template_obj: ITemplateWithId | null;
    requirementsDialogOpen: boolean;
    setRequirementsDialogOpen: (open: boolean) => void;
}

const RequirementsSection = ({
    thread,
    user,
    isGeneralRL,
    template_obj,
    requirementsDialogOpen,
    setRequirementsDialogOpen
}: RequirementsSectionProps) => {
    const theme = useTheme();
    const { t } = useTranslation();

    return (
        <>
            <Card
                sx={{
                    borderRadius: 2,
                    boxShadow: theme.shadows[1],
                    border: `2px solid ${theme.palette.warning.main}`,
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ p: 1.5 }}>
                    <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="space-between"
                    >
                        <Stack alignItems="center" direction="row" spacing={1}>
                            <WarningAmberIcon sx={{ fontSize: 20 }} />
                            <Typography fontWeight="700" variant="body1">
                                {t('Requirements', { ns: 'translation' })}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5}>
                            {is_TaiGer_AdminAgent(user) &&
                                thread.program_id && (
                                    <Tooltip title="Update Requirements">
                                        <IconButton
                                            component={LinkDom}
                                            size="small"
                                            sx={{
                                                color: 'white',
                                                p: 0.5,
                                                '&:hover': {
                                                    bgcolor:
                                                        'rgba(255,255,255,0.1)'
                                                }
                                            }}
                                            target="_blank"
                                            to={`${DEMO.SINGLE_PROGRAM_LINK(
                                                (thread.program_id as IProgramWithId)._id.toString()
                                            )}`}
                                        >
                                            <EditIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            <Button
                                onClick={() => setRequirementsDialogOpen(true)}
                                size="small"
                                sx={{
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    minWidth: 'auto',
                                    px: 1.5,
                                    py: 0.5,
                                    borderColor: 'rgba(255,255,255,0.5)',
                                    '&:hover': {
                                        borderColor: 'white',
                                        bgcolor: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                                variant="outlined"
                            >
                                Read More
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
                <Box
                    sx={{
                        p: 2,
                        maxHeight: 200,
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                            width: '6px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: theme.palette.divider,
                            borderRadius: '3px'
                        }
                    }}
                >
                    <RequirementsBlock
                        isGeneralRL={isGeneralRL}
                        thread={thread}
                    />
                </Box>
            </Card>

            <Dialog
                maxWidth="md"
                onClose={() => setRequirementsDialogOpen(false)}
                open={requirementsDialogOpen}
                scroll="paper"
            >
                <DialogTitle>
                    <Stack alignItems="center" direction="row" spacing={1.5}>
                        <WarningAmberIcon
                            color="warning"
                            sx={{ fontSize: 28 }}
                        />
                        <Typography fontWeight="700" variant="h5">
                            {t('Requirements', { ns: 'translation' })}
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    <RequirementsBlock
                        template_obj={template_obj}
                        thread={thread}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setRequirementsDialogOpen(false)}
                        variant="contained"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RequirementsSection;
