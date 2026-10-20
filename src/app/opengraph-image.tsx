import { ImageResponse } from 'next/og';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** The share card: the branch glyph of the icon, the name and the one-line promise, on the app's dark canvas. */
export default function OpenGraphImage() {
    return new ImageResponse(
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '80px 96px',
                background: 'linear-gradient(135deg, #0a0c11 0%, #11141c 100%)',
                color: '#e7ebf3',
                fontFamily: 'Inter, "Segoe UI", sans-serif',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, height: 72 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                    <div
                        style={{ width: 22, height: 22, borderRadius: 11, background: '#f2b13c' }}
                    />
                    <div
                        style={{ width: 22, height: 22, borderRadius: 11, background: '#e7ebf3' }}
                    />
                </div>
                <div style={{ width: 54, height: 4, borderRadius: 2, background: '#6a748a' }} />
                <div style={{ width: 22, height: 22, borderRadius: 11, background: '#2dd4bf' }} />
            </div>
            <div
                style={{
                    display: 'flex',
                    marginTop: 44,
                    fontSize: 84,
                    fontWeight: 800,
                    letterSpacing: -2,
                }}
            >
                {SITE_NAME}
            </div>
            <div
                style={{
                    display: 'flex',
                    marginTop: 20,
                    fontSize: 34,
                    color: '#a3adc0',
                    maxWidth: 960,
                    lineHeight: 1.3,
                }}
            >
                {SITE_DESCRIPTION}
            </div>
            <div
                style={{
                    display: 'flex',
                    marginTop: 48,
                    fontSize: 24,
                    color: '#4f8cff',
                    fontFamily: '"JetBrains Mono", monospace',
                }}
            >
                feature/PROJ-123-nombre-de-la-rama
            </div>
        </div>,
        size
    );
}
