import { Box, Button } from '@mui/material';

export default function StepNavigation({
    onNext,
    onPrevious,
    onSaveDraft,
    onOpenModal,
    isFinal = false,
    isChanged = false,
    isValid = false,
    isLastStep = false,
    currentStep = 0
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 4
            }}
        >
            <Button
                disabled={currentStep === 0}
                onClick={onPrevious}
                size="large"
                variant="outlined"
            >
                Previous
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    color="secondary"
                    disabled={isFinal || !isChanged}
                    onClick={onSaveDraft}
                    size="large"
                    variant="contained"
                >
                    Save and continue later
                </Button>

                {isLastStep ? (
                    <Button
                        color="primary"
                        disabled={isFinal || !isValid}
                        onClick={onOpenModal}
                        size="large"
                        variant="contained"
                    >
                        Submit feedback
                    </Button>
                ) : (
                    <Button onClick={onNext} size="large" variant="contained">
                        Next
                    </Button>
                )}
            </Box>
        </Box>
    );
}
