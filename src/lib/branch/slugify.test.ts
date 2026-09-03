import { describe, expect, it } from 'vitest';

import { slugify } from './slugify';

describe('slugify en modo slug', () => {
    it.each([
        ['Arreglar login', 'arreglar-login'],
        ['Corrección de tildes', 'correccion-de-tildes'],
        ['Ñoño', 'nono'],
        ['fixLoginBug', 'fix-login-bug'],
        ['FixLoginBug', 'fix-login-bug'],
        ['parseHTTPResponse', 'parse-http-response'],
        ['Straße', 'strasse'],
        ['Æther og Ø', 'aether-og-o'],
        ['deploy 🚀 ya', 'deploy-ya'],
        ['  espacios   de   más  ', 'espacios-de-mas'],
        ['guiones---repetidos', 'guiones-repetidos'],
        ['--bordes--', 'bordes'],
        ['feature/algo', 'feature-algo'],
        ['100% terminado', '100-terminado'],
        ['', ''],
        ['   ', ''],
        ['Привет', ''],
        ['日本語', ''],
    ])('convierte %j en %j', (input, expected) => {
        expect(slugify(input, 'slug')).toBe(expected);
    });
});

describe('slugify en modo preserve', () => {
    it.each([
        ['CON', 'CON'],
        ['1234', '1234'],
        ['my.project', 'my-project'],
        ['ABC 123', 'ABC-123'],
        ['fixLoginBug', 'fixLoginBug'],
        ['Straße', 'Strasse'],
        ['  CON  ', 'CON'],
        ['', ''],
    ])('convierte %j en %j', (input, expected) => {
        expect(slugify(input, 'preserve')).toBe(expected);
    });
});
