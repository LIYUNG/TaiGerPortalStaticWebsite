import ProgramUpdateStatusTable, {
    type ProgramUpdateStatusRow
} from './ProgramUpdateStatusTable';
import { useApplicationProgramsUpdateStatus } from '@hooks/useApplicationProgramsUpdateStatus';

export interface ProgramUpdateStatusTabProps {
    /** Scope to the supervised students' programs (My Students view). */
    userId?: string;
    /** When true, only programs that have a decided application are shown. */
    decidedOnly?: boolean;
}

/**
 * Self-contained "Programs Update Status" tab: the distinct program list is
 * computed in the DB, so this only fetches the small program rows instead of
 * every application.
 */
export const ProgramUpdateStatusTab = ({
    userId,
    decidedOnly
}: ProgramUpdateStatusTabProps = {}) => {
    const { rows, isLoading, isFetching } = useApplicationProgramsUpdateStatus({
        userId,
        decided: decidedOnly ? 'O' : undefined
    });

    return (
        <ProgramUpdateStatusTable
            data={rows as ProgramUpdateStatusRow[]}
            isLoading={isLoading || isFetching}
        />
    );
};

export default ProgramUpdateStatusTab;
