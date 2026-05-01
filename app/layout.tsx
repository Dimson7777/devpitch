import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DevPitch Pro — Turn Projects Into Interview-Ready Stories',
  description:
    'DevPitch Pro helps developers explain what they built, why it matters, and how to present it professionally across CVs, LinkedIn, portfolios, and interviews.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Navbar />
        <div className="pt-14">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
