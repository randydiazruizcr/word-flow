// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { useBranchStore } from '@/store/branch-store';
import { TemplateInput } from './TemplateInput';

const initial = useBranchStore.getState();

describe('TemplateInput', () => {
    beforeEach(() => {
        useBranchStore.setState(initial, true);
    });

    it('inserta el token donde está el cursor', async () => {
        useBranchStore.getState().setTemplate('{type}/');
        const user = userEvent.setup();
        render(<TemplateInput />);

        const input = screen.getByLabelText('Plantilla') as HTMLInputElement;
        input.focus();
        input.setSelectionRange(7, 7);
        await user.click(screen.getByRole('button', { name: '{slug}' }));

        expect(useBranchStore.getState().config.template).toBe('{type}/{slug}');
    });

    it('escribir en el campo actualiza la plantilla', async () => {
        const user = userEvent.setup();
        render(<TemplateInput />);

        const input = screen.getByLabelText('Plantilla');
        await user.clear(input);
        await user.type(input, 'main');

        expect(useBranchStore.getState().config.template).toBe('main');
    });
});
