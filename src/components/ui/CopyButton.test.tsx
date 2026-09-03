// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CopyButton } from './CopyButton';

/**
 * `userEvent.setup()` instala su propio portapapeles falso, así que el espía se pone
 * después: si no, lo pisa y `writeText` nunca se llama.
 */
function spyOnClipboard() {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true,
    });
    return writeText;
}

describe('CopyButton', () => {
    it('copia el valor y lo confirma en el mismo botón', async () => {
        const user = userEvent.setup();
        const writeText = spyOnClipboard();

        render(<CopyButton value="feature/algo" label="Copiar rama" />);
        await user.click(screen.getByRole('button', { name: 'Copiar rama' }));

        expect(writeText).toHaveBeenCalledWith('feature/algo');
        expect(await screen.findByText('Copiado')).toBeInTheDocument();
    });

    it('sin valor que copiar, el botón está deshabilitado', async () => {
        const user = userEvent.setup();
        const writeText = spyOnClipboard();

        render(<CopyButton value="" label="Copiar rama" />);
        await user.click(screen.getByRole('button', { name: 'Copiar rama' }));

        expect(writeText).not.toHaveBeenCalled();
    });
});
