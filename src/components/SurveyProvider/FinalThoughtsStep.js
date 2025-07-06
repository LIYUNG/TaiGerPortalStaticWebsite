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

        <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1 }} variant="subtitle2">
                What could we improve about our interview process?
            </Typography>
            <textarea
                disabled={disabled}
                name="improvements"
                onChange={onChange}
                placeholder="Please share any suggestions for improvement..."
                rows={3}
                style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                }}
                value={values.improvements || ''}
            />
        </Box>

        <Box>
            <Typography sx={{ mb: 1 }} variant="subtitle2">
                Do you have any additional feedback or comments about the
                interview training?
            </Typography>
            <textarea
                disabled={disabled}
                name="additionalComments"
                onChange={onChange}
                placeholder="Please share any additional feedback about the interview training..."
                rows={3}
                style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                }}
                value={values.additionalComments || ''}
            />
        </Box>
    </Box>
);

export default FinalThoughtsStep;
