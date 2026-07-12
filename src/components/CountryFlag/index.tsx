import { useState } from 'react';
import { Box } from '@mui/material';

export interface CountryFlagProps {
    /** Lowercase ISO country code, as stored on a program (e.g. "de"). */
    country?: string;
    size?: number;
}

/**
 * Flag for a country code, from the SVG set in
 * `public/assets/logo/country_logo/svg/<code>.svg`.
 *
 * Renders nothing if the code is missing or has no asset — an unknown code must
 * not leave a broken-image icon in the middle of a filter list.
 */
export const CountryFlag = ({ country, size = 18 }: CountryFlagProps) => {
    const [failed, setFailed] = useState(false);
    const code = country?.trim().toLowerCase();

    if (!code || failed) {
        return null;
    }

    return (
        <Box
            alt={code}
            component="img"
            onError={() => setFailed(true)}
            src={`/assets/logo/country_logo/svg/${code}.svg`}
            sx={{
                borderRadius: '2px',
                display: 'block',
                flexShrink: 0,
                height: size * 0.75,
                objectFit: 'cover',
                width: size
            }}
        />
    );
};

export default CountryFlag;
