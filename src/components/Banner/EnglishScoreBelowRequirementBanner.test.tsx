import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EnglishScoreBelowRequirementBanner from './EnglishScoreBelowRequirementBanner';
import { englishScoreRequirementIssues } from '@pages/Utils/util_functions';

vi.mock('@pages/Utils/util_functions', () => ({
    englishScoreRequirementIssues: vi.fn().mockReturnValue([])
}));

const renderBanner = () =>
    render(
        <MemoryRouter>
            <EnglishScoreBelowRequirementBanner student={{ _id: '' }} />
        </MemoryRouter>
    );

describe('EnglishScoreBelowRequirementBanner', () => {
    test('renders nothing when there are no requirement issues', () => {
        (englishScoreRequirementIssues as jest.Mock).mockReturnValue([]);
        const { container } = renderBanner();
        expect(container.firstChild).toBeFalsy();
    });

    test('lists the program and its failing sections when scores are below requirement', () => {
        (englishScoreRequirementIssues as jest.Mock).mockReturnValue([
            {
                program: {
                    _id: 'p1',
                    school: 'TUM',
                    program_name: 'CS',
                    degree: 'M.Sc.',
                    semester: 'WS'
                },
                certificate: 'IELTS',
                failures: [
                    { section: 'Reading', required: 6, actual: 5.5 },
                    { section: 'Writing', required: 6.5, actual: 6 }
                ]
            }
        ]);
        renderBanner();
        expect(screen.getByText(/TUM CS M\.Sc\. WS/)).toBeInTheDocument();
        expect(
            screen.getByText(/IELTS: Reading 5\.5 < 6, Writing 6 < 6\.5/)
        ).toBeInTheDocument();
    });
});
