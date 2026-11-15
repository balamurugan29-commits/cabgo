import type { Metadata } from 'next';
import { Providers } from '@/components/shared/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'CabGo - Modern Uber Clone Cab Booking App',
  description: 'Enterprise full-stack ride hailing platform with customer, driver, and admin modules.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
