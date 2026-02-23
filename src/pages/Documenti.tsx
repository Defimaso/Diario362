import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClientDocuments } from '@/hooks/useClientDocuments';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumGate } from '@/components/PremiumGate';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import BottomDock from '@/components/BottomDock';
import Footer from '@/components/legal/Footer';
import CookieBanner from '@/components/legal/CookieBanner';
import { NotificationBell } from '@/components/NotificationBell';

const Documenti = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, isLoading: subLoading } = useSubscription();
  const navigate = useNavigate();

  const {
    documents,
    loading,
    downloadDocument,
  } = useClientDocuments(user?.id || '');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (!subLoading && !isPremium) {
    return (
      <div className="min-h-screen bg-background pb-36">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-lg mx-auto px-4 sm:px-5 py-6 sm:py-8">
          <PremiumGate />
        </div>
        <BottomDock />
        <Footer />
      </div>
    );
  }

  if (authLoading || loading || subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Caricamento...</div>
      </div>
    );
  }

  if (!user) return null;

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="min-h-screen bg-background pb-36">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg mx-auto px-4 sm:px-5 py-6 sm:py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Documenti</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                I tuoi documenti personali
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

        {/* Documents List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-elegant rounded-2xl p-6 border border-primary/30">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">I Tuoi Documenti</h2>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg font-medium mb-2">Nessun documento</p>
                <p className="text-sm text-muted-foreground">
                  I tuoi coach caricheranno qui i documenti per te
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-3 p-4 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{doc.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>
                            {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: it })}
                          </span>
                          {doc.file_size && (
                            <>
                              <span>•</span>
                              <span>{formatFileSize(doc.file_size)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => downloadDocument(doc)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Scarica
                    </Button>
                  </div>
                ))}
              </div>
            )}
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

export default Documenti;
