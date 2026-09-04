import { create } from 'zustand';

import { DEFAULT_PRESET, PRESETS } from '@/lib/branch/presets';

/** La convención del equipo: es lo único que viaja en la URL. */
export type Config = {
    template: string;
    project: string;
    types: string[];
};

/** Esta rama, ahora: no sale nunca de la pestaña. */
export type Values = {
    type: string;
    ticket: string;
    description: string;
};

type BranchStore = {
    config: Config;
    values: Values;
    setTemplate: (template: string) => void;
    setProject: (project: string) => void;
    setTypes: (raw: string) => void;
    setType: (type: string) => void;
    setTicket: (ticket: string) => void;
    setDescription: (description: string) => void;
    applyPreset: (id: string) => void;
    clearValues: () => void;
};

export function parseTypeList(raw: string): string[] {
    return raw
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry !== '');
}

/** El tipo elegido tiene que seguir existiendo en la lista; si no, cae al primero. */
function keepTypeValid(types: string[], current: string): string {
    return types.includes(current) ? current : (types[0] ?? '');
}

export const useBranchStore = create<BranchStore>((set) => ({
    config: {
        template: DEFAULT_PRESET.template,
        project: '',
        types: DEFAULT_PRESET.types,
    },
    values: {
        type: DEFAULT_PRESET.types[0] ?? '',
        ticket: '',
        description: '',
    },

    setTemplate: (template) => set((state) => ({ config: { ...state.config, template } })),
    setProject: (project) => set((state) => ({ config: { ...state.config, project } })),

    setTypes: (raw) =>
        set((state) => {
            const types = parseTypeList(raw);
            return {
                config: { ...state.config, types },
                values: { ...state.values, type: keepTypeValid(types, state.values.type) },
            };
        }),

    setType: (type) => set((state) => ({ values: { ...state.values, type } })),
    setTicket: (ticket) => set((state) => ({ values: { ...state.values, ticket } })),
    setDescription: (description) => set((state) => ({ values: { ...state.values, description } })),

    applyPreset: (id) =>
        set((state) => {
            const preset = PRESETS.find((candidate) => candidate.id === id);
            if (!preset) return state;

            return {
                config: { ...state.config, template: preset.template, types: preset.types },
                values: { ...state.values, type: keepTypeValid(preset.types, state.values.type) },
            };
        }),

    clearValues: () =>
        set((state) => ({ values: { ...state.values, ticket: '', description: '' } })),
}));
