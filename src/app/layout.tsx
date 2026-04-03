
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/contexts/auth-context';
import { FloatingChat } from '@/components/floating-chat';
import { AIDoubtBot } from '@/components/ai-doubt-bot';

export const metadata: Metadata = {
  title: 'Edu Portal',
  description: 'Explore technology domains, discover career paths, and accelerate your tech journey with AI-powered tools.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased min-h-screen flex flex-col relative overflow-x-hidden bg-background text-foreground')}>
        <AuthProvider>
          {/* Animated Background */}
          <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-float-delayed"></div>
            <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-r from-fuchsia-500/15 to-violet-500/15 rounded-full blur-3xl animate-float"></div>
            <div className="absolute top-2/3 right-10 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-cyan-400/10 rounded-full blur-2xl animate-float-delayed"></div>
          </div>
          
          <Header />
          <main className="flex-1 relative z-10">{children}</main>
          <Toaster />
          <FloatingChat />
          <AIDoubtBot />
        </AuthProvider>
      </body>
    </html>
  );
}
