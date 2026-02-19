import { MouseEvent, useState } from 'react';
import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { resendActivation } from '@/api';
import AuthWrapper from '@components/AuthWrapper';

export interface ReactivationProps {
    email: string | undefined;
}

export default function Reactivation(props: ReactivationProps) {
    const [emailsent, setEmailsent] = useState(false);
    const { t } = useTranslation();
    const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setEmailsent(true);
        try {
            const resp = await resendActivation({
                email: props.email
            });
            const { success } = resp.data;
            if (success) {
                setEmailsent(true);
            } else {
                alert(resp.data.message);
            }
        } catch {
            // TODO: handle error
        }
    };

    // if return 200, then show Start button, otherwise, resend the activation email with token.
    return (
        <AuthWrapper>
            {emailsent ? (
                <>
                    <Typography>{t('Confirmation Email sent')}</Typography>
                    <Typography>
                        {t(
                            'The new activation link is sent to the following address:'
                        )}
                    </Typography>
                    <Typography>{props.email}</Typography>
                </>
            ) : (
                <>
                    <Typography>{t('Account is not activated')}</Typography>
                    <Typography>
                        {t(
                            'Please click "Resend" to receive the new activation link in your email.'
                        )}
                    </Typography>
                    <Button color="primary" onClick={(e: MouseEvent<HTMLButtonElement>) => handleSubmit(e)}>
                        {t('Resend')}
                    </Button>
                </>
            )}
        </AuthWrapper>
    );
}
