// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useBranchStore } from '@/store/branch-store';
import { GitCommand } from './GitCommand';

const initial = useBranchStore.getState();

describe('GitCommand', () => {
    beforeEach(() => {
        useBranchStore.setState(initial, true);
        useBranchStore.getState().setType('feature');
        useBranchStore.getState().setDescription('Arreglar login');
    });

    it('muestra el comando cuando el nombre sirve', () => {
        render(<GitCommand />);
        expect(screen.getByTestId('git-command')).toHaveTextContent(
            'git checkout -b feature/arreglar-login'
        );
    });

    it('no ofrece un comando que git va a rechazar', () => {
        useBranchStore.getState().setTemplate('{type}/{slug}.lock');
        render(<GitCommand />);
        expect(screen.queryByTestId('git-command')).not.toBeInTheDocument();
    });
});
