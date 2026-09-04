// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Select } from './Select';

const OPTIONS = ['feature', 'bugfix', 'hotfix'];

function setUp(props: Partial<React.ComponentProps<typeof Select>> = {}) {
    const onChange = vi.fn();
    render(
        <>
            <label htmlFor="type">Tipo</label>
            <Select id="type" value="feature" options={OPTIONS} onChange={onChange} {...props} />
        </>
    );
    return { onChange, user: userEvent.setup() };
}

describe('Select', () => {
    it('la etiqueta lo nombra, como haría un select nativo', () => {
        setUp();
        expect(screen.getByLabelText('Tipo')).toHaveAttribute('role', 'combobox');
    });

    it('abre la lista y elige con el mouse', async () => {
        const { onChange, user } = setUp();

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: /hotfix/ }));

        expect(onChange).toHaveBeenCalledWith('hotfix');
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('se maneja con el teclado', async () => {
        const { onChange, user } = setUp();

        screen.getByRole('combobox').focus();
        await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

        expect(onChange).toHaveBeenCalledWith('bugfix');
    });

    it('marca cuál está elegida', async () => {
        const { user } = setUp();

        await user.click(screen.getByRole('combobox'));

        expect(screen.getByRole('option', { name: /feature/ })).toHaveAttribute(
            'aria-selected',
            'true'
        );
        expect(screen.getByRole('option', { name: /hotfix/ })).toHaveAttribute(
            'aria-selected',
            'false'
        );
    });

    it('Escape cierra la lista y no deja que el atajo global se entere', async () => {
        const onDocumentEscape = vi.fn();
        document.addEventListener('keydown', onDocumentEscape);
        const { user } = setUp();

        await user.click(screen.getByRole('combobox'));
        onDocumentEscape.mockClear();
        await user.keyboard('{Escape}');

        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        expect(onDocumentEscape).not.toHaveBeenCalled();
        document.removeEventListener('keydown', onDocumentEscape);
    });

    it('Enter con la lista abierta elige y tampoco llega al atajo global', async () => {
        const onDocumentEnter = vi.fn();
        document.addEventListener('keydown', onDocumentEnter);
        const { user } = setUp();

        await user.click(screen.getByRole('combobox'));
        onDocumentEnter.mockClear();
        await user.keyboard('{Enter}');

        expect(onDocumentEnter).not.toHaveBeenCalled();
        document.removeEventListener('keydown', onDocumentEnter);
    });

    it('un clic afuera la cierra', async () => {
        const { user } = setUp();

        await user.click(screen.getByRole('combobox'));
        await user.click(document.body);

        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('deshabilitado no abre nada', async () => {
        const { user } = setUp({ disabled: true, value: '', placeholder: 'Sin tipos' });

        await user.click(screen.getByRole('combobox'));

        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        expect(screen.getByRole('combobox')).toHaveTextContent('Sin tipos');
    });
});
