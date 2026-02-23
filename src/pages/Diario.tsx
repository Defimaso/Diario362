import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ClipboardCheck, LogOut, Users, Trophy, Smartphone, Apple, Settings, Info, BookOpen, Lock, Crown, MessageCircle, Timer, ChevronDown, Check } from "lucide-react";
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
import DiarioPensieri from "@/components/DiarioPensieri";
import Footer from "@/components/legal/Footer";
import CookieBanner from "@/components/legal/CookieBanner";
import BottomDock from "@/components/BottomDock";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckins } from "@/hooks/useCheckins";
import { useBadges } from "@/hooks/useBadges";
import { useSubscription } from "@/hooks/useSubscription";
import { useMessages } from "@/hooks/useMessages";
import WeeklyRecapCard from "@/components/WeeklyRecapCard";
import ChallengeCard from "@/components/ChallengeCard";
import JourneyTimeline from "@/components/JourneyTimeline";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useOnboardingData } from "@/hooks/useOnboardingData";
import { GuideOnboarding, GuideButton } from "@/components/GuideOnboarding";
import FeedbackPrompt from "@/components/FeedbackPrompt";
import { supabase } from "@/integrations/supabase/client";

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
  
  const { isPremium, isTrial, trialDaysLeft } = useSubscription();
  const { unreadTotal } = useMessages();
  const { profile: onboardingProfile } = useOnboardingData(user?.id);

  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isBadgeSheetOpen, setIsBadgeSheetOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [percorso, setPercorso] = useState<string | null>(null);
  const navigate = useNavigate();

  const percorsiOptions = [
    "Metabolismo da Risvegliare",
    "Ottimizzazione Performance",
    "Equilibrio Emotivo",
    "Riattivazione Graduale",
    "Trasformazione Completa",
  ];

  // Sync percorso from onboarding data
  useEffect(() => {
    if (onboardingProfile?.profile_badge && !percorso) {
      setPercorso(onboardingProfile.profile_badge);
    }
  }, [onboardingProfile]);

  const handlePercorsoChange = async (newPercorso: string) => {
    setPercorso(newPercorso);
    if (!user) return;
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();
      if (profileData?.email) {
        await supabase
          .from('onboarding_leads')
          .update({ profile_badge: newPercorso })
          .eq('email', profileData.email);
      }
    } catch (err) {
      console.error('Error updating percorso:', err);
    }
  };

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
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg mx-auto px-4 sm:px-5 py-6 sm:py-8 pb-24">
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
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors outline-none">
                  {percorso || "Trasformazione Completa"}
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {percorsiOptions.map((p) => (
                    <DropdownMenuItem
                      key={p}
                      onClick={() => handlePercorsoChange(p)}
                      className="flex items-center justify-between gap-2"
                    >
                      {p}
                      {(percorso || "Trasformazione Completa") === p && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <GuideButton />
            <StreakBadge streak={streak} />
            <NotificationBell />
            {(isAdmin || isCollaborator || isSuperAdmin) && (
              <Link to="/gestionediario">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:text-primary/80 w-8 h-8"
                >
                  <Users className="w-4 h-4" />
                </Button>
              </Link>
            )}
            {/* Su sm+ mostra Settings e LogOut direttamente */}
            <Link to="/settings" className="hidden sm:inline-flex">
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
              className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
            >
              <LogOut className="w-5 h-5" />
            </Button>
            {/* Su mobile: dropdown "..." con Settings e LogOut */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground sm:hidden w-8 h-8"
                >
                  <span className="text-lg leading-none">⋯</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Impostazioni
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  Esci
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.header>

        {/* Trial Banner */}
        {isTrial && trialDaysLeft > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-medium">
                  Prova Premium: <span className="text-amber-500">{trialDaysLeft} giorni rimasti</span>
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                onClick={() => navigate('/upgrade')}
              >
                Attiva
              </Button>
            </div>
          </motion.div>
        )}

        {/* Beta Banner — sempre visibile */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02 }}
          className="mb-3 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center gap-2"
        >
          <span className="text-base">🧪</span>
          <p className="text-xs text-violet-400 font-medium leading-tight">
            App in fase di test — non è la versione definitiva. Grazie per la pazienza!
          </p>
        </motion.div>

        {/* Feedback Prompt — banner (1 volta) + FAB permanente */}
        <FeedbackPrompt />

        {/* Messages notification */}
        {unreadTotal > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/messaggi')}
            className="mb-4 p-3 rounded-2xl bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <p className="text-sm">
                Hai <span className="font-semibold text-primary">{unreadTotal}</span> messaggi non letti
              </p>
            </div>
          </motion.div>
        )}

        {/* PRIORITY: Check-in Giornaliero - TOP OF PAGE (RED) */}
        <motion.div
          id="tour-checkin"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 sm:mb-8"
        >
          <QuickActionCard
            title={todayCheckin ? "Aggiorna Diario" : "Diario Giornaliero"}
            description={todayCheckin ? "Modifica il diario di oggi" : "Registra il tuo progresso di oggi"}
            icon={ClipboardCheck}
            variant="red"
            onClick={() => setIsCheckinOpen(true)}
          />
        </motion.div>

        {/* Momentum Circle */}
        <motion.section
          id="tour-momentum"
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

        {/* Weekly Recap - visible to all */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <WeeklyRecapCard />
        </motion.section>

        {/* Stats Overview - Soft Gating */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="mb-6 sm:mb-8"
        >
          {isPremium ? (
            todayCheckin && (
              <StatsOverview
                recovery={todayCheckin.recovery || 0}
                nutritionHit={todayCheckin.nutrition_adherence || false}
                energy={todayCheckin.energy || 0}
                mindset={todayCheckin.mindset || 0}
              />
            )
          ) : (
            <div className="relative cursor-pointer" onClick={() => navigate('/upgrade')}>
              {/* Blurred preview */}
              <div className="filter blur-sm pointer-events-none select-none">
                <StatsOverview
                  recovery={7}
                  nutritionHit={true}
                  energy={8}
                  mindset={6}
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-background/40 rounded-2xl backdrop-blur-[1px]">
                <div className="text-center">
                  <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-lg font-semibold">Sblocca Statistiche</p>
                  <p className="text-sm text-muted-foreground">Attiva Premium</p>
                </div>
              </div>
            </div>
          )}
        </motion.section>

        {/* Weekly Chart - Soft Gating */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 sm:mb-8"
        >
          {isPremium ? (
            <WeeklyChart data={chartData} />
          ) : (
            <div className="relative cursor-pointer" onClick={() => navigate('/upgrade')}>
              <div className="filter blur-sm pointer-events-none select-none">
                <WeeklyChart data={[
                  { date: '2025-01-06', recovery: 7, nutritionHit: true, energy: 8, mindset: 6, twoPercentEdge: '' },
                  { date: '2025-01-07', recovery: 6, nutritionHit: false, energy: 7, mindset: 7, twoPercentEdge: '' },
                  { date: '2025-01-08', recovery: 8, nutritionHit: true, energy: 9, mindset: 8, twoPercentEdge: '' },
                ]} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-background/40 rounded-2xl backdrop-blur-[1px]">
                <div className="text-center">
                  <Lock className="w-7 h-7 text-primary mx-auto mb-2" />
                  <p className="text-base font-semibold">Grafico Settimanale Premium</p>
                </div>
              </div>
            </div>
          )}
        </motion.section>

        {/* Diario Pensieri - Premium only */}
        {isPremium && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="mb-6 sm:mb-8"
          >
            <DiarioPensieri checkins={checkins} onDelete={refetch} />
          </motion.section>
        )}

        {/* Challenge Card - visible to all */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.37 }}
          className="mb-6 sm:mb-8"
        >
          <ChallengeCard />
        </motion.section>

        {/* Journey Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mb-6 sm:mb-8"
        >
          <JourneyTimeline streak={streak} totalCheckins={totalCheckins} />
        </motion.section>

        {/* Community Link */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.39 }}
          className="mb-6 sm:mb-8"
        >
          <button
            onClick={() => navigate('/community')}
            className="w-full card-elegant p-4 rounded-2xl flex items-center gap-3 hover:bg-muted/30 transition-colors"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-semibold text-sm">Community</h3>
              <p className="text-xs text-muted-foreground">Entra nella chat di gruppo</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90" />
          </button>
        </motion.section>

        {/* Quick Actions */}
        <div id="tour-actions" className="space-y-3 sm:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
          >
            <QuickActionCard
              title="Messaggi"
              description={isPremium ? (unreadTotal > 0 ? `${unreadTotal} messaggi non letti` : "Parla con il tuo coach") : "Premium - Sblocca per accedere"}
              icon={isPremium ? MessageCircle : Lock}
              variant="green"
              onClick={() => navigate(isPremium ? '/messaggi' : '/upgrade')}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <QuickActionCard
              title="Allenamento Personalizzato"
              description={isPremium ? "Accedi al tuo programma di allenamento" : "Premium - Sblocca per accedere"}
              icon={isPremium ? GraduationCap : Lock}
              variant="orange"
              onClick={() => isPremium ? window.open('https://362gradi.ae/shop', '_blank') : navigate('/upgrade')}
            />
            {isPremium && (
              <p className="text-xs text-muted-foreground mt-1 px-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Usa le stesse credenziali di 362gradi
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <QuickActionCard
              title="Dieta Personalizzata"
              description={isPremium ? "Accedi al tuo piano alimentare" : "Premium - Sblocca per accedere"}
              icon={isPremium ? Apple : Lock}
              variant="purple"
              onClick={() => isPremium ? window.open('https://app.nutrium.com/', '_blank') : navigate('/upgrade')}
            />
            {isPremium && (
              <p className="text-xs text-muted-foreground mt-1 px-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Usa le stesse credenziali di 362gradi
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <QuickActionCard
              title="Guida all'App"
              description="Scopri tutte le funzionalita'"
              icon={BookOpen}
              variant="green"
              onClick={() => navigate('/guida')}
            />
          </motion.div>

          {/* Install App - only show if not in standalone mode */}
          {!isStandalone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
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
      
      {/* Guide Onboarding Tour interattivo */}
      <GuideOnboarding
        userId={user.id}
        onOpenCheckin={() => setIsCheckinOpen(true)}
      />

      {/* Bottom Dock */}
      <BottomDock />
      
      {/* Footer */}
      <Footer />
      
      {/* Cookie Banner */}
      <CookieBanner />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
    </div>
  );
};

export default Diario;
