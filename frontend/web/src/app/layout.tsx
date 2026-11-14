import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { WebAppProvider } from '@/providers/web-provider.tsx';

export const metadata: Metadata = {
  title: 'পালিতো · Palito — Livestock Health, Credit & Insurance Platform',
  description:
    'Integrated livestock health passports, IoT telemetry, 70% LTV collateral lending, veterinary telemedicine, and debt-first insurance settlements.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <body>
        <WebAppProvider>{children}</WebAppProvider>
      </body>
    </html>
  );
}
