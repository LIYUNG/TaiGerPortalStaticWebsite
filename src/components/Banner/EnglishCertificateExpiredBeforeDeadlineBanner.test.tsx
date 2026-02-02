import { render } from '@testing-library/react';
import EnglishCertificateExpiredBeforeDeadlineBanner from './EnglishCertificateExpiredBeforeDeadlineBanner';

jest.mock('../../Demo/Utils/util_functions', () => ({
    isEnglishCertificateExpiredBeforeDeadline: jest.fn().mockReturnValue(false),
    englishCertificatedExpiredBeforeTheseProgramDeadlines: jest.fn(),
    application_deadline_V2_calculator: jest.fn()
}));

describe('EnglishCertificateExpiredBeforeDeadlineBanner', () => {
    it('renders without crashing when condition is false', () => {
        const { container } = render(
            <EnglishCertificateExpiredBeforeDeadlineBanner student={{}} />
        );
        expect(container.firstChild).toBeFalsy();
    });
});
