// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useBranchStore } from '@/store/branch-store';
import { BranchPreview } from './BranchPreview';

const initial = useBranchStore.getState();

describe('BranchPreview', () => {
    beforeEach(() => {
        useBranchStore.setState(initial, true);
    });

    it('pinta cada segmento con el color de su token', () => {
        useBranchStore.getState().setTemplate('{type}/{project}-{slug}');
        useBranchStore.getState().setProject('CON');
        useBranchStore.getState().setType('feature');
        useBranchStore.getState().setDescription('Arreglar Login');

        render(<BranchPreview />);

        expect(screen.getByTestId('segment-type')).toHaveTextContent('feature');
        expect(screen.getByTestId('segment-project')).toHaveTextContent('CON');
        expect(screen.getByTestId('segment-slug')).toHaveTextContent('arreglar-login');
    });

    it('sin datos muestra la plantilla como pista, atenuada', () => {
        useBranchStore.getState().setTemplate('{type}/{slug}');
        useBranchStore.getState().setType('');

        render(<BranchPreview />);

        expect(screen.getByTestId('branch-placeholder')).toBeInTheDocument();
    });
});
