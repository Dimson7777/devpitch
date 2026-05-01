import { LogoMark } from '@/components/logo';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-2.5">
          <LogoMark size={18} />
          <span className="text-sm font-medium text-muted-foreground">DevPitch Pro</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Built for developers who want to present their best work.
        </p>
      </div>
    </footer>
  );
}
