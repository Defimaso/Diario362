import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Apple, FileText, Dumbbell, Download, Upload, Trash2, ExternalLink, Settings, Video, Bell } from 'lucide-react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserDiet } from '@/hooks/useUserDiet';
import { useClientDocuments } from '@/hooks/useClientDocuments';
import { useVideoCorrections } from '@/hooks/useVideoCorrections';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumGate } from '@/components/PremiumGate';
import VideoUploadCard from '@/components/allenamento/VideoUploadCard';
import VideoFeedbackList from '@/components/allenamento/VideoFeedbackList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import BottomDock from '@/components/BottomDock';
import Footer from '@/components/legal/Footer';
import { NotificationBell } from '@/components/NotificationBell';
import { openNativeApp } from '@/lib/deepLinks';

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
};

const AreaPersonale = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, isLoading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks for all 3 sections
  const { dietPlan, loading: dietLoading, uploading: dietUploading, uploadDietPlan, deleteDietPlan, downloadDietPlan } = useUserDiet();
  const { documents, loading: docsLoading, downloadDocument } = useClientDocuments(user?.id || '');
  const { unreadCount, markAllFeedbackAsRead } = useVideoCorrections();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-lg mx-auto px-4 sm:px-5 py-6 sm:py-8">
          <PremiumGate />
        </div>
        <BottomDock />
        <Footer />
      </div>
    );
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadDietPlan(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
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
            <div className="p-2 rounded-full bg-primary/10">
              <FolderOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">I Tuoi Materiali</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Dieta, documenti e video allenamenti
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllFeedbackAsRead} className="relative">
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
        </motion.header>

        {/* Section 1: Piano Alimentare */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="card-elegant rounded-2xl p-5 border border-[hsl(var(--section-purple))]/30">
            <div className="flex items-center gap-2 mb-4">
              <Apple className="w-5 h-5 text-[hsl(var(--section-purple))]" />
              <h2 className="font-semibold">Piano Alimentare</h2>
            </div>

            {dietLoading ? (
              <div className="text-center py-4">
                <div className="animate-pulse text-muted-foreground text-sm">Caricamento...</div>
              </div>
            ) : dietPlan ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="p-1.5 rounded-lg bg-[hsl(var(--section-purple))]/10 shrink-0">
                    <FileText className="w-5 h-5 text-[hsl(var(--section-purple))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{dietPlan.file_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{format(new Date(dietPlan.uploaded_at), 'dd MMM yyyy', { locale: it })}</span>
                      {dietPlan.file_size && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(dietPlan.file_size)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={downloadDietPlan} className="flex-1" variant="outline" size="sm" disabled={dietUploading}>
                    <Download className="w-4 h-4 mr-1" />
                    Scarica
                  </Button>
                  <Button onClick={() => fileInputRef.current?.click()} variant="secondary" size="sm" disabled={dietUploading}>
                    <Upload className="w-4 h-4 mr-1" />
                    Sostituisci
                  </Button>
                  <Button onClick={deleteDietPlan} variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={dietUploading}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Il tuo coach non ha ancora caricato un piano alimentare
                </p>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" disabled={dietUploading}>
                  <Upload className="w-4 h-4 mr-1" />
                  {dietUploading ? 'Caricamento...' : 'Carica PDF'}
                </Button>
                <p className="text-[10px] text-muted-foreground mt-2">Solo PDF • Max 10MB</p>
              </div>
            )}

            {/* Dieta Personalizzata Link */}
            <button
              onClick={() => openNativeApp('nutrium')}
              className="w-full mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-[hsl(var(--section-purple))]/5 hover:bg-[hsl(var(--section-purple))]/10 transition-colors text-left"
            >
              <ExternalLink className="w-4 h-4 text-[hsl(var(--section-purple))] shrink-0" />
              <span className="text-xs text-[hsl(var(--section-purple))] font-medium">Apri Dieta Personalizzata</span>
            </button>

            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleFileSelect} className="hidden" />
          </div>
        </motion.section>

        {/* Section 2: Documenti */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <div className="card-elegant rounded-2xl p-5 border border-primary/30">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Documenti</h2>
              {documents.length > 0 && (
                <span className="text-xs text-muted-foreground ml-auto">{documents.length} file</span>
              )}
            </div>

            {docsLoading ? (
              <div className="text-center py-4">
                <div className="animate-pulse text-muted-foreground text-sm">Caricamento...</div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Nessun documento disponibile
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  I tuoi coach caricheranno qui i documenti per te
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{doc.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{format(new Date(doc.created_at), 'dd MMM yyyy', { locale: it })}</span>
                          {doc.file_size && (
                            <>
                              <span>•</span>
                              <span>{formatFileSize(doc.file_size)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => downloadDocument(doc)} variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* Section 3: Video Allenamenti */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <div className="card-elegant rounded-2xl p-5 border border-[hsl(var(--section-red))]/30">
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-5 h-5 text-[hsl(var(--section-red))]" />
              <h2 className="font-semibold">Video Allenamenti</h2>
              {unreadCount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5 ml-auto">
                  {unreadCount} nuovi
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <VideoUploadCard />
              <VideoFeedbackList />
            </div>

            <div className="mt-3 p-2.5 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">
                💡 Riprendi l'esercizio da un'angolazione laterale per un feedback migliore
              </p>
            </div>
          </div>
        </motion.section>
      </div>

      <BottomDock />
      <Footer />
    </div>
  );
};

export default AreaPersonale;
