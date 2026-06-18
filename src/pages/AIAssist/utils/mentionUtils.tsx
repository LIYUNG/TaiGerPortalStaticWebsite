import { Box } from '@mui/material';
import type {
    AIAssistMentionedStudent,
    AIAssistPickerStudent
} from '@/api/types';

export const getStudentStringField = (
    student: AIAssistPickerStudent,
    key: string
): string => {
    const rawValue = (student as Record<string, unknown>)[key];
    return typeof rawValue === 'string' ? rawValue : '';
};

export const getStudentChineseName = (
    student: AIAssistPickerStudent
): string => {
    const explicitChineseName = String(student.chineseName || '').trim();
    if (explicitChineseName) {
        return explicitChineseName;
    }

    const lastNameChinese = getStudentStringField(student, 'lastname_chinese');
    const firstNameChinese = getStudentStringField(
        student,
        'firstname_chinese'
    );
    return `${lastNameChinese}${firstNameChinese}`.trim();
};

export const getStudentEnglishNames = (
    student: AIAssistPickerStudent
): string[] => {
    const primaryName = String(student.name || '').trim();
    const firstName = getStudentStringField(student, 'firstname').trim();
    const lastName = getStudentStringField(student, 'lastname').trim();

    return [
        primaryName,
        [firstName, lastName].filter(Boolean).join(' '),
        [lastName, firstName].filter(Boolean).join(' ')
    ].filter(Boolean);
};

export const createMentionedStudent = (
    studentId?: string,
    displayName?: string
): AIAssistMentionedStudent | null =>
    studentId && displayName
        ? {
              id: studentId,
              displayName
          }
        : null;

export const escapeRegExp = (value: string): string =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeMentionSearch = (value: string): string =>
    String(value || '')
        .toLowerCase()
        .replace(/\s+/g, '')
        .trim();

const normalizeChineseSearch = (value: string): string =>
    String(value || '')
        .replace(/\s+/g, '')
        .trim();

const buildStudentSearchStrings = (
    student: AIAssistPickerStudent
): string[] => {
    const englishNames = getStudentEnglishNames(student);
    const chineseName = getStudentChineseName(student);

    return [
        ...englishNames.map(normalizeMentionSearch),
        normalizeMentionSearch(student.email || ''),
        normalizeMentionSearch(student.name || ''),
        normalizeChineseSearch(chineseName)
    ].filter(Boolean);
};

export const matchesStudentMentionQuery = (
    student: AIAssistPickerStudent,
    query: string
): boolean => {
    const normalizedQuery = normalizeMentionSearch(query);
    const normalizedChineseQuery = normalizeChineseSearch(query);

    if (!normalizedQuery && !normalizedChineseQuery) {
        return false;
    }

    const searchStrings = buildStudentSearchStrings(student);

    return searchStrings.some(
        (searchValue) =>
            searchValue.includes(normalizedQuery) ||
            searchValue.includes(normalizedChineseQuery)
    );
};

export const getTokenQueryAtCursor = (
    value: string,
    cursorIndex: number,
    trigger: '@' | '#'
): string | null => {
    const beforeCursor = value.slice(0, cursorIndex);
    const tokenPattern =
        trigger === '@' ? /(^|\s)@([^@\s#]*)$/ : /(^|\s)#([^#\s@]*)$/;

    return beforeCursor.match(tokenPattern)?.[2] ?? null;
};

export const replaceTokenAtCursor = ({
    value,
    cursorIndex,
    trigger,
    replacement
}: {
    value: string;
    cursorIndex: number;
    trigger: '@' | '#';
    replacement: string;
}): { nextValue: string; nextCursorIndex: number } => {
    const beforeCursor = value.slice(0, cursorIndex);
    const tokenPattern =
        trigger === '@' ? /(^|\s)@([^@\s#]*)$/ : /(^|\s)#([^#\s@]*)$/;
    const match = beforeCursor.match(tokenPattern);

    if (!match || match.index == null) {
        return { nextValue: value, nextCursorIndex: cursorIndex };
    }

    const leadingWhitespace = match[1] || '';
    const tokenStart = match.index + leadingWhitespace.length;
    const nextValue =
        value.slice(0, tokenStart) + replacement + value.slice(cursorIndex);

    return {
        nextValue,
        nextCursorIndex: tokenStart + replacement.length
    };
};

export const renderMentionHighlightedText = (
    value: string,
    student: AIAssistMentionedStudent | null
): JSX.Element => {
    if (!value) {
        return <>{'\u200b'}</>;
    }

    if (!student) {
        return <>{value}</>;
    }

    const mentionToken = `@${student.displayName}`;
    const mentionPattern = new RegExp(`(${escapeRegExp(mentionToken)})`, 'gi');
    const parts = value.split(mentionPattern);

    return (
        <>
            {parts.map((part, index) =>
                part.toLowerCase() === mentionToken.toLowerCase() ? (
                    <Box
                        component="span"
                        key={`mention-${index}`}
                        sx={{
                            backgroundColor: 'rgba(25, 118, 210, 0.2)',
                            borderRadius: 0.75,
                            color: 'primary.main',
                            px: 0.25
                        }}
                    >
                        {part}
                    </Box>
                ) : (
                    <Box component="span" key={`text-${index}`}>
                        {part}
                    </Box>
                )
            )}
        </>
    );
};
