import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const ProgramFeedbackStep = ({ values, onChange, disabled }) => (
    <Box>
        <Typography
            color="primary.main"
            fontWeight="bold"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            variant="h5"
        >
            🎓 Program Feedback
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
            Please share your thoughts about the program
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box>
            <Typography sx={{ mb: 1 }} variant="subtitle2">
                Which questions were asked during your interview? Please write
                them down as precisely as possible.{' '}
                <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
            <textarea
                disabled={disabled}
                name="interviewQuestions"
                onChange={onChange}
                placeholder="Please write down the questions that were asked during your interview..."
                rows={12}
                style={{
                    width: '100%',
                    padding: '16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    minHeight: '300px',
                    fontFamily: 'inherit',
                    lineHeight: '1.5'
                }}
                value={values.interviewQuestions || ''}
            />
        </Box>
    </Box>
);

export default ProgramFeedbackStep;
