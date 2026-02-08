import { render } from '@testing-library/react';
import EnglishCertificateExpiredBeforeDeadlineBanner from './EnglishCertificateExpiredBeforeDeadlineBanner';

vi.mock('../../Demo/Utils/util_functions', () => ({
    isEnglishCertificateExpiredBeforeDeadline: vi.fn().mockReturnValue(false),
    englishCertificatedExpiredBeforeTheseProgramDeadlines: vi.fn(),
    application_deadline_V2_calculator: vi.fn()
}));

describe('EnglishCertificateExpiredBeforeDeadlineBanner', () => {
    test('renders without crashing when condition is false', () => {
        const { container } = render(
            <EnglishCertificateExpiredBeforeDeadlineBanner student={{}} />
        );
        expect(container.firstChild).toBeFalsy();
    });
});
