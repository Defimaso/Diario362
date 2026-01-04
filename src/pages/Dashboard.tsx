import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ClipboardCheck, FileText, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import MomentumCircle from "@/components/MomentumCircle";
import StreakBadge from "@/components/StreakBadge";
import QuickActionCard from "@/components/QuickActionCard";
import WeeklyChart from "@/components/WeeklyChart";
import DailyCheckinModal from "@/components/DailyCheckinModal";
import { getUserProfile, getDailyCompletionPercentage, getTodayCheckin } from "@/lib/storage";

const Dashboard = () => {
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [profile, setProfile] = useState(getUserProfile());
  const [completionPercentage, setCompletionPercentage] = useState(getDailyCompletionPercentage());
  const [hasCheckedInToday, setHasCheckedInToday] = useState(!!getTodayCheckin());

  const refreshData = () => {
    setProfile(getUserProfile());
    setCompletionPercentage(getDailyCompletionPercentage());
    setHasCheckedInToday(!!getTodayCheckin());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCheckinComplete = () => {
    setIsCheckinOpen(false);
    refreshData();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-sm text-muted-foreground">Bentornato,</p>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
          </motion.div>
          <div className="flex items-center gap-3">
            <StreakBadge streak={profile.streak} />
            <Link to="/admin">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 pb-8 space-y-6">
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-muted-foreground italic"
        >
          "Non accontentarti di 360°. Trova il tuo 2% extra."
        </motion.p>

        {/* Momentum Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center py-6"
        >
          <MomentumCircle percentage={completionPercentage} />
        </motion.div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <QuickActionCard
              title="Check-in Giornaliero"
              description={hasCheckedInToday ? "Completato oggi ✓" : "Registra il tuo progresso"}
              icon={ClipboardCheck}
              variant={hasCheckedInToday ? "default" : "primary"}
              onClick={() => setIsCheckinOpen(true)}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <QuickActionCard
              title="Academy"
              description="Accedi alla tua libreria di formazione"
              icon={GraduationCap}
              variant="gold"
              onClick={() => window.open('https://teachable.com', '_blank')}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <QuickActionCard
              title="Il Mio Percorso"
              description="Visualizza i tuoi piani di dieta e allenamento"
              icon={FileText}
              onClick={() => {}}
            />
          </motion.div>
        </div>

        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <WeeklyChart />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-4 text-center"
        >
          <span className="text-sm gradient-text font-bold">362°</span>
          <span className="text-sm text-muted-foreground ml-1">Navigator</span>
        </motion.div>
      </main>

      {/* Check-in Modal */}
      <DailyCheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        onComplete={handleCheckinComplete}
      />
    </div>
  );
};

export default Dashboard;
