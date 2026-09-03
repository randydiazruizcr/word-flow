import { describe, expect, it } from 'vitest';

import type { RuleId } from './types';
import { MAX_LENGTH, validateBranchName } from './validate';

function rules(name: string): RuleId[] {
    return validateBranchName(name).issues.map((issue) => issue.rule);
}

describe('validateBranchName', () => {
    it('acepta un nombre normal', () => {
        expect(validateBranchName('feature/CON-1234-arreglar-login')).toEqual({
            status: 'ok',
            issues: [],
        });
    });

    it.each<[string, RuleId]>([
        ['', 'empty'],
        ['-feature/algo', 'leading-dash'],
        ['feature/.algo', 'component-leading-dot'],
        ['feature/algo.', 'trailing-dot'],
        ['feature/algo.lock', 'lock-suffix'],
        ['feature/al..go', 'double-dot'],
        ['feature/algo@{1}', 'at-brace'],
        ['@', 'single-at'],
        ['feature\\algo', 'backslash'],
        ['feature/con espacio', 'space'],
        ['feature/algo\u0007', 'control-char'],
        ['feature/algo~1', 'special-char'],
        ['/feature/algo', 'slash-edge'],
        ['feature//algo', 'double-slash'],
    ])('rechaza %j por la regla %s', (name, rule) => {
        expect(rules(name)).toContain(rule);
        expect(validateBranchName(name).status).toBe('error');
    });

    it.each([
        'feature/algo^1',
        'feature/algo:x',
        'feature/algo?',
        'feature/algo*',
        'feature/algo[1]',
    ])('también rechaza %j por carácter especial', (name) => {
        expect(rules(name)).toContain('special-char');
    });

    it('avisa, sin rechazar, cuando el nombre es larguísimo', () => {
        const result = validateBranchName(`feature/${'a'.repeat(MAX_LENGTH)}`);
        expect(result.status).toBe('warning');
        expect(result.issues.map((issue) => issue.rule)).toEqual(['too-long']);
    });

    it('justo en el límite no avisa', () => {
        expect(validateBranchName('a'.repeat(MAX_LENGTH)).status).toBe('ok');
    });

    it('un error pesa más que un aviso', () => {
        expect(validateBranchName(`feature/${'a'.repeat(MAX_LENGTH)} x`).status).toBe('error');
    });
});
