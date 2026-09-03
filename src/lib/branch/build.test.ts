import { describe, expect, it } from 'vitest';

import { buildBranch } from './build';
import { PRESETS } from './presets';
import type { TokenValues } from './types';

const VALUES: TokenValues = {
    type: 'feature',
    project: 'CON',
    ticket: '1234',
    slug: 'Arreglar Login',
};

describe('buildBranch', () => {
    it.each([
        ['jira', 'feature/CON-1234-arreglar-login'],
        ['gitflow', 'feature/arreglar-login'],
        ['ticket-first', '1234-arreglar-login'],
    ])('el preset %s produce %j', (id, expected) => {
        const preset = PRESETS.find((candidate) => candidate.id === id)!;
        expect(buildBranch({ template: preset.template, values: VALUES }).name).toBe(expected);
    });

    it('devuelve el comando listo para pegar', () => {
        const result = buildBranch({ template: '{type}/{slug}', values: VALUES });
        expect(result.command).toBe('git checkout -b feature/arreglar-login');
    });

    it('sin nombre no hay comando', () => {
        const result = buildBranch({
            template: '{slug}',
            values: { type: '', project: '', ticket: '', slug: '' },
        });

        expect(result.name).toBe('');
        expect(result.command).toBe('');
        expect(result.validation.status).toBe('error');
    });

    it('reporta los problemas de la plantilla sin dejar de armar el nombre', () => {
        const result = buildBranch({ template: '{type}/{rama}', values: VALUES });
        expect(result.templateIssues).toEqual([{ kind: 'unknown-token', token: 'rama' }]);
        expect(result.name).toBe('feature/{rama}');
    });

    it('avisa cuando escribiste una descripción y el slug quedó vacío', () => {
        const result = buildBranch({
            template: '{type}/{slug}',
            values: { ...VALUES, slug: 'Привет' },
        });

        expect(result.slugDropped).toBe(true);
    });

    it('no avisa cuando la descripción está vacía de entrada', () => {
        const result = buildBranch({ template: '{type}/{slug}', values: { ...VALUES, slug: '' } });
        expect(result.slugDropped).toBe(false);
    });
});
