import React from 'react';
import {
    Typography,
    Button,
    Card,
    Box,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import type { IDocumentthreadPopulated, ITemplateWithId } from '@taiger-common/model';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';

import DescriptionBlock from './DescriptionBlock';

interface InstructionsSectionProps {
    thread: IDocumentthreadPopulated;
    template_obj: ITemplateWithId | null;
    documentsthreadId: string;
    instructionsDialogOpen: boolean;
    setInstructionsDialogOpen: (open: boolean) => void;
}

const InstructionsSection = ({
    thread,
    template_obj,
    documentsthreadId,
    instructionsDialogOpen,
    setInstructionsDialogOpen
}: InstructionsSectionProps) => {
    const theme = useTheme();
    const { t } = useTranslation();

    return (
        <>
            <Card
                sx={{
                    borderRadius: 2,
                    boxShadow: theme.shadows[1],
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        p: 1.5,
                        borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                >
                    <Stack
                        alignItems="center"
                        direction="row"
                        justifyContent="space-between"
                    >
                        <Stack alignItems="center" direction="row" spacing={1}>
                            <InfoOutlinedIcon
                                color="primary"
                                fontSize="small"
                            />
                            <Typography fontWeight="600" variant="body2">
                                {t('Instructions')}
                            </Typography>
                        </Stack>
                        <Button
                            onClick={() => setInstructionsDialogOpen(true)}
                            size="small"
                            sx={{
                                fontSize: '0.7rem',
                                minWidth: 'auto',
                                px: 1.5,
                                py: 0.5
                            }}
                            variant="text"
                        >
                            Read More
                        </Button>
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
                    <DescriptionBlock
                        documentsthreadId={documentsthreadId}
                        template_obj={template_obj}
                        thread={thread}
                    />
                </Box>
            </Card>

            <Dialog
                maxWidth="md"
                onClose={() => setInstructionsDialogOpen(false)}
                open={instructionsDialogOpen}
                scroll="paper"
            >
                <DialogTitle>
                    <Stack alignItems="center" direction="row" spacing={1.5}>
                        <InfoOutlinedIcon
                            color="primary"
                            sx={{ fontSize: 28 }}
                        />
                        <Typography fontWeight="700" variant="h5">
                            {t('Instructions')}
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    <DescriptionBlock
                        documentsthreadId={documentsthreadId}
                        template_obj={template_obj}
                        thread={thread}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setInstructionsDialogOpen(false)}
                        variant="contained"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default InstructionsSection;
