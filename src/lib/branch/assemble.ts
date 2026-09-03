import { MODE_BY_TOKEN, slugify } from './slugify';
import type { Segment, TemplateNode, TokenValues } from './types';

/** Un token cuyo valor quedó vacío: no se emite, pero sí condiciona a sus vecinos. */
type Hole = { text: null; source: 'hole' };
type Item = Segment | Hole;

export function assemble(nodes: TemplateNode[], values: TokenValues): Segment[] {
    const items: Item[] = nodes.map((node) => {
        if (node.kind === 'literal') return { text: node.text, source: 'literal' as const };

        const text = slugify(values[node.name], MODE_BY_TOKEN[node.name]);
        return text === '' ? { text: null, source: 'hole' as const } : { text, source: node.name };
    });

    collapseHoles(items);

    const segments = items.filter(
        (item): item is Segment => item.text !== null && item.text !== ''
    );

    return trimEdges(segments);
}

/**
 * Por cada hueco recorta un solo lado: primero el literal de la izquierda y, si ahí no
 * había nada que sacar, el de la derecha. Recortar los dos pegaría `CON` con la
 * descripción. La barra nunca se recorta acá.
 */
function collapseHoles(items: Item[]): void {
    items.forEach((item, index) => {
        if (item.source !== 'hole') return;

        const previous = items[index - 1];
        const next = items[index + 1];

        let trimmed = false;
        if (previous?.source === 'literal') {
            const shortened = previous.text.replace(/[-_.]+$/, '');
            trimmed = shortened !== previous.text;
            previous.text = shortened;
        }

        // Con `{type}/{ticket}-{slug}` el literal de la izquierda es «/», que no se
        // recorta: sin este segundo intento quedaría `feature/-arreglar-login`.
        if (!trimmed && next?.source === 'literal') {
            next.text = next.text.replace(/^[-_.]+/, '');
        }

        // Un hueco entre dos barras dejaría `//`, que git rechaza.
        if (previous?.source === 'literal' && next?.source === 'literal') {
            if (previous.text.endsWith('/') && next.text.startsWith('/')) {
                next.text = next.text.slice(1);
            }
        }
    });
}

/** Nada de nombres que empiecen o terminen en separador: git rechaza varios de esos. */
function trimEdges(segments: Segment[]): Segment[] {
    const out = segments.map((segment) => ({ ...segment }));

    while (out.length > 0 && out[0]!.source === 'literal') {
        out[0]!.text = out[0]!.text.replace(/^[-_./]+/, '');
        if (out[0]!.text !== '') break;
        out.shift();
    }

    while (out.length > 0 && out[out.length - 1]!.source === 'literal') {
        const last = out[out.length - 1]!;
        last.text = last.text.replace(/[-_./]+$/, '');
        if (last.text !== '') break;
        out.pop();
    }

    return out;
}

export function joinSegments(segments: Segment[]): string {
    return segments.map((segment) => segment.text).join('');
}
