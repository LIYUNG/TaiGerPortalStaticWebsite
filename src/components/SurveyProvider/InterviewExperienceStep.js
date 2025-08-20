import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import StarRating from './StarRating';

const InterviewExperienceStep = ({ values, onChange, disabled }) => (
    <Box>
        <Typography
            color="primary.main"
            fontWeight="bold"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            variant="h5"
        >
            🎯 Interview Experience
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
            Please rate your interview experience
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1 }} variant="subtitle2">
                The interview training materials provided beforehand were
                beneficial for my official interview.{' '}
                <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
            <StarRating
                disabled={disabled}
                onRatingChange={(value) => {
                    const event = {
                        target: {
                            name: 'interviewRating',
                            value: value.toString()
                        }
                    };
                    onChange(event);
                }}
                rating={values.interviewRating}
            />
        </Box>

        <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1 }} variant="subtitle2">
                The interview training significantly helped me to conduct the
                official interview. <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
            <StarRating
                disabled={disabled}
                onRatingChange={(value) => {
                    const event = {
                        target: {
                            name: 'informationClarity',
                            value: value.toString()
                        }
                    };
                    onChange(event);
                }}
                rating={values.informationClarity}
            />
        </Box>

        <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1 }} variant="subtitle2">
                The interview trainer was friendly and helped me feel less
                nervous. <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
            <StarRating
                disabled={disabled}
                onRatingChange={(value) => {
                    const event = {
                        target: {
                            name: 'trainerFriendliness',
                            value: value.toString()
                        }
                    };
                    onChange(event);
                }}
                rating={values.trainerFriendliness}
            />
        </Box>
    </Box>
);

export default InterviewExperienceStep;
