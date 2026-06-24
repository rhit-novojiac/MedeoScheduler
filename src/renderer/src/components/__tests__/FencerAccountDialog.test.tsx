import { describe, it, expect } from 'vitest';
import { isMemberOnDate } from '../fencers/FencerAccountDialog';
import type { FencerMembership } from '@preload/index';

describe('isMemberOnDate helper function', () => {
    const memberships: FencerMembership[] = [
        {
            id: 'm1',
            fencer_id: 'f1',
            start_date: '2026-06-01',
            end_date: '2026-06-30',
            type: 'MONTHLY',
        },
        {
            id: 'm2',
            fencer_id: 'f1',
            start_date: '2026-01-01',
            end_date: '2026-01-31',
            type: 'MONTHLY',
        }
    ];

    it('should return true for a date inside an active membership period', () => {
        expect(isMemberOnDate(memberships, '2026-06-15')).toBe(true);
        expect(isMemberOnDate(memberships, '2026-01-01')).toBe(true);
        expect(isMemberOnDate(memberships, '2026-01-31')).toBe(true);
    });

    it('should return false for a date outside all membership periods', () => {
        expect(isMemberOnDate(memberships, '2026-05-31')).toBe(false);
        expect(isMemberOnDate(memberships, '2026-07-01')).toBe(false);
        expect(isMemberOnDate(memberships, '2026-02-15')).toBe(false);
    });

    it('should return false if there are no memberships', () => {
        expect(isMemberOnDate([], '2026-06-15')).toBe(false);
    });
});
