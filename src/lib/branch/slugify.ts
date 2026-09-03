import type { TokenName } from './types';

export type SlugMode = 'slug' | 'preserve';

export const SEPARATOR = '-';

/**
 * Cómo se transforma el valor de cada token. `project` y `ticket` conservan las
 * mayúsculas porque `feature/CON-1234-…` es la forma que un equipo lee más rápido.
 */
export const MODE_BY_TOKEN: Record<TokenName, SlugMode> = {
    type: 'slug',
    project: 'preserve',
    ticket: 'preserve',
    slug: 'slug',
};

/** Letras que NFD no descompone, así que hay que traducirlas a mano. */
const TRANSLITERATIONS: Record<string, string> = {
    ß: 'ss',
    ẞ: 'SS',
    æ: 'ae',
    Æ: 'AE',
    œ: 'oe',
    Œ: 'OE',
    ø: 'o',
    Ø: 'O',
    đ: 'd',
    Đ: 'D',
    ł: 'l',
    Ł: 'L',
    þ: 'th',
    Þ: 'TH',
    ð: 'd',
    Ð: 'D',
};

const ACRONYM_BOUNDARY = /([A-Z]+)([A-Z][a-z])/g;
const CAMEL_BOUNDARY = /([a-z0-9])([A-Z])/g;
const COMBINING_MARKS = /[\u0300-\u036f]/g;

export function slugify(input: string, mode: SlugMode): string {
    let out = input;

    // Primero los cortes de camelCase, mientras las mayúsculas todavía significan algo.
    if (mode === 'slug') {
        out = out
            .replace(ACRONYM_BOUNDARY, `$1${SEPARATOR}$2`)
            .replace(CAMEL_BOUNDARY, `$1${SEPARATOR}$2`);
    }

    out = out.normalize('NFD').replace(COMBINING_MARKS, '');
    out = [...out].map((char) => TRANSLITERATIONS[char] ?? char).join('');

    if (mode === 'slug') out = out.toLowerCase();

    // Una sola regla para emoji, cirílico, CJK y puntuación: lo que no es ASCII
    // alfanumérico pasa a ser separador.
    const forbidden = mode === 'slug' ? /[^a-z0-9]+/g : /[^A-Za-z0-9]+/g;
    out = out.replace(forbidden, SEPARATOR);

    return trimSeparators(out);
}

function trimSeparators(value: string): string {
    return value.replace(/^-+/, '').replace(/-+$/, '');
}
