#!/usr/bin/env node
/**
 * Tailwind canonical classes.
 *
 * Finds the classes Tailwind can write in a shorter, canonical form: the warnings VS Code's
 * Tailwind extension shows as `suggestCanonicalClasses` (`rounded-[28px]` → `rounded-photo`,
 * `size-[18px]` → `size-4.5`, `top-[var(--x)]` → `top-(--x)`). With `--fix` it rewrites them
 * in place. It asks the project's own Tailwind, loaded with the project's own CSS, so custom
 * theme names count exactly as they do in the editor.
 *
 *   node scripts/tailwind-classes.mjs           report; exit code 1 if anything is found
 *   node scripts/tailwind-classes.mjs --fix     rewrite every finding
 *   node scripts/tailwind-classes.mjs --json    machine-readable report (used by Atlas)
 *
 * A file that must keep non-canonical classes (test data about this very check) opts out with
 * the comment `tailwind-classes: ignore-file` anywhere in it.
 *
 * The master copy is atlas/scripts/tailwind-classes.mjs; `yarn atlas classes --install` copies it
 * into every Tailwind v4 project of the workspace. Change it there, then install again.
 */
import console from 'node:console';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const fix = args.has('--fix');
const json = args.has('--json');

/** Folders never scanned: dependencies, build output, generated files. */
const SKIP_DIRS = new Set([
    'node_modules',
    '.next',
    '.git',
    '.vercel',
    '.turbo',
    'dist',
    'out',
    'build',
    'coverage',
    'public',
    'playwright-report',
    'test-results',
]);
const SOURCE = /\.(tsx|ts|jsx|js|mjs|mdx|html)$/;
/** Characters that end a class name inside a string, a template literal or markup. */
const EDGE = `\\s'"\``;

async function* walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.') && entry.name !== '.storybook') {
            if (entry.isDirectory()) continue;
        }
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name)) yield* walk(full);
        } else if (SOURCE.test(entry.name) && !entry.name.endsWith('.d.ts')) {
            yield full;
        }
    }
}

/** The stylesheet that imports Tailwind: the one the editor loads the theme from. */
async function findEntryCss() {
    const found = [];
    async function* css(dir) {
        for (const entry of await readdir(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (!SKIP_DIRS.has(entry.name) && !entry.name.startsWith('.')) yield* css(full);
            } else if (entry.name.endsWith('.css')) {
                yield full;
            }
        }
    }
    for await (const file of css(root)) {
        const text = await readFile(file, 'utf8');
        // The whole framework (`tailwindcss`) or its parts (`tailwindcss/theme.css`, …).
        if (/@import\s+["']tailwindcss(?:\/[^"']*)?["']/.test(text)) found.push({ file, text });
    }
    return found[0];
}

/** `@tailwindcss/node`, resolved through whichever Tailwind integration the project uses. */
function loadTailwindNode() {
    const require = createRequire(path.join(root, 'package.json'));
    for (const via of [null, '@tailwindcss/postcss', '@tailwindcss/vite', '@tailwindcss/cli']) {
        try {
            const from = via ? createRequire(require.resolve(via)) : require;
            return from.resolve('@tailwindcss/node');
        } catch {
            // Not this one; try the next integration.
        }
    }
    return null;
}

function lineOf(text, index) {
    let line = 1;
    for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++;
    return line;
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function main() {
    const entry = await findEntryCss();
    const tailwindNode = loadTailwindNode();
    if (!entry || !tailwindNode) {
        const reason = !entry ? 'no stylesheet imports tailwindcss' : '@tailwindcss/node not found';
        if (json) console.log(JSON.stringify({ skipped: reason, findings: [] }));
        else console.log(`Tailwind classes: skipped (${reason}).`);
        return 0;
    }

    const { __unstable__loadDesignSystem } = await import(pathToFileURL(tailwindNode).href);
    const design = await __unstable__loadDesignSystem(entry.text, {
        base: path.dirname(entry.file),
    });

    const verdicts = new Map();
    /** The canonical spelling of `token`, or null when it is not a class or already canonical. */
    const canonical = (token) => {
        if (verdicts.has(token)) return verdicts.get(token);
        let verdict = null;
        if (token.length <= 200 && /[a-z]/.test(token) && !token.includes('${')) {
            try {
                const [css] = design.candidatesToCss([token]);
                if (css) {
                    const [better] = design.canonicalizeCandidates([token], { rem: 16 });
                    if (better && better !== token) verdict = better;
                }
            } catch {
                // Not something Tailwind can parse: leave it alone.
            }
        }
        verdicts.set(token, verdict);
        return verdict;
    };

    const findings = [];
    for await (const file of walk(root)) {
        const rel = path.relative(root, file).split(path.sep).join('/');
        // This file quotes non-canonical classes as examples; it is never rewritten.
        if (rel === 'scripts/tailwind-classes.mjs') continue;
        let text = await readFile(file, 'utf8');
        // A file that quotes non-canonical classes on purpose (test data) opts out with this.
        if (text.includes('tailwind-classes: ignore-file')) continue;
        const tokens = new Set(text.split(/[\s'"`]+/).filter(Boolean));
        const changes = [];
        for (const token of tokens) {
            const better = canonical(token);
            if (better) changes.push([token, better]);
        }
        if (changes.length === 0) continue;

        for (const [from, to] of changes) {
            const pattern = new RegExp(`(?<=^|[${EDGE}])${escapeRegExp(from)}(?=$|[${EDGE}])`, 'g');
            for (const match of text.matchAll(pattern)) {
                findings.push({ file: rel, line: lineOf(text, match.index), from, to });
            }
            if (fix) text = text.replace(pattern, to);
        }
        if (fix) await writeFile(file, text);
    }

    findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
    if (json) {
        console.log(JSON.stringify({ fixed: fix, findings }));
        return 0;
    }
    if (findings.length === 0) {
        console.log('Tailwind classes: all canonical.');
        return 0;
    }
    for (const f of findings) console.log(`${f.file}:${f.line}  ${f.from}  →  ${f.to}`);
    if (fix) {
        console.log(`\nTailwind classes: rewrote ${findings.length} to their canonical form.`);
        return 0;
    }
    console.log(
        `\nTailwind classes: ${findings.length} can be written shorter. Run it with --fix to rewrite them.`
    );
    return 1;
}

process.exitCode = await main();
