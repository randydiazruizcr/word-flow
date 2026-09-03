'use client';

import { PRESETS } from '@/lib/branch/presets';
import { Button } from '@/components/ui/Button';
import { useBranchStore } from '@/store/branch-store';

export function PresetPicker() {
    const template = useBranchStore((state) => state.config.template);
    const applyPreset = useBranchStore((state) => state.applyPreset);

    return (
        <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-ink-mid">Convención</p>
            <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => (
                    <Button
                        key={preset.id}
                        aria-pressed={template === preset.template}
                        onClick={() => applyPreset(preset.id)}
                        className="aria-pressed:border-line-strong aria-pressed:text-ink"
                    >
                        {preset.name}
                    </Button>
                ))}
            </div>
        </div>
    );
}
