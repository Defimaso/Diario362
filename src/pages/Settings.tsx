import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Shield, Bell, Trash2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import DeleteAccountDialog from '@/components/account/DeleteAccountDialog';
import ChangePasswordDialog from '@/components/account/ChangePasswordDialog';
import Footer from '@/components/legal/Footer';
import BottomDock from '@/components/BottomDock';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAccountDeleted = () => {
    navigate('/auth');
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
          className="flex items-center gap-3 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/diario')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Impostazioni</h1>
        </motion.header>

        <div className="space-y-6">
          {/* Account Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-elegant p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-semibold">Account</h2>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">ID Utente</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {user?.id?.slice(0, 8)}...
                  </span>
                </div>
                
                {/* Change Password Section */}
                <div className="pt-2">
                  <ChangePasswordDialog />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Privacy & Security Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-elegant p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-green-500/10">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="font-semibold">Privacy e Sicurezza</h2>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                I tuoi dati sono protetti secondo il GDPR. Solo tu e i tuoi coach 
                assegnati possono accedere alle tue informazioni.
              </p>

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Crittografia end-to-end
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Controllo accessi basato su ruoli
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Log di audit per accountability
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Danger Zone */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card-elegant p-6 rounded-2xl border-destructive/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-destructive/10">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <h2 className="font-semibold text-destructive">Zona Pericolosa</h2>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Eliminando il tuo account, tutti i tuoi dati verranno cancellati 
                permanentemente. Questa azione è irreversibile (Diritto all'Oblio - GDPR Art. 17).
              </p>

              <DeleteAccountDialog onDeleted={handleAccountDeleted} />
            </div>
          </motion.section>
        </div>
      </div>

      {/* Bottom Dock */}
      <BottomDock />

      <Footer />
    </div>
  );
};

export default Settings;
