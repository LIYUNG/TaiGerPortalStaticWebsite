import { useTranslation } from 'react-i18next';

import { ConfirmationModal } from '@components/Modal/ConfirmationModal';

interface ProgramDeleteWarningProps {
    uni_name: string;
    program_name: string;
    isPending: boolean;
    setDeleteProgramWarningOpen: (open: boolean) => void;
    RemoveProgramHandler: (programId: string) => void;
    program_id: string;
    deleteProgramWarning: boolean;
}

const ProgramDeleteWarning = (props: ProgramDeleteWarningProps) => {
    const { t } = useTranslation();
    return (
        <ConfirmationModal
            closeText={t('No', { ns: 'common' })}
            confirmText={t('Yes', { ns: 'common' })}
            content={`Do you want to delete ${props.uni_name} - ${props.program_name} ?`}
            isLoading={props.isPending}
            onClose={() => props.setDeleteProgramWarningOpen(false)}
            onConfirm={() => props.RemoveProgramHandler(props.program_id)}
            open={props.deleteProgramWarning}
            title={t('Warning', { ns: 'common' })}
        />
    );
};
export default ProgramDeleteWarning;
