'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogoMark } from '@/components/logo';

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark size={22} />
          <span className="text-sm font-semibold tracking-tight">DevPitch Pro</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              pathname === '/'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Home
          </Link>
          <Link
            href="/generate"
            className={cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              pathname === '/generate'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Generator
          </Link>
          <Link
            href="/generate"
            className="btn-cta ml-3 inline-flex h-8 items-center justify-center rounded-xl px-3 text-xs"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
