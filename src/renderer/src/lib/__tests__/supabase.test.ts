import { describe, it, expect, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn((url, key) => ({ url, key }))
}));

describe('Supabase Client Initializer', () => {
    it('should initialize supabase client with environment variables', async () => {
        const { supabase } = await import('../supabase');
        expect(supabase).toBeDefined();
        let expectedUrl = import.meta.env.VITE_SUPABASE_URL || '';
        if (expectedUrl.endsWith('/rest/v1/')) {
            expectedUrl = expectedUrl.slice(0, -9);
        } else if (expectedUrl.endsWith('/rest/v1')) {
            expectedUrl = expectedUrl.slice(0, -8);
        }
        expect((supabase as any).url).toBe(expectedUrl);
        expect((supabase as any).key).toBe(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
    });
});
