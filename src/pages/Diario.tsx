import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ClipboardCheck, LogOut, Users, Trophy, Smartphone, Camera, Apple, Settings, Info, Play } from "lucide-react";
import { TutorialVideoModal, TutorialButton, useTutorialFirstVisit } from "@/components/TutorialVideoModal";
import { useNavigate, Link } from "react-router-dom";
import MomentumCircle from "@/components/MomentumCircle";
import StreakBadge from "@/components/StreakBadge";
import StatsOverview from "@/components/StatsOverview";
import QuickActionCard from "@/components/QuickActionCard";
import WeeklyChart from "@/components/WeeklyChart";
import CheckinModalRedesign from "@/components/CheckinModalRedesign";
import BadgeProgress from "@/components/BadgeProgress";
import BadgeGallery from "@/components/BadgeGallery";
import BadgeUnlockAnimation from "@/components/BadgeUnlockAnimation";
import ProgressWidget from "@/components/checks/ProgressWidget";
import Footer from "@/components/legal/Footer";
import CookieBanner from "@/components/legal/CookieBanner";
import BottomDock from "@/components/BottomDock";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckins } from "@/hooks/useCheckins";
import { useBadges } from "@/hooks/useBadges";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Diario = () => {
  const { user, signOut, loading: authLoading, isAdmin, isCollaborator, isSuperAdmin } = useAuth();
  const { 
    todayCheckin, 
    streak, 
    checkins,
    getWeeklyCheckins, 
    getDailyCompletionPercentage,
    calculateDailyScore,
    refetch,
    loading: checkinsLoading 
  } = useCheckins();
  
  const totalCheckins = checkins.length;
  const {
    currentBadge,
    showUnlockAnimation,
    newlyUnlockedBadge,
    closeUnlockAnimation,
  } = useBadges(streak, totalCheckins);
  
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isBadgeSheetOpen, setIsBadgeSheetOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { showTutorial, closeTutorial } = useTutorialFirstVisit();
  const navigate = useNavigate();

  // Check if app is already installed (standalone mode)
  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setIsStandalone(standalone);
    };
    checkStandalone();
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || checkinsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Caricamento...</div>
      </div>
    );
  }

  if (!user) return null;

  const completionPercentage = getDailyCompletionPercentage();
  const weeklyData = getWeeklyCheckins();

  const handleCheckinComplete = () => {
    setIsCheckinOpen(false);
    refetch();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Transform weekly data for charts
  const chartData = weeklyData.map(checkin => ({
    date: checkin.date,
    recovery: checkin.recovery || 0,
    nutritionHit: checkin.nutrition_adherence || false,
    energy: checkin.energy || 0,
    mindset: checkin.mindset || 0,
    twoPercentEdge: checkin.two_percent_edge || '',
  }));

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-5 py-6 sm:py-8 pb-24">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                <span className="text-primary">362</span>
                <span className="text-foreground">gradi</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Il Diario del tuo 2%</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <StreakBadge streak={streak} />
            <TutorialButton />
            <NotificationBell />
            {(isAdmin || isCollaborator || isSuperAdmin) && (
              <Link to="/gestionediario">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:text-primary/80"
                >
                  <Users className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <Link to="/settings">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </motion.header>

        {/* PRIORITY: Check-in Giornaliero - TOP OF PAGE (RED) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 sm:mb-8"
        >
          <QuickActionCard
            title={todayCheckin ? "Aggiorna Check-in" : "Check-in Giornaliero"}
            description={todayCheckin ? "Modifica il tuo check-in di oggi" : "Registra il tuo progresso di oggi"}
            icon={ClipboardCheck}
            variant="red"
            onClick={() => setIsCheckinOpen(true)}
          />
        </motion.div>

        {/* Momentum Circle */}
        <motion.section
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-6 sm:mb-8"
        >
          <MomentumCircle 
            percentage={completionPercentage} 
            hasCheckinToday={!!todayCheckin}
          />
        </motion.section>

        {/* Badge Progress - Clickable to open gallery */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 sm:mb-8"
        >
          <Sheet open={isBadgeSheetOpen} onOpenChange={setIsBadgeSheetOpen}>
            <SheetTrigger asChild>
              <div className="cursor-pointer hover:opacity-90 transition-opacity">
                <BadgeProgress 
                  streak={streak} 
                  totalCheckins={totalCheckins} 
                />
              </div>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-badge-gold" />
                  Elite Evolution
                </SheetTitle>
              </SheetHeader>
              <BadgeGallery 
                streak={streak} 
                totalCheckins={totalCheckins} 
              />
            </SheetContent>
          </Sheet>
        </motion.section>

        {/* Stats Overview */}
        {todayCheckin && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 sm:mb-8"
          >
            <StatsOverview 
              recovery={todayCheckin.recovery || 0}
              nutritionHit={todayCheckin.nutrition_adherence || false}
              energy={todayCheckin.energy || 0}
              mindset={todayCheckin.mindset || 0}
            />
          </motion.section>
        )}

        {/* Weekly Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 sm:mb-8"
        >
          <WeeklyChart data={chartData} />
        </motion.section>

        {/* Progress Widget - Weight & Photos from User Checks */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6 sm:mb-8"
        >
          <ProgressWidget />
        </motion.section>

        {/* Quick Actions */}
        <div className="space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <QuickActionCard
              title="I Tuoi Check"
              description="Registra peso e foto mensili"
              icon={Camera}
              variant="blue"
              onClick={() => navigate('/checks')}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <QuickActionCard
              title="Area Privata Teachable"
              description="Accedi alla tua libreria di formazione"
              icon={GraduationCap}
              variant="orange"
              onClick={() => window.open('https://sso.teachable.com/secure/564301/identity/login/otp', '_blank')}
            />
            <p className="text-xs text-muted-foreground mt-1 px-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Usa le stesse credenziali di Teachable
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <QuickActionCard
              title="Nutrium"
              description="Accedi al tuo piano alimentare"
              icon={Apple}
              variant="purple"
              onClick={() => window.open('https://app.nutrium.com/', '_blank')}
            />
            <p className="text-xs text-muted-foreground mt-1 px-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Usa le stesse credenziali di Nutrium
            </p>
          </motion.div>

          {/* Install App - only show if not in standalone mode */}
          {!isStandalone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <QuickActionCard
                title="Installa App"
                description="Scarica l'app sul tuo telefono"
                icon={Smartphone}
                variant="default"
                onClick={() => navigate('/install')}
              />
            </motion.div>
          )}
        </div>

        {/* Daily Checkin Modal - NEW REDESIGN */}
        <CheckinModalRedesign
          isOpen={isCheckinOpen}
          onClose={() => setIsCheckinOpen(false)}
          onComplete={handleCheckinComplete}
          existingCheckin={todayCheckin}
        />
        
        {/* Badge Unlock Animation */}
        <BadgeUnlockAnimation
          badge={newlyUnlockedBadge}
          isOpen={showUnlockAnimation}
          onClose={closeUnlockAnimation}
        />
      </div>
      
      {/* Bottom Dock */}
      <BottomDock />
      
      {/* Footer */}
      <Footer />
      
      {/* Cookie Banner */}
      <CookieBanner />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* Tutorial Video Modal - First Visit */}
      <TutorialVideoModal isOpen={showTutorial} onClose={closeTutorial} />
    </div>
  );
};

export default Diario;
