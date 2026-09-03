export type Preset = {
    id: string;
    /** Se muestra en pantalla, por eso está en español. */
    name: string;
    template: string;
    types: string[];
};

export const DEFAULT_TYPES = ['feature', 'bugfix', 'hotfix', 'chore', 'release'];

export const PRESETS: Preset[] = [
    {
        id: 'jira',
        name: 'Jira / Azure Boards',
        template: '{type}/{project}-{ticket}-{slug}',
        types: DEFAULT_TYPES,
    },
    {
        id: 'gitflow',
        name: 'GitFlow',
        template: '{type}/{slug}',
        types: DEFAULT_TYPES,
    },
    {
        id: 'ticket-first',
        name: 'Ticket primero',
        template: '{ticket}-{slug}',
        types: DEFAULT_TYPES,
    },
];

export const DEFAULT_PRESET = PRESETS[0]!;
