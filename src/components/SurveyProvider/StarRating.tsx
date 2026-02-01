import { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

export interface StarRatingProps {
    rating?: number | string;
    onRatingChange: (value: number) => void;
    disabled?: boolean;
}

const StarRating = ({
    rating,
    onRatingChange,
    disabled = false
}: StarRatingProps) => {
    const [hoverRating, setHoverRating] = useState(0);

    const currentRating = rating ? parseInt(String(rating), 10) : 0;

    const handleClick = (star: number) => {
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
