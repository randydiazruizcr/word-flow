import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom no implementa scrollIntoView. Lo usa el listbox para mantener a la vista la opción
// activa, así que sin este stub cualquier test que abra la lista revienta.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
}

afterEach(() => {
    cleanup();
});
