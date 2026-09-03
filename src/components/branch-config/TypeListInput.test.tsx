// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { useBranchStore } from '@/store/branch-store';
import { TypeListInput } from './TypeListInput';

const initial = useBranchStore.getState();

describe('TypeListInput', () => {
    beforeEach(() => {
        useBranchStore.setState(initial, true);
    });

    it('deja escribir la coma y el espacio sin comérselos', async () => {
        useBranchStore.getState().setTypes('feature');
        const user = userEvent.setup();
        render(<TypeListInput />);

        const input = screen.getByLabelText('Tipos');
        await user.type(input, ', hotfix');

        expect(input).toHaveValue('feature, hotfix');
        expect(useBranchStore.getState().config.types).toEqual(['feature', 'hotfix']);
    });

    it('se re-sincroniza cuando la lista cambia desde afuera', async () => {
        render(<TypeListInput />);

        await act(async () => {
            useBranchStore.getState().setTypes('docs, spike');
        });

        expect(screen.getByLabelText('Tipos')).toHaveValue('docs, spike');
    });
});
