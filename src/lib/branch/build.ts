import { assemble, joinSegments } from './assemble';
import { parseTemplate } from './template';
import type { Segment, TemplateIssue, TemplateNode, TokenValues, ValidationResult } from './types';
import { validateBranchName } from './validate';

export type BranchResult = {
    nodes: TemplateNode[];
    templateIssues: TemplateIssue[];
    segments: Segment[];
    name: string;
    validation: ValidationResult;
    /** Vacío cuando no hay nombre, así la UI no muestra un comando a medias. */
    command: string;
    /** Escribiste una descripción y no sobrevivió nada de ella (cirílico, emoji sueltos…). */
    slugDropped: boolean;
};

/**
 * El único punto de entrada de todo lo que está por encima de `lib/branch`: nadie más
 * llama a parseTemplate, assemble o validateBranchName por su cuenta.
 */
export function buildBranch({
    template,
    values,
}: {
    template: string;
    values: TokenValues;
}): BranchResult {
    const { nodes, issues } = parseTemplate(template);
    const segments = assemble(nodes, values);
    const name = joinSegments(segments);

    return {
        nodes,
        templateIssues: issues,
        segments,
        name,
        validation: validateBranchName(name),
        command: name === '' ? '' : `git checkout -b ${name}`,
        slugDropped:
            values.slug.trim() !== '' && !segments.some((segment) => segment.source === 'slug'),
    };
}
