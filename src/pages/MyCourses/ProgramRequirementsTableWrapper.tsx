import { useQuery } from '@tanstack/react-query';
import { getProgramRequirementsQuery } from '@/api/query';
import {
    ProgramRequirementsTable,
    ProgramRequirementsTableProps
} from '@components/ProgramRequirementsTable/ProgramRequirementsTable';
import { convertDateUXFriendly } from '@utils/contants';
import type { IProgramWithId } from '@taiger-common/model';

interface ProgramRequirementPopulated {
    _id: string;
    programId: IProgramWithId[];
    attributes: string[];
    updatedAt: string;
}

interface Props {
    onAnalyseV2: ProgramRequirementsTableProps['onAnalyseV2'];
}

export const ProgramRequirementsTableWrapper = ({ onAnalyseV2 }: Props) => {
    const { data, isLoading } = useQuery(getProgramRequirementsQuery());
    if (isLoading) return <div>Loading...</div>;
    const rawData = (
        data as { data?: ProgramRequirementPopulated[] } | undefined
    )?.data;
    const transformedData =
        rawData?.map((row: ProgramRequirementPopulated) => {
            return {
                ...row, // Spread the original row object
                program_name: `${row.programId[0].school} ${row.programId[0].program_name} ${row.programId[0].degree}`,
                lang: `${row.programId[0].lang}`,
                degree: `${row.programId[0].degree}`,
                attributes: `${row.attributes.join('-')}`,
                country: `${row.programId[0].country}`,
                updatedAt: convertDateUXFriendly(row.updatedAt),
                id: row._id // Map MongoDB _id to id property
                // other properties...
            };
        }) ?? [];
    return (
        <ProgramRequirementsTable
            data={transformedData}
            onAnalyseV2={onAnalyseV2}
        />
    );
};
