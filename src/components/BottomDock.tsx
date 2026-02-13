import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardCheck, FolderOpen, TrendingUp, WifiOff, Lock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVideoCorrections } from '@/hooks/useVideoCorrections';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useSubscription } from '@/hooks/useSubscription';

interface NavItem {
  path: string;
  icon: typeof ClipboardCheck;
  label: string;
  premium?: boolean;
}

const navItems: NavItem[] = [
  { path: '/diario', icon: ClipboardCheck, label: 'Diario' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/area-personale', icon: FolderOpen, label: 'Materiali', premium: true },
  { path: '/progressi', icon: TrendingUp, label: 'Progressi' },
];

const BottomDock = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useVideoCorrections();
  const isOnline = useOnlineStatus();
  const { isPremium } = useSubscription();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-lg px-4 pb-[env(safe-area-inset-bottom,8px)]">
        {!isOnline && (
          <div className="flex items-center justify-center gap-2 py-1.5 px-3 mb-1 rounded-lg bg-warning/20 text-warning text-xs font-medium">
            <WifiOff className="w-3 h-3" />
            Sei offline
          </div>
        )}
        <div
          className={cn(
            "flex justify-around items-center py-3 px-4 rounded-2xl mb-2",
            "bg-card/80 backdrop-blur-xl border border-border/50",
            "shadow-lg shadow-black/10"
          )}
        >
          {navItems.map((item) => {
            const isLocked = item.premium && !isPremium;
            const isActive = !isLocked && location.pathname === item.path;
            const Icon = item.icon;
            const showBadge = item.path === '/area-personale' && unreadCount > 0 && !isLocked;

            return (
              <button
                key={item.path}
                onClick={() => navigate(isLocked ? '/upgrade' : item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-200 relative",
                  "hover:bg-muted/50 active:scale-95",
                  isActive && "bg-muted/30",
                  isLocked && "opacity-75"
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "w-7 h-7 transition-colors",
                      isLocked
                        ? "text-muted-foreground/60"
                        : isActive
                          ? "text-[hsl(var(--section-red))]"
                          : "text-muted-foreground"
                    )}
                  />
                  {isLocked && (
                    <Lock className="w-3 h-3 text-muted-foreground absolute -bottom-0.5 -right-0.5 bg-card rounded-full p-[1px]" />
                  )}
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    isLocked
                      ? "text-muted-foreground/60"
                      : isActive
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
