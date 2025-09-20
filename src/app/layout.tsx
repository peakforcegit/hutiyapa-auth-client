import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata = { title: 'Auth Client', description: 'Enterprise Auth Frontend' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="grammarly-disable-indicator" content="true" />
      </head>
      <body className="min-h-screen antialiased bg-white text-gray-900 dark:bg-black dark:text-white" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
