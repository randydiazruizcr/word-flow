'use client';

import { useMemo } from 'react';

import { buildBranch, type BranchResult } from '@/lib/branch/build';
import { useBranchStore } from './branch-store';

/**
 * El único lugar donde se deriva algo. Zustand 5 exige selectores que devuelvan
 * referencias estables, así que se suscribe a primitivos y memoiza el resultado.
 *
 * Acá también se traduce el nombre: el campo libre se llama `description` en el
 * store y `slug` en el motor.
 */
export function useBranchResult(): BranchResult {
    const template = useBranchStore((state) => state.config.template);
    const project = useBranchStore((state) => state.config.project);
    const type = useBranchStore((state) => state.values.type);
    const ticket = useBranchStore((state) => state.values.ticket);
    const description = useBranchStore((state) => state.values.description);

    return useMemo(
        () => buildBranch({ template, values: { type, project, ticket, slug: description } }),
        [template, project, type, ticket, description]
    );
}
