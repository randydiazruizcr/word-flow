import { beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_PRESET, PRESETS } from '@/lib/branch/presets';
import { useBranchStore } from './branch-store';

const initial = useBranchStore.getState();

describe('branch-store', () => {
    beforeEach(() => {
        useBranchStore.setState(initial, true);
    });

    it('arranca con el preset por defecto', () => {
        expect(useBranchStore.getState().config.template).toBe(DEFAULT_PRESET.template);
        expect(useBranchStore.getState().values.type).toBe(DEFAULT_PRESET.types[0]);
    });

    it('aplicar un preset cambia plantilla y tipos', () => {
        useBranchStore.getState().applyPreset('gitflow');
        const preset = PRESETS.find((candidate) => candidate.id === 'gitflow')!;
        expect(useBranchStore.getState().config.template).toBe(preset.template);
    });

    it('un preset desconocido no toca nada', () => {
        useBranchStore.getState().applyPreset('no-existe');
        expect(useBranchStore.getState().config.template).toBe(DEFAULT_PRESET.template);
    });

    it('la lista de tipos se escribe separada por comas y se limpia', () => {
        useBranchStore.getState().setTypes(' feature , , hotfix ,');
        expect(useBranchStore.getState().config.types).toEqual(['feature', 'hotfix']);
    });

    it('si el tipo elegido desaparece de la lista, cae al primero', () => {
        useBranchStore.getState().setType('release');
        useBranchStore.getState().setTypes('feature, hotfix');
        expect(useBranchStore.getState().values.type).toBe('feature');
    });

    it('si la lista queda vacía, el tipo queda vacío', () => {
        useBranchStore.getState().setTypes('');
        expect(useBranchStore.getState().values.type).toBe('');
    });

    it('limpiar borra ticket y descripción, nunca la configuración', () => {
        useBranchStore.getState().setProject('CON');
        useBranchStore.getState().setTicket('1234');
        useBranchStore.getState().setDescription('algo');
        useBranchStore.getState().clearValues();

        expect(useBranchStore.getState().values.ticket).toBe('');
        expect(useBranchStore.getState().values.description).toBe('');
        expect(useBranchStore.getState().config.project).toBe('CON');
    });

    it('loadConfig solo pisa lo que viene', () => {
        useBranchStore.getState().loadConfig({ project: 'CON' });
        expect(useBranchStore.getState().config.project).toBe('CON');
        expect(useBranchStore.getState().config.template).toBe(DEFAULT_PRESET.template);
    });
});
