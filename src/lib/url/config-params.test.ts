import { describe, expect, it } from 'vitest';

import { configFromParams, configToParams } from './config-params';

describe('config-params', () => {
    it('ida y vuelta sin perder nada', () => {
        const config = {
            template: '{type}/{project}-{ticket}-{slug}',
            project: 'CON',
            types: ['feature', 'hotfix'],
        };

        expect(configFromParams(configToParams(config))).toEqual(config);
    });

    it('sobrevive una plantilla con barras, llaves y espacios', () => {
        const config = { template: 'equipo x/{type} {slug}', project: 'CON', types: ['feature'] };
        expect(configFromParams(configToParams(config))).toEqual(config);
    });

    it('sin parámetros no devuelve nada que pisar', () => {
        expect(configFromParams(new URLSearchParams(''))).toEqual({});
    });

    it('lee solo los parámetros presentes', () => {
        expect(configFromParams(new URLSearchParams('p=CON'))).toEqual({ project: 'CON' });
    });

    it('limpia la lista de tipos que venga sucia', () => {
        expect(configFromParams(new URLSearchParams('types=feature,,+hotfix+'))).toEqual({
            types: ['feature', 'hotfix'],
        });
    });

    it('no escribe parámetros vacíos', () => {
        const params = configToParams({ template: '{slug}', project: '', types: [] });
        expect(params.has('p')).toBe(false);
        expect(params.has('types')).toBe(false);
    });
});
