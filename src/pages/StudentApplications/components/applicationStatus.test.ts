import {
    countApplicationStatuses,
    matchesApplicationSearch,
    matchesApplicationStatus
} from './applicationStatus';
import type { Application } from '@/api/types';

const app = (overrides: Partial<Application> = {}) =>
    ({
        _id: 'a1',
        decided: '-',
        closed: '-',
        admission: '-',
        ...overrides
    }) as Application;

describe('matchesApplicationStatus', () => {
    it('treats an undecided application as pending only', () => {
        const pending = app();
        expect(matchesApplicationStatus(pending, 'pending')).toBe(true);
        expect(matchesApplicationStatus(pending, 'decided')).toBe(false);
        expect(matchesApplicationStatus(pending, 'submitted')).toBe(false);
    });

    // The reported bug: an admitted program is still a decided and a submitted
    // one, so the earlier filters must include it.
    it('counts an admitted application as decided and submitted too', () => {
        const admitted = app({ decided: 'O', closed: 'O', admission: 'O' });
        expect(matchesApplicationStatus(admitted, 'decided')).toBe(true);
        expect(matchesApplicationStatus(admitted, 'submitted')).toBe(true);
        expect(matchesApplicationStatus(admitted, 'admitted')).toBe(true);
        expect(matchesApplicationStatus(admitted, 'pending')).toBe(false);
        expect(matchesApplicationStatus(admitted, 'rejected')).toBe(false);
    });

    it('counts an enrolled application under every stage it passed', () => {
        const enrolled = app({
            decided: 'O',
            closed: 'O',
            admission: 'O',
            finalEnrolment: true
        } as Partial<Application>);
        expect(matchesApplicationStatus(enrolled, 'decided')).toBe(true);
        expect(matchesApplicationStatus(enrolled, 'submitted')).toBe(true);
        expect(matchesApplicationStatus(enrolled, 'admitted')).toBe(true);
        expect(matchesApplicationStatus(enrolled, 'enrolled')).toBe(true);
    });

    it('treats a rejected application as submitted but not admitted', () => {
        const rejected = app({ decided: 'O', closed: 'O', admission: 'X' });
        expect(matchesApplicationStatus(rejected, 'submitted')).toBe(true);
        expect(matchesApplicationStatus(rejected, 'rejected')).toBe(true);
        expect(matchesApplicationStatus(rejected, 'admitted')).toBe(false);
    });

    // The actionable working set. Decided is a prerequisite, and unlike its
    // neighbours this bucket is a current-stage test — anything that reached
    // submission or was withdrawn has left it.
    describe('inProgress', () => {
        it('matches a decided application that is not submitted', () => {
            expect(
                matchesApplicationStatus(app({ decided: 'O' }), 'inProgress')
            ).toBe(true);
        });

        it('excludes an application that was never decided', () => {
            expect(matchesApplicationStatus(app(), 'inProgress')).toBe(false);
            expect(
                matchesApplicationStatus(app({ decided: 'X' }), 'inProgress')
            ).toBe(false);
        });

        it('excludes a submitted application', () => {
            expect(
                matchesApplicationStatus(
                    app({ decided: 'O', closed: 'O' }),
                    'inProgress'
                )
            ).toBe(false);
        });

        it('excludes a withdrawn application', () => {
            expect(
                matchesApplicationStatus(
                    app({ decided: 'O', closed: 'X' }),
                    'inProgress'
                )
            ).toBe(false);
        });
    });

    it('treats a withdrawn application as decided but not submitted', () => {
        const withdrawn = app({ decided: 'O', closed: 'X' });
        expect(matchesApplicationStatus(withdrawn, 'withdrawn')).toBe(true);
        expect(matchesApplicationStatus(withdrawn, 'decided')).toBe(true);
        expect(matchesApplicationStatus(withdrawn, 'submitted')).toBe(false);
    });
});

describe('countApplicationStatuses', () => {
    it('counts stages cumulatively, so buckets overlap', () => {
        const counts = countApplicationStatuses([
            app(),
            app({ decided: 'O' }),
            app({ decided: 'O', closed: 'O' }),
            app({ decided: 'O', closed: 'O', admission: 'O' }),
            app({ decided: 'O', closed: 'X' })
        ]);

        expect(counts).toEqual({
            pending: 1,
            // 4 decided: the plain decided one, submitted, admitted, withdrawn
            decided: 4,
            // Only the plain decided one is still in flight.
            inProgress: 1,
            // 2 submitted: the plain submitted one and the admitted one
            submitted: 2,
            admitted: 1,
            rejected: 0,
            enrolled: 0,
            withdrawn: 1
        });
    });

    it('returns all-zero counts for an empty list', () => {
        expect(countApplicationStatuses([])).toEqual({
            pending: 0,
            decided: 0,
            inProgress: 0,
            submitted: 0,
            admitted: 0,
            rejected: 0,
            enrolled: 0,
            withdrawn: 0
        });
    });
});

describe('matchesApplicationSearch', () => {
    const withProgram = app({
        programId: {
            school: 'TU Berlin',
            program_name: 'Computer Science',
            degree: 'M. Sc.',
            semester: 'WS'
        }
    } as Partial<Application>);

    it('matches an empty term against everything', () => {
        expect(matchesApplicationSearch(withProgram, '')).toBe(true);
        expect(matchesApplicationSearch(withProgram, '   ')).toBe(true);
    });

    it('matches school and program name case-insensitively', () => {
        expect(matchesApplicationSearch(withProgram, 'tu berlin')).toBe(true);
        expect(matchesApplicationSearch(withProgram, 'COMPUTER')).toBe(true);
    });

    it('does not match an unrelated term', () => {
        expect(matchesApplicationSearch(withProgram, 'Munich')).toBe(false);
    });

    it('tolerates a missing programId', () => {
        expect(matchesApplicationSearch(app(), 'anything')).toBe(false);
    });
});
