import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Apple, FileText, Upload, Download, Trash2, Info, ExternalLink, Settings } from 'lucide-react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserDiet } from '@/hooks/useUserDiet';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import BottomDock from '@/components/BottomDock';
import Footer from '@/components/legal/Footer';
import CookieBanner from '@/components/legal/CookieBanner';
import { NotificationBell } from '@/components/NotificationBell';
import { openNativeApp } from '@/lib/deepLinks';

const Nutrizione = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, isLoading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    dietPlan,
    loading,
    uploading,
    uploadDietPlan,
    deleteDietPlan,
    downloadDietPlan,
  } = useUserDiet();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (!subLoading && !isPremium) {
    return <Navigate to="/upgrade" replace />;
  }

  if (authLoading || loading || subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Caricamento...</div>
      </div>
    );
  }

  if (!user) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadDietPlan(file);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const handleOpenNutrium = () => {
    openNativeApp('nutrium');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-5 py-6 sm:py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-[hsl(var(--section-purple))]/10">
              <Apple className="w-6 h-6 text-[hsl(var(--section-purple))]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Nutrizione</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Il tuo piano alimentare personale
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.header>

        {/* Main Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="card-elegant rounded-2xl p-6 border border-[hsl(var(--section-purple))]/30">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-[hsl(var(--section-purple))]" />
              <h2 className="font-semibold">Il Tuo Piano Alimentare</h2>
            </div>

            {dietPlan ? (
              // File exists - show details
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                  <div className="p-2 rounded-lg bg-[hsl(var(--section-purple))]/10">
                    <FileText className="w-6 h-6 text-[hsl(var(--section-purple))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{dietPlan.file_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>
                        Caricato: {format(new Date(dietPlan.uploaded_at), 'dd MMM yyyy', { locale: it })}
                      </span>
                      {dietPlan.file_size && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(dietPlan.file_size)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={downloadDietPlan}
                    className="flex-1"
                    variant="outline"
                    disabled={uploading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Scarica
                  </Button>
                  <Button
                    onClick={handleUploadClick}
                    className="flex-1"
                    variant="secondary"
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Sostituisci
                  </Button>
                </div>

                <Button
                  onClick={deleteDietPlan}
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={uploading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Elimina piano
                </Button>
              </div>
            ) : (
              // No file - show upload prompt
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(var(--section-purple))]/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-[hsl(var(--section-purple))]" />
                </div>
                <p className="text-lg font-medium mb-2">Nessun piano caricato</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Carica il PDF del tuo piano alimentare per averlo sempre a portata di mano
                </p>
                <Button
                  onClick={handleUploadClick}
                  className="bg-[hsl(var(--section-purple))] hover:bg-[hsl(var(--section-purple))]/90"
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Caricamento...' : 'Carica PDF'}
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Solo formato PDF • Max 10MB
                </p>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </motion.section>

        {/* Nutrium Deep Link */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-elegant rounded-2xl p-4 border border-[hsl(var(--section-purple))]/30">
            <div className="flex items-center gap-3 mb-3">
              <ExternalLink className="w-5 h-5 text-[hsl(var(--section-purple))]" />
              <h2 className="font-semibold">Nutrium</h2>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Accedi alla versione completa della tua dieta su Nutrium.
            </p>
            
            <p className="text-xs text-muted-foreground mb-4 italic">
              Nota: Usa le stesse credenziali che utilizzi per Nutrium.
            </p>
            
            <Button 
              onClick={handleOpenNutrium}
              className="w-full bg-[hsl(var(--section-purple))] hover:bg-[hsl(var(--section-purple))]/90"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Apri Dieta su Nutrium
            </Button>
          </div>
        </motion.section>

        {/* Info Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-elegant rounded-2xl p-4 border border-border/50">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-primary/10">
                <Info className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Privacy garantita</p>
                <p className="text-xs text-muted-foreground">
                  Il tuo piano alimentare è visibile solo a te e ai tuoi coach assegnati. 
                  Nessun altro può accedere a questi dati.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Bottom Dock */}
      <BottomDock />

      {/* Footer */}
      <Footer />

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
};

export default Nutrizione;
