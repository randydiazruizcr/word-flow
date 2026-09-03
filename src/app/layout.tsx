import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

/** Inter para la interfaz; JetBrains Mono para todo lo que sea nombre de rama o comando. */
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'word-flow · Nombres de rama de git',
    description:
        'Armá nombres de rama de git con tu propia plantilla: sin tildes, sin separadores de más y válidos para git. Todo pasa en tu navegador.',
};

export const viewport: Viewport = {
    themeColor: '#0a0c11',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
