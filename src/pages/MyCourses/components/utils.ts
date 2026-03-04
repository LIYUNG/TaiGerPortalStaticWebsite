// Shared interfaces and utility functions for CourseAnalysisV2 components

export interface CategorySummaryRow {
    credits: number;
    requiredECTS: number;
    maxScore?: number;
    [key: string]: string | number | undefined;
}

export interface ScoreEntry {
    name: string;
    label: string;
    description?: string;
}

export interface ProgramSheet {
    sorted: Record<string, CategorySummaryRow[]>;
    scores: Record<string, number> & {
        firstRoundConsidered?: string[];
        secondRoundConsidered?: string[];
    };
    suggestion: Record<string, Array<Record<string, string>>>;
}

export interface ProgramSheetEntry {
    key: string;
    value: ProgramSheet;
}

/** Row in CourseTable: dynamic course name key (tableKey) plus credits and grades */
export interface CourseTableRow {
    credits?: number | string;
    grades?: string;
    [courseNameKey: string]: string | number | undefined;
}

export const settings = {
    display: 'flex',
    width: 150,
    height: 150
};

export const acquiredECTS = (table: CategorySummaryRow[]) => {
    return table[table.length - 1].credits;
};

export const requiredECTS = (table: CategorySummaryRow[]) => {
    return table[table.length - 1].requiredECTS;
};

export const satisfiedRequirement = (table: CategorySummaryRow[]) => {
    return acquiredECTS(table) >= requiredECTS(table);
};

export const getMaxScoreECTS = (table: CategorySummaryRow[]) => {
    return table[table.length - 1].maxScore || 0;
};

export const countSuggestedCourses = (
    data: Record<string, Array<Record<string, string>>>,
    missingCourses: Record<string, number>
) => {
    delete data.Others;
    const categories = Object.keys(data);
    for (const category of categories) {
        const list = data[category];

        for (const item of list) {
            if (item && item['建議修課']) {
                const course = item['建議修課'];
                missingCourses[course] = (missingCourses[course] || 0) + 1;
            }
        }
    }

    return missingCourses;
};

export const allRequiredECTSCrossPrograms = (
    programSheetsArray: ProgramSheetEntry[]
) => {
    let sum = 0;
    for (let i = 0; i < programSheetsArray?.length; i += 1) {
        const sortedCourses = programSheetsArray[i]?.value?.sorted;
        sum += Object.keys(sortedCourses)
            ?.map((category) =>
                category !== 'Others'
                    ? requiredECTS(sortedCourses[category])
                    : 0
            )
            ?.reduce((sum, i) => sum + i, 0);
    }
    return sum;
};

export const allMissCoursesCrossPrograms = (
    programSheetsArray: ProgramSheetEntry[]
) => {
    let missingCourses: Record<string, number> = {};
    for (let i = 0; i < programSheetsArray?.length; i += 1) {
        const suggestionCourses = programSheetsArray[i]?.value?.suggestion;
        missingCourses = countSuggestedCourses(
            suggestionCourses,
            missingCourses
        );
    }
    return missingCourses;
};

export const allAcquiredECTSCrossPrograms = (
    programSheetsArray: ProgramSheetEntry[]
) => {
    let sum = 0;
    for (let i = 0; i < programSheetsArray?.length; i += 1) {
        const sortedCourses = programSheetsArray[i]?.value?.sorted;
        sum += Object.keys(sortedCourses)
            ?.map((category) =>
                category !== 'Others'
                    ? acquiredECTS(sortedCourses[category]) >
                      requiredECTS(sortedCourses[category])
                        ? requiredECTS(sortedCourses[category])
                        : acquiredECTS(sortedCourses[category])
                    : 0
            )
            ?.reduce((sum, i) => sum + i, 0);
    }
    return sum;
};
