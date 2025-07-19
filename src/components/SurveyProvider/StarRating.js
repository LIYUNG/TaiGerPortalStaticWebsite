import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const StarRating = ({ rating, onRatingChange, disabled = false }) => {
    const [hoverRating, setHoverRating] = React.useState(0);

    // Convert rating to number and handle empty/undefined values
    const currentRating = rating ? parseInt(rating) : 0;

    const handleClick = (star) => {
        console.log('Star clicked:', star, 'disabled:', disabled);
        if (!disabled) {
            onRatingChange(star);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <IconButton
                    disabled={disabled}
                    key={star}
                    onClick={() => handleClick(star)}
                    onMouseEnter={() => !disabled && setHoverRating(star)}
                    onMouseLeave={() => !disabled && setHoverRating(0)}
                    sx={{ p: 0.5 }}
                >
                    {star <= (hoverRating || currentRating) ? (
                        <StarIcon sx={{ color: '#fbbf24', fontSize: 32 }} />
                    ) : (
                        <StarBorderIcon
                            sx={{ color: '#d1d5db', fontSize: 32 }}
                        />
                    )}
                </IconButton>
            ))}
            <Typography color="text.secondary" sx={{ ml: 1 }} variant="body2">
                {currentRating > 0
                    ? `${currentRating} out of 5`
                    : 'Select rating'}
            </Typography>
        </Box>
    );
};

export default StarRating;
