import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';
import { Navigation } from '@/components/nav';

export const metadata: Metadata = {
  title: 'SplitMe - Expense Sharing on Morph',
  description: 'Split expenses easily with your friends using blockchain technology',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f9fa' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth h-full" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <div className="flex flex-col min-h-screen">
          <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]">
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#f5f5f5,transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,rgba(30,30,30,0.8),transparent)]"></div>
          </div>
          
          <Providers>
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            
            <footer className="py-6 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-sm w-full mt-auto">
              <div className="container mx-auto px-4 text-center text-sm text-foreground/70">
                <p>© {new Date().getFullYear()} SplitMe. Powered by Morph. All rights reserved.</p>
              </div>
            </footer>
            
            <Toaster
              position="top-right"
              toastOptions={{
                className: '!bg-card-bg !text-foreground !border !border-border/50 !shadow-lg',
                duration: 3000,
              }}
            />
          </Providers>
        </div>
      </body>
    </html>
  );
}