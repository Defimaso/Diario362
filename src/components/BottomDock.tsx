import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardCheck, Apple, Dumbbell, TrendingUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVideoCorrections } from '@/hooks/useVideoCorrections';

interface NavItem {
  path: string;
  icon: typeof ClipboardCheck;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/diario', icon: ClipboardCheck, label: 'Diario' },
  { path: '/nutrizione', icon: Apple, label: 'Nutrizione' },
  { path: '/documenti', icon: FileText, label: 'Documenti' },
  { path: '/allenamento', icon: Dumbbell, label: 'Allenamento' },
  { path: '/progressi', icon: TrendingUp, label: 'Progressi' },
];

const BottomDock = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useVideoCorrections();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-lg px-4 pb-[env(safe-area-inset-bottom,8px)]">
        <div
          className={cn(
            "flex justify-around items-center py-3 px-4 rounded-2xl mb-2",
            "bg-card/80 backdrop-blur-xl border border-border/50",
            "shadow-lg shadow-black/10"
          )}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            const showBadge = item.path === '/allenamento' && unreadCount > 0;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-200 relative",
                  "hover:bg-muted/50 active:scale-95",
                  isActive && "bg-muted/30"
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isActive
                        ? "text-[hsl(var(--section-red))]"
                        : "text-muted-foreground"
                    )}
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive
                      ? "text-[hsl(var(--section-red))]"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomDock;
