vi.mock('axios');
vi.mock('crypto', async (importOriginal) => ({
    ...(await importOriginal<typeof import('crypto')>()),
    getRandomValues: vi.fn()
}));
vi.mock('../../api');
vi.mock('remark-gfm', () => () => undefined);

vi.mock('react-router-dom', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router-dom')>()),
    useParams: vi.fn()
}));

vi.mock('../../components/AuthProvider');

class ResizeObserver {
    observe() {}
    disconnect() {}
    unobserve() {}
}

describe('Communication page checking', () => {
    window.ResizeObserver = ResizeObserver;
    // TODO
    test('Communication page not crash', async () => {
        expect(1).toBe(1);
    });
});
