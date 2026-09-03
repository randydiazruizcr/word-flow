import type { ParsedTemplate, TemplateIssue, TemplateNode, TokenName } from './types';

export const TOKEN_NAMES = [
    'type',
    'project',
    'ticket',
    'slug',
] as const satisfies readonly TokenName[];

function isTokenName(value: string): value is TokenName {
    return (TOKEN_NAMES as readonly string[]).includes(value);
}

/** Nunca lanza: una plantilla a medio escribir tiene que seguir renderizando. */
export function parseTemplate(template: string): ParsedTemplate {
    const nodes: TemplateNode[] = [];
    const issues: TemplateIssue[] = [];

    if (template === '') return { nodes, issues: [{ kind: 'empty' }] };

    let cursor = 0;
    let literal = '';

    const flushLiteral = () => {
        if (literal !== '') {
            nodes.push({ kind: 'literal', text: literal });
            literal = '';
        }
    };

    while (cursor < template.length) {
        const char = template[cursor];

        if (char !== '{') {
            literal += char;
            cursor += 1;
            continue;
        }

        const close = template.indexOf('}', cursor);
        if (close === -1) {
            issues.push({ kind: 'unclosed-brace' });
            flushLiteral();
            nodes.push({ kind: 'literal', text: template.slice(cursor) });
            return { nodes, issues };
        }

        const name = template.slice(cursor + 1, close);
        flushLiteral();

        if (isTokenName(name)) {
            nodes.push({ kind: 'token', name });
        } else {
            issues.push({ kind: 'unknown-token', token: name });
            nodes.push({ kind: 'literal', text: template.slice(cursor, close + 1) });
        }

        cursor = close + 1;
    }

    flushLiteral();
    return { nodes, issues };
}
