import { render } from '@testing-library/react';
import ProgramLanguageNotMatchedBanner from './ProgramLanguageNotMatchedBanner';

vi.mock('../../Demo/Utils/util_functions', () => ({
    isLanguageNotMatchedInAnyProgram: vi.fn().mockReturnValue(false),
    languageNotMatchedPrograms: vi.fn().mockReturnValue([])
}));

describe('ProgramLanguageNotMatchedBanner', () => {
    test('renders without crashing when condition is false', () => {
        const { container } = render(
            <ProgramLanguageNotMatchedBanner student={{}} />
        );
        expect(container.firstChild).toBeFalsy();
    });
});
