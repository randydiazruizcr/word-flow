// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useBranchStore } from '@/store/branch-store';
import { ValidationReport } from './ValidationReport';

const initial = useBranchStore.getState();

function setUp(template: string, description: string) {
    useBranchStore.setState(initial, true);
    useBranchStore.getState().setTemplate(template);
    useBranchStore.getState().setType('feature');
    useBranchStore.getState().setDescription(description);
}

describe('ValidationReport', () => {
    beforeEach(() => {
        useBranchStore.setState(initial, true);
    });

    it('dice que el nombre sirve', () => {
        setUp('{type}/{slug}', 'Arreglar login');
        render(<ValidationReport />);
        expect(screen.getByTestId('verdict')).toHaveAttribute('data-status', 'ok');
    });

    it('explica qué regla de git se rompió', () => {
        setUp('{type}/{slug}.lock', 'Arreglar login');
        render(<ValidationReport />);

        expect(screen.getByTestId('verdict')).toHaveAttribute('data-status', 'error');
        expect(screen.getByText(/\.lock/)).toBeInTheDocument();
    });

    it('avisa cuando la plantilla usa un token que no existe', () => {
        setUp('{type}/{rama}', 'Arreglar login');
        render(<ValidationReport />);

        const issues = within(screen.getByTestId('template-issues'));
        expect(issues.getByText(/«rama»/)).toBeInTheDocument();
    });

    it('con la pantalla recién abierta no recibe en rojo', () => {
        useBranchStore.getState().setType('');
        render(<ValidationReport />);
        expect(screen.getByTestId('verdict')).toHaveAttribute('data-status', 'empty');
    });

    it('avisa cuando la descripción no dejó nada usable', () => {
        setUp('{type}/{slug}', 'Привет');
        render(<ValidationReport />);
        expect(screen.getByTestId('slug-dropped')).toBeInTheDocument();
    });
});
