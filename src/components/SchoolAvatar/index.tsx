import { useMemo } from 'react';
import { Avatar, Tooltip } from '@mui/material';

import { getSchoolLogoUrl } from './schoolLogoRegistry';
import { monogramColour, schoolInitials } from './schoolMonogram';

export interface SchoolAvatarProps {
    school?: string;
    size?: number;
}

/**
 * Identity mark for a school.
 *
 * Renders the registered logo when one exists, otherwise a deterministic
 * monogram (initials + colour hashed from the name). Call sites do not need to
 * know which they get, so backfilling real logos later is a registry edit — no
 * component changes. See schoolLogoRegistry.ts.
 */
export const SchoolAvatar = ({ school, size = 28 }: SchoolAvatarProps) => {
    const name = school?.trim() ?? '';

    const { initials, colour, logoUrl } = useMemo(
        () => ({
            initials: name ? schoolInitials(name) : '',
            colour: name ? monogramColour(name) : undefined,
            logoUrl: getSchoolLogoUrl(name)
        }),
        [name]
    );

    return (
        <Tooltip title={name}>
            <Avatar
                alt={name}
                src={logoUrl}
                sx={{
                    bgcolor: logoUrl ? 'transparent' : colour,
                    color: '#fff',
                    fontSize: size * 0.4,
                    fontWeight: 600,
                    height: size,
                    width: size
                }}
                variant="rounded"
            >
                {initials}
            </Avatar>
        </Tooltip>
    );
};

export default SchoolAvatar;
