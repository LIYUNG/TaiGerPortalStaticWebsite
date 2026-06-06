import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BaseDocumentStudentView from './BaseDocumentStudentView';

vi.mock('@taiger-common/core', () => ({
    PROFILE_NAME: { passport: 'Passport', transcript: 'Transcript' }
}));
vi.mock('@taiger-common/model', () => ({
    DocumentStatusType: {
        Missing: 'Missing',
        Uploaded: 'Uploaded',
        Accepted: 'Accepted',
        Rejected: 'Rejected',
        NotNeeded: 'NotNeeded'
    }
}));
vi.mock('@/api', () => ({
    BASE_URL: 'http://localhost:3000',
    updateDocumentationHelperLink: vi.fn()
}));
vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));
vi.mock('./MyDocumentCard', () => ({
    default: () => <div data-testid="my-document-card" />
}));
vi.mock('../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));
// Build the element via createElement (no JSX): the mock factory is hoisted
// above imports, so JSX here would reference the not-yet-initialised jsx runtime.
vi.mock('@utils/contants', async () => {
    const { createElement } = await import('react');
    return {
        SYMBOL_EXPLANATION: createElement('span', {
            'data-testid': 'symbol-explanation'
        }),
        updateDocumentationHelperLink: vi.fn()
    };
});

const student = {
    _id: 'stu1',
    firstname: 'John',
    lastname: 'Doe',
    profile: []
};

describe('BaseDocumentStudentView', () => {
    test('renders loading initially before ready', () => {
        render(
            <MemoryRouter>
                <BaseDocumentStudentView
                    base_docs_link={[]}
                    student={student}
                />
            </MemoryRouter>
        );
        // Initially shows loading before useEffect sets ready=true
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
});
