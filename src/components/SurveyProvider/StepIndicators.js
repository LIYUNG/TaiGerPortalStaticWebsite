import { Box, Stepper, Step, StepLabel, LinearProgress } from '@mui/material';

export default function StepIndicators({ steps, currentStep }) {
    return (
        <Box sx={{ mb: 4 }}>
            <Stepper activeStep={currentStep} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Box sx={{ mt: 2 }}>
                <LinearProgress
                    sx={{ height: 8, borderRadius: 4 }}
                    value={((currentStep + 1) / steps.length) * 100}
                    variant="determinate"
                />
            </Box>
        </Box>
    );
}
