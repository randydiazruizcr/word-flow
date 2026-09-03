import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn', () => {
    it('junta clases y descarta las vacías', () => {
        expect(cn('a', false && 'b', 'c')).toBe('a c');
    });

    it('la última clase de Tailwind gana', () => {
        expect(cn('p-2', 'p-4')).toBe('p-4');
    });
});
