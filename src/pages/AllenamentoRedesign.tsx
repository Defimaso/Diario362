import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Settings, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { useVideoCorrections } from '@/hooks/useVideoCorrections';
import { useSubscription } from '@/hooks/useSubscription';
import VideoUploadCard from '@/components/allenamento/VideoUploadCard';
import VideoFeedbackList from '@/components/allenamento/VideoFeedbackList';
import BottomDock from '@/components/BottomDock';
import Footer from '@/components/legal/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from '@/components/NotificationBell';

const AllenamentoRedesign = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, isLoading: subLoading } = useSubscription();
  const { unreadCount, markAllFeedbackAsRead } = useVideoCorrections();

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isPremium) {
    return <Navigate to="/upgrade" replace />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary/20 via-background to-background pt-12 pb-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Correzioni Video</h1>
                <p className="text-sm text-muted-foreground">
                  Carica i tuoi esercizi per ricevere feedback
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllFeedbackAsRead}
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs px-1.5 min-w-[18px]">
                    {unreadCount}
                  </Badge>
                </Button>
              )}
              <NotificationBell />
              <Link to="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Upload Card */}
          <VideoUploadCard />
          
          {/* Video List with Feedback */}
          <VideoFeedbackList />
          
          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-elegant rounded-xl p-4 text-center"
          >
            <p className="text-sm text-muted-foreground">
              💡 <strong>Suggerimento:</strong> Riprendi l'esercizio da un'angolazione laterale 
              per permettere al coach di valutare meglio la tua tecnica.
            </p>
          </motion.div>
        </div>
      </main>

      <BottomDock />
      <Footer />
    </div>
  );
};

export default AllenamentoRedesign;
