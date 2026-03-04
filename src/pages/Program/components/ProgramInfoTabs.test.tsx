import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgramInfoTabs from './ProgramInfoTabs';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@utils/contants', () => ({
    IS_DEV: false,
    convertDate: (d: string) => d ?? '',
    COUNTRIES_MAPPING: { DE: 'Germany' },
    english_test_hand_after: [],
    german_test_hand_after: [],
    program_fields_application_dates: [],
    program_fields_english_languages_test: [],
    program_fields_other_test: [],
    program_fields_others: [],
    program_fields_overview: [{ name: 'School', prop: 'school' }],
    program_fields_special_documents: [],
    program_fields_special_notes: [],
    programField2Label: {}
}));

vi.mock('../../Utils/checking-functions', () => ({
    LinkableNewlineText: ({ text }: { text: string }) => <span>{text}</span>
}));

vi.mock('../../Utils/diffChecker', () => ({
    HighlightTextDiff: () => null
}));

vi.mock('@components/Tabs', () => ({
    a11yProps: () => ({}),
    CustomTabPanel: ({
        children,
        index,
        value
    }: {
        children: React.ReactNode;
        index: number;
        value: number;
    }) => (index === value ? <div>{children}</div> : null)
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_AdminAgent: () => false
}));

const defaultProps = {
    program: { school: 'MIT', program_name: 'CS', country: 'DE' },
    versions: {},
    value: 0,
    handleChange: vi.fn(),
    setDiffModalShow: vi.fn(),
    user: null
};

describe('ProgramInfoTabs', () => {
    it('renders overview tab content', () => {
        render(<ProgramInfoTabs {...defaultProps} />);
        expect(screen.getByText('School')).toBeInTheDocument();
    });

    it('renders program school value in overview', () => {
        render(<ProgramInfoTabs {...defaultProps} />);
        expect(screen.getByText('MIT')).toBeInTheDocument();
    });

    it('does not render Edit History tab when versions has no changes', () => {
        render(<ProgramInfoTabs {...defaultProps} />);
        expect(screen.queryByText('Edit History')).not.toBeInTheDocument();
    });

    it('renders Edit History tab when changes exist', () => {
        const props = {
            ...defaultProps,
            versions: {
                changes: [
                    {
                        changedBy: 'Admin',
                        changedAt: '2025-01-01',
                        originalValues: { school: 'old' },
                        updatedValues: { school: 'new' }
                    }
                ]
            }
        };
        render(<ProgramInfoTabs {...props} />);
        expect(screen.getByText('Edit History')).toBeInTheDocument();
    });

    it('renders Others tab when value is 4', () => {
        render(<ProgramInfoTabs {...defaultProps} value={4} />);
        expect(screen.getByText('Country')).toBeInTheDocument();
    });
});
