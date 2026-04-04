import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LanguageProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  title: {
    default: '服装生产 ERP 管理系统',
    template: '%s | 服装生产 ERP',
  },
  description: '专业的服装生产 ERP 管理系统，提供 BOM 管理、审核管理、库存管理等全方位功能',
  keywords: [
    '服装 ERP',
    '生产管理',
    'BOM 管理',
    '库存管理',
    '车间管理',
    '审核管理',
  ],
  authors: [{ name: 'ERP Team' }],
  generator: 'Next.js',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            {isDev && <Inspector />}
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
