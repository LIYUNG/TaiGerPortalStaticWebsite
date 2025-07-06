import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const FinalThoughtsStep = ({ values, onChange, disabled }) => (
    <Box>
        <Typography
            color="primary.main"
            fontWeight="bold"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            variant="h5"
        >
            💭 Final Thoughts
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
            Please share any final feedback or suggestions
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box>
            <Typography sx={{ mb: 1 }} variant="subtitle2">
                Do you have any additional feedback or comments about the
                interview training?
            </Typography>
            <textarea
                disabled={disabled}
                name="interviewFeedback"
                onChange={onChange}
                placeholder="Please share any additional feedback about the interview training..."
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
                value={values.interviewFeedback || ''}
            />
        </Box>
    </Box>
);

export default FinalThoughtsStep;
