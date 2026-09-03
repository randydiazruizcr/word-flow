import type { Issue, ValidationResult } from './types';

/** Git no impone un límite, pero pasando esto el nombre se corta en cualquier terminal. */
export const MAX_LENGTH = 100;

type Rule = {
    issue: Issue;
    fails: (name: string) => boolean;
};

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;
const SPECIAL_CHARS = /[~^:?*[]/;

/**
 * Las reglas de `git check-ref-format`, que es lo que corre `git checkout -b`.
 * Los valores de los tokens salen limpios de slugify: lo que llega acá roto viene
 * del texto literal de la plantilla, que a propósito no se toca.
 */
const ERRORS: Rule[] = [
    {
        issue: {
            rule: 'empty',
            severity: 'error',
            message: 'Todavía no hay nombre: completá los campos.',
        },
        fails: (name) => name === '',
    },
    {
        issue: {
            rule: 'leading-dash',
            severity: 'error',
            message: 'No puede empezar con «-»: git lo lee como si fuera una opción.',
        },
        fails: (name) => name.startsWith('-'),
    },
    {
        issue: {
            rule: 'component-leading-dot',
            severity: 'error',
            message: 'Ningún tramo puede empezar con «.».',
        },
        fails: (name) => name.split('/').some((part) => part.startsWith('.')),
    },
    {
        issue: {
            rule: 'trailing-dot',
            severity: 'error',
            message: 'No puede terminar en «.».',
        },
        fails: (name) => name.endsWith('.'),
    },
    {
        issue: {
            rule: 'lock-suffix',
            severity: 'error',
            message: 'Ningún tramo puede terminar en «.lock»: git usa ese sufijo para lo suyo.',
        },
        fails: (name) => name.split('/').some((part) => part.endsWith('.lock')),
    },
    {
        issue: {
            rule: 'double-dot',
            severity: 'error',
            message: 'No puede contener «..».',
        },
        fails: (name) => name.includes('..'),
    },
    {
        issue: {
            rule: 'at-brace',
            severity: 'error',
            message: 'No puede contener «@{»: git lo usa para el reflog.',
        },
        fails: (name) => name.includes('@{'),
    },
    {
        issue: {
            rule: 'single-at',
            severity: 'error',
            message: 'No puede ser solo «@».',
        },
        fails: (name) => name === '@',
    },
    {
        issue: {
            rule: 'backslash',
            severity: 'error',
            message: 'No puede contener «\\».',
        },
        fails: (name) => name.includes('\\'),
    },
    {
        issue: {
            rule: 'space',
            severity: 'error',
            message: 'No puede contener espacios.',
        },
        fails: (name) => /\s/.test(name),
    },
    {
        issue: {
            rule: 'control-char',
            severity: 'error',
            message: 'Se coló un carácter de control: borralo y volvé a escribir.',
        },
        fails: (name) => CONTROL_CHARS.test(name),
    },
    {
        issue: {
            rule: 'special-char',
            severity: 'error',
            message: 'No puede contener ~ ^ : ? * ni [.',
        },
        fails: (name) => SPECIAL_CHARS.test(name),
    },
    {
        issue: {
            rule: 'slash-edge',
            severity: 'error',
            message: 'No puede empezar ni terminar con «/».',
        },
        fails: (name) => name.startsWith('/') || name.endsWith('/'),
    },
    {
        issue: {
            rule: 'double-slash',
            severity: 'error',
            message: 'No puede contener «//».',
        },
        fails: (name) => name.includes('//'),
    },
];

const WARNINGS: Rule[] = [
    {
        issue: {
            rule: 'too-long',
            severity: 'warning',
            message: `Pasa de ${MAX_LENGTH} caracteres: se corta en casi cualquier terminal.`,
        },
        fails: (name) => name.length > MAX_LENGTH,
    },
];

export function validateBranchName(name: string): ValidationResult {
    const issues = [...ERRORS, ...WARNINGS]
        .filter((rule) => rule.fails(name))
        .map((rule) => rule.issue);

    if (issues.some((issue) => issue.severity === 'error')) return { status: 'error', issues };
    if (issues.length > 0) return { status: 'warning', issues };
    return { status: 'ok', issues };
}
