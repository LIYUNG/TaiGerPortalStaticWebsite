import { render } from '@testing-library/react';
import ProgramLanguageNotMatchedBanner from './ProgramLanguageNotMatchedBanner';

jest.mock('../../Demo/Utils/util_functions', () => ({
    isLanguageNotMatchedInAnyProgram: jest.fn().mockReturnValue(false),
    languageNotMatchedPrograms: jest.fn().mockReturnValue([])
}));

describe('ProgramLanguageNotMatchedBanner', () => {
    it('renders without crashing when condition is false', () => {
        const { container } = render(
            <ProgramLanguageNotMatchedBanner student={{}} />
        );
        expect(container.firstChild).toBeFalsy();
    });
});
