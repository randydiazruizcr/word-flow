import { describe, expect, it } from 'vitest';

import { assemble, joinSegments } from './assemble';
import { parseTemplate } from './template';
import type { TokenValues } from './types';

const JIRA = '{type}/{project}-{ticket}-{slug}';

function build(template: string, values: Partial<TokenValues>) {
    const full: TokenValues = { type: '', project: '', ticket: '', slug: '', ...values };
    return joinSegments(assemble(parseTemplate(template).nodes, full));
}

describe('assemble', () => {
    it('arma el nombre completo', () => {
        expect(
            build(JIRA, {
                type: 'feature',
                project: 'CON',
                ticket: '1234',
                slug: 'Arreglar Login',
            })
        ).toBe('feature/CON-1234-arreglar-login');
    });

    it('un token vacío en medio no deja doble separador', () => {
        expect(build(JIRA, { type: 'feature', project: 'CON', slug: 'Arreglar Login' })).toBe(
            'feature/CON-arreglar-login'
        );
    });

    it('un token vacío al principio no deja separador colgando', () => {
        expect(build('{ticket}-{slug}', { slug: 'Arreglar Login' })).toBe('arreglar-login');
    });

    it('un token vacío al final no deja separador colgando', () => {
        expect(build(JIRA, { type: 'feature', project: 'CON', ticket: '1234' })).toBe(
            'feature/CON-1234'
        );
    });

    it('no se come la barra: solo recorta - _ .', () => {
        expect(build('{type}/{ticket}-{slug}', { type: 'feature', slug: 'Arreglar Login' })).toBe(
            'feature/arreglar-login'
        );
    });

    it('deja de sobrar la barra final cuando el último token está vacío', () => {
        expect(build('{type}/{slug}', { type: 'feature' })).toBe('feature');
    });

    it('dos vacíos seguidos entre barras dejan una sola barra', () => {
        expect(build('{type}/{ticket}/{slug}', { type: 'feature', slug: 'algo' })).toBe(
            'feature/algo'
        );
    });

    it('con todos los tokens vacíos devuelve vacío', () => {
        expect(build(JIRA, {})).toBe('');
    });

    it('una plantilla de puro literal se devuelve tal cual', () => {
        expect(build('main', {})).toBe('main');
    });

    it('respeta las // que escribió la persona: eso lo reporta validate, no se arregla solo', () => {
        expect(build('{type}//{slug}', { type: 'feature', slug: 'algo' })).toBe('feature//algo');
    });

    it('cada segmento sabe de qué token salió', () => {
        const segments = assemble(parseTemplate(JIRA).nodes, {
            type: 'feature',
            project: 'CON',
            ticket: '1234',
            slug: 'Arreglar Login',
        });

        expect(segments).toEqual([
            { text: 'feature', source: 'type' },
            { text: '/', source: 'literal' },
            { text: 'CON', source: 'project' },
            { text: '-', source: 'literal' },
            { text: '1234', source: 'ticket' },
            { text: '-', source: 'literal' },
            { text: 'arreglar-login', source: 'slug' },
        ]);
    });
});
