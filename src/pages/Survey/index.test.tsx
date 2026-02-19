import { createElement, forwardRef } from 'react';
import { render, screen } from '@testing-library/react';

import Survey from '.';
import { useAuth } from '@components/AuthProvider';
import { mockSingleData } from '../../test/testingStudentData';

const mockLoaderData = {
    data: {
        data: {
            academic_background: mockSingleData.data[0].academic_background,
            application_preference: mockSingleData.data[0].application_preference
        },
        survey_link: 'dummylink'
    }
};

vi.mock('react-router-dom', () => ({
    Navigate: () => null,
    Link: forwardRef((props, ref) =>
        createElement('a', {
            href: props.to,
            ref,
            ...props
        }, props.children)
    ),
    useLoaderData: () => mockLoaderData
}));

vi.mock('@components/AuthProvider');

vi.mock('@taiger-common/core', async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import('@taiger-common/core');
    return {
        ...actual,
        is_TaiGer_role: () => false,
        is_TaiGer_Student: () => true
    };
});

vi.mock('./SurveyComponent', () => ({
    default: () => createElement('div', { 'data-testid': 'survey-component' })
}));

describe('Survey', () => {
    beforeEach(() => {
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Student', _id: '6366287a94358b085b0fccf7' },
            isAuthenticated: true,
            isLoaded: true,
            login: vi.fn(),
            logout: vi.fn()
        } as never);
    });

    it('renders without crashing', () => {
        render(<Survey />);
        expect(screen.getByTestId('student_survey')).toBeInTheDocument();
    });

    it('renders survey component when student', () => {
        render(<Survey />);
        expect(screen.getByTestId('survey-component')).toBeInTheDocument();
    });
});
