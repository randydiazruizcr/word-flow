import { describe, expect, it } from 'vitest';

import { parseTemplate } from './template';

describe('parseTemplate', () => {
    it('separa literales y tokens', () => {
        expect(parseTemplate('{type}/{slug}')).toEqual({
            nodes: [
                { kind: 'token', name: 'type' },
                { kind: 'literal', text: '/' },
                { kind: 'token', name: 'slug' },
            ],
            issues: [],
        });
    });

    it('acepta los cuatro tokens', () => {
        const { nodes, issues } = parseTemplate('{type}{project}{ticket}{slug}');
        expect(issues).toEqual([]);
        expect(nodes).toHaveLength(4);
    });

    it('una plantilla vacía avisa y no devuelve nodos', () => {
        expect(parseTemplate('')).toEqual({ nodes: [], issues: [{ kind: 'empty' }] });
    });

    it('un token desconocido queda como texto y se reporta', () => {
        expect(parseTemplate('{branch}-x')).toEqual({
            nodes: [
                { kind: 'literal', text: '{branch}' },
                { kind: 'literal', text: '-x' },
            ],
            issues: [{ kind: 'unknown-token', token: 'branch' }],
        });
    });

    it('una llave sin cerrar no rompe: se reporta y el resto es texto', () => {
        expect(parseTemplate('{type}/{slu')).toEqual({
            nodes: [
                { kind: 'token', name: 'type' },
                { kind: 'literal', text: '/' },
                { kind: 'literal', text: '{slu' },
            ],
            issues: [{ kind: 'unclosed-brace' }],
        });
    });

    it('una llave de cierre suelta es texto', () => {
        expect(parseTemplate('a}b')).toEqual({
            nodes: [{ kind: 'literal', text: 'a}b' }],
            issues: [],
        });
    });

    it('una plantilla sin tokens es válida', () => {
        expect(parseTemplate('main')).toEqual({
            nodes: [{ kind: 'literal', text: 'main' }],
            issues: [],
        });
    });
});
