import { render, screen } from '@testing-library/react';
import OriginAuthorStatementBar from './OriginAuthorStatementBar';

vi.mock('i18next', () => ({ default: { t: (k: string) => k } }));

vi.mock('@/api', () => ({
    putOriginAuthorConfirmedByStudent: vi.fn(() =>
        Promise.resolve({ data: { success: true } })
    )
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Student: vi.fn(() => false)
}));

vi.mock('../../../../config', () => ({
    appConfig: { companyName: 'TaiGer', companyFullName: 'TaiGer Consultancy' }
}));

const theme = {
    palette: { primary: { main: '#1976d2' } }
} as any;

const user = { role: 'Agent' } as any;

const confirmedThread = {
    _id: 'thread1',
    file_type: 'Essay',
    isOriginAuthorDeclarationConfirmedByStudent: true,
    student_id: {
        _id: 'stu1',
        firstname: 'Alice',
        lastname: 'Smith',
        firstname_chinese: '愛',
        lastname_chinese: '史'
    }
} as any;

const unconfirmedThread = {
    ...confirmedThread,
    isOriginAuthorDeclarationConfirmedByStudent: false
};

describe('OriginAuthorStatementBar', () => {
    it('renders Read More link when confirmed', () => {
        render(
            <OriginAuthorStatementBar
                thread={confirmedThread}
                theme={theme}
                user={user}
            />
        );
        expect(screen.getByText('Read More')).toBeInTheDocument();
    });

    it('renders Read More link when unconfirmed', () => {
        render(
            <OriginAuthorStatementBar
                thread={unconfirmedThread}
                theme={theme}
                user={user}
            />
        );
        expect(screen.getByText('Read More')).toBeInTheDocument();
    });
});
