import Module, { createRequire } from 'node:module';

// TypeScript 7 es el compilador nativo: el paquete `typescript` conserva el
// nombre y el binario `tsc`, pero ya no publica la API de JavaScript del
// compilador (vuelve en la 7.1). typescript-eslint, que entra por
// eslint-config-next, sí la necesita: hace require('typescript'), ve la major 7
// y aborta a propósito mientras se evalúa esta config, así que `yarn lint` moría
// antes de leer un solo archivo. Hasta que soporte TS >= 7.1
// (https://github.com/typescript-eslint/typescript-eslint/issues/10940) el
// especificador `typescript` se redirige a @typescript/typescript6, el paquete
// que Microsoft publica justo para este uso lado a lado. El puente sólo vale
// dentro del proceso de ESLint: tsc, next build, Vitest y el editor siguen en la 7.
const require = createRequire(import.meta.url);
const resolveFilename = Module._resolveFilename;

Module._resolveFilename = function (request, ...rest) {
    if (request === 'typescript') {
        return resolveFilename.call(this, '@typescript/typescript6', ...rest);
    }
    if (request.startsWith('typescript/')) {
        return resolveFilename.call(
            this,
            `@typescript/typescript6/${request.slice('typescript/'.length)}`,
            ...rest,
        );
    }
    return resolveFilename.call(this, request, ...rest);
};

// Se cargan con require, no con un import estático, para que el puente de arriba
// ya esté puesto cuando se evalúe eslint-config-next y con él typescript-eslint.
const nextCoreWebVitals = require('eslint-config-next/core-web-vitals');
const nextTypeScript = require('eslint-config-next/typescript');
const prettier = require('eslint-config-prettier');

const eslintConfig = [
    {
        ignores: [
            '**/.next/**',
            '**/node_modules/**',
            '**/coverage/**',
            '**/out/**',
            '**/build/**',
            'next-env.d.ts',
        ],
    },
    ...nextCoreWebVitals,
    ...nextTypeScript,
    prettier,
    {
        // eslint-plugin-react detecta la versión de React llamando a
        // context.getFilename(), método que ESLint 10 quitó del contexto de
        // las reglas; con settings.react.version en 'detect' (el default de
        // eslint-config-next) react/display-name reventaba con
        // "contextOrFilename.getFilename is not a function". Se fija leyendo
        // la versión instalada en vez de dejar que la detecte.
        settings: {
            react: {
                version: require('react/package.json').version,
            },
        },
    },
    {
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/consistent-type-imports': [
                'warn',
                { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
            ],
        },
    },
];

export default eslintConfig;
