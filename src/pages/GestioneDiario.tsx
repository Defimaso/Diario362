import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, CheckCircle2, AlertTriangle, XCircle, ArrowLeft, LogOut, Filter, GraduationCap, Phone, Mail, AlertCircle, Trash2, MessageSquare, ChevronDown, Download, TrendingUp, Activity, Target, Key, Crown, Copy, Loader2, BarChart3, Trophy, Send, UserCheck, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminClients, ClientData } from "@/hooks/useAdminClients";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import TeachableModal from "@/components/TeachableModal";
import { getCurrentBadge, isClientAtRisk } from "@/lib/badges";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useCoachNotes } from "@/hooks/useCoachNotes";
import { useMessages } from "@/hooks/useMessages";
import { STAFF_WHITELIST, getAvailableCoaches } from "@/lib/staffWhitelist";
import CoachNotesDialog from "@/components/CoachNotesDialog";
import ClientExpandedView from "@/components/ClientExpandedView";
import CoachAnalytics from "@/components/CoachAnalytics";
import AdminCoachDashboard from "@/components/staff/AdminCoachDashboard";
import { useChallenges } from "@/hooks/useChallenges";
import { Textarea } from "@/components/ui/textarea";

type FilterStatus = 'all' | 'green' | 'yellow' | 'red';
type CoachFilter = 'all' | 'Ilaria / Marco' | 'Valentina' | 'Martina' | 'Michela' | 'Cristina';

const GestioneDiario = () => {
  const { user, signOut, isAdmin, isCollaborator, isSuperAdmin, loading: authLoading } = useAuth();
  const { clients, loading: clientsLoading, refetch: refetchClients } = useAdminClients();
  const { notes, addNote, markAsRead, hasUnreadNotes } = useCoachNotes();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [coachFilter, setCoachFilter] = useState<CoachFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [teachableModalOpen, setTeachableModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  
  // Delete user state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientData | null>(null);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesClient, setNotesClient] = useState<ClientData | null>(null);

  // Premium code generation per-client
  const [premiumCodeDialogOpen, setPremiumCodeDialogOpen] = useState(false);
  const [premiumCodeTarget, setPremiumCodeTarget] = useState<ClientData | null>(null);
  const [generatedPremiumCode, setGeneratedPremiumCode] = useState<string | null>(null);
  const [isGeneratingPremiumCode, setIsGeneratingPremiumCode] = useState(false);

  const [showAnalytics, setShowAnalytics] = useState(false);

  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDesc, setChallengeDesc] = useState('');
  const [challengeTarget, setChallengeTarget] = useState(7);
  const [challengeDays, setChallengeDays] = useState(7);
  const [challengeEmoji, setChallengeEmoji] = useState('🏆');
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const { createChallenge } = useChallenges();

  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageClient, setMessageClient] = useState<ClientData | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Coach assignment dialog
  const [coachAssignDialogOpen, setCoachAssignDialogOpen] = useState(false);
  const [coachAssignClient, setCoachAssignClient] = useState<ClientData | null>(null);
  const [availableCoaches, setAvailableCoaches] = useState<{ id: string; name: string }[]>([]);
  const [coachAssignLoading, setCoachAssignLoading] = useState(false);
  const [assignedCoachId, setAssignedCoachId] = useState<string | null>(null);

  // Premium status tracking (from user_subscriptions via useAdminClients)
  const [premiumClients, setPremiumClients] = useState<Set<string>>(new Set());
  const [togglingPremiumId, setTogglingPremiumId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { conversations: msgConversations, unreadTotal } = useMessages();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && user && !isAdmin && !isCollaborator && !isSuperAdmin) {
      navigate('/diario');
    }
  }, [user, authLoading, isAdmin, isCollaborator, isSuperAdmin, navigate]);

  // Derive premium status from profiles.is_premium (already fetched in useAdminClients)
  useEffect(() => {
    if (clients.length === 0) return;
    const premiumSet = new Set<string>();
    clients.forEach(c => { if (c.is_premium) premiumSet.add(c.id); });
    setPremiumClients(premiumSet);
  }, [clients]);

  // Analytics: compute team-wide metrics (must be before early returns)
  const analytics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const checkedInToday = clients.filter(c => c.last_checkin?.date === today).length;
    const completionRate = clients.length > 0 ? Math.round((checkedInToday / clients.length) * 100) : 0;

    const clientsWithCheckin = clients.filter(c => c.last_checkin);
    const avgRecovery = clientsWithCheckin.length > 0
      ? (clientsWithCheckin.reduce((sum, c) => sum + (c.last_checkin?.recovery || 0), 0) / clientsWithCheckin.length).toFixed(1)
      : '-';
    const avgEnergy = clientsWithCheckin.length > 0
      ? (clientsWithCheckin.reduce((sum, c) => sum + (c.last_checkin?.energy || 0), 0) / clientsWithCheckin.length).toFixed(1)
      : '-';
    const avgMindset = clientsWithCheckin.length > 0
      ? (clientsWithCheckin.reduce((sum, c) => sum + (c.last_checkin?.mindset || 0), 0) / clientsWithCheckin.length).toFixed(1)
      : '-';
    const avgStreak = clients.length > 0
      ? (clients.reduce((sum, c) => sum + c.streak, 0) / clients.length).toFixed(1)
      : '-';

    return { checkedInToday, completionRate, avgRecovery, avgEnergy, avgMindset, avgStreak };
  }, [clients]);

  // Pre-compute badge, risk, and daysSince for all clients (must be before early returns)
  const clientMetrics = useMemo(() => {
    const metrics = new Map<string, { badge: ReturnType<typeof getCurrentBadge>; isAtRisk: boolean; daysSince: number }>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const client of clients) {
      let daysSince = 999;
      if (client.last_checkin?.date) {
        const lastDate = new Date(client.last_checkin.date);
        lastDate.setHours(0, 0, 0, 0);
        daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      }
      const totalCheckins = client.streak || 0;
      const badge = getCurrentBadge(client.streak, totalCheckins);
      const atRisk = isClientAtRisk(badge, daysSince);
      metrics.set(client.id, { badge, isAtRisk: atRisk, daysSince });
    }
    return metrics;
  }, [clients]);

  if (authLoading || clientsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Caricamento...</div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isCollaborator && !isSuperAdmin)) return null;

  // Filter clients
  let filteredClients = clients;

  if (statusFilter !== 'all') {
    filteredClients = filteredClients.filter(c => c.status === statusFilter);
  }

  // Filtro ricerca per nome/email
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredClients = filteredClients.filter(c =>
      (c.full_name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  }

  if (coachFilter !== 'all') {
    filteredClients = filteredClients.filter(c =>
      c.coach_names.some(name =>
        name.toLowerCase().includes(coachFilter.split(' / ')[0].toLowerCase())
      )
    );
  }

  // Count by status
  const statusCounts = {
    all: clients.length,
    green: clients.filter(c => c.status === 'green').length,
    yellow: clients.filter(c => c.status === 'yellow').length,
    red: clients.filter(c => c.status === 'red').length,
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleTaskAcademyClick = (client: ClientData) => {
    setSelectedClient(client);
    setTeachableModalOpen(true);
  };

  // Delete user handlers
  const openDeleteDialog = (client: ClientData) => {
    setClientToDelete(client);
    setDeleteConfirmStep(1);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    console.log('handleDeleteUser called, step:', deleteConfirmStep, 'client:', clientToDelete?.id);
    
    if (!clientToDelete) return;
    
    if (deleteConfirmStep < 2) {
      console.log('Moving to step 2');
      setDeleteConfirmStep(2);
      return;
    }

    console.log('Proceeding with deletion for:', clientToDelete.id);
    setIsDeleting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: clientToDelete.id }
      });

      console.log('Delete response:', data, error);

      if (error) {
        throw error;
      }

      toast({
        title: 'Utente eliminato',
        description: `${clientToDelete.full_name} è stato eliminato con successo.`,
      });

      setDeleteDialogOpen(false);
      setClientToDelete(null);
      setDeleteConfirmStep(1);
      refetchClients();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: err.message || 'Impossibile eliminare l\'utente.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Coach notes handlers
  const openNotesDialog = (client: ClientData) => {
    setNotesClient(client);
    setNotesDialogOpen(true);
  };

  // CSV Export function
  const exportCSV = () => {
    const headers = ['Nome', 'Email', 'Telefono', 'Coach', 'Status', 'Streak', 'Ultimo Diario', 'Recovery', 'Energy', 'Mindset'];
    const rows = filteredClients.map(c => [
      c.full_name,
      c.email,
      c.phone_number || '',
      c.coach_names.join(' / ').replace(/_/g, ' / '),
      c.status,
      c.streak.toString(),
      c.last_checkin?.date || '',
      c.last_checkin?.recovery?.toString() || '',
      c.last_checkin?.energy?.toString() || '',
      c.last_checkin?.mindset?.toString() || '',
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clienti_362gradi_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Toggle premium directly for a client (no code needed)
  const togglePremiumDirect = async (client: ClientData, makePremium: boolean) => {
    setTogglingPremiumId(client.id);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        toast({ variant: 'destructive', title: 'Errore', description: 'Sessione scaduta. Riprova il login.' });
        return;
      }

      const res = await fetch('https://ppbbqchycxffsfavtsjp.supabase.co/functions/v1/toggle-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'set-premium', clientId: client.id, premium: makePremium }),
      });
      const result = await res.json();

      if (result?.error) {
        toast({ variant: 'destructive', title: 'Errore', description: result.error });
        return;
      }

      // Update local state
      setPremiumClients(prev => {
        const next = new Set(prev);
        if (makePremium) next.add(client.id); else next.delete(client.id);
        return next;
      });
      toast({ title: makePremium ? 'Premium attivato!' : 'Premium rimosso', description: client.full_name });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Errore', description: err.message });
    } finally {
      setTogglingPremiumId(null);
    }
  };

  // Generate a premium code for a specific client via premium API on secondary project
  const generatePremiumCode = async (client: ClientData) => {
    setIsGeneratingPremiumCode(true);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) {
        setIsGeneratingPremiumCode(false);
        toast({ variant: 'destructive', title: 'Errore', description: 'Sessione scaduta. Riprova il login.' });
        return;
      }

      const res = await fetch('https://ppbbqchycxffsfavtsjp.supabase.co/functions/v1/toggle-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'generate-code', clientId: client.id }),
      });

      const result = await res.json();
      setIsGeneratingPremiumCode(false);

      if (result?.error) {
        console.error('Generate premium code error:', result.error);
        toast({ variant: 'destructive', title: 'Errore', description: `Impossibile generare il codice: ${result.error}` });
        return;
      }

      setGeneratedPremiumCode(result.code);
      toast({ title: 'Codice generato!', description: `Codice per ${client.full_name}: ${result.code}` });
    } catch (err: any) {
      setIsGeneratingPremiumCode(false);
      console.error('Generate premium code exception:', err);
      toast({ variant: 'destructive', title: 'Errore', description: `Impossibile generare il codice: ${err.message}` });
    }
  };

  // Create a new challenge
  const handleCreateChallenge = async () => {
    if (!challengeTitle.trim()) return;
    setIsCreatingChallenge(true);

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + challengeDays);

    const { error } = await createChallenge({
      title: challengeTitle,
      description: challengeDesc || undefined,
      type: challengeDays <= 7 ? 'weekly' : challengeDays <= 31 ? 'monthly' : 'custom',
      target_value: challengeTarget,
      target_metric: 'checkin_streak',
      ends_at: endsAt.toISOString(),
      badge_emoji: challengeEmoji,
      badge_name: challengeTitle,
    });

    setIsCreatingChallenge(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Errore', description: error });
    } else {
      toast({ title: 'Sfida creata!', description: `"${challengeTitle}" e' ora attiva` });
      setChallengeDialogOpen(false);
      setChallengeTitle('');
      setChallengeDesc('');
    }
  };

  // Send quick message to a client
  const handleSendMessage = async () => {
    if (!user || !messageClient || !messageContent.trim()) return;
    setIsSendingMessage(true);

    const { error } = await supabase
      .from('messages' as any)
      .insert({
        sender_id: user.id,
        receiver_id: messageClient.id,
        content: messageContent.trim(),
      } as any);

    setIsSendingMessage(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Errore', description: 'Impossibile inviare il messaggio' });
    } else {
      toast({ title: 'Messaggio inviato!', description: `Messaggio inviato a ${messageClient.full_name}` });
      setMessageDialogOpen(false);
      setMessageContent('');
      setMessageClient(null);
    }
  };

  // Open premium code generation dialog
  const openPremiumCodeDialog = (client: ClientData) => {
    setPremiumCodeTarget(client);
    setGeneratedPremiumCode(client.premium_code || null);
    setPremiumCodeDialogOpen(true);
  };

  // Direct activate premium from within the dialog
  const directActivatePremiumFromDialog = async (client: ClientData) => {
    await togglePremiumDirect(client, true);
    setPremiumCodeDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <Link to="/diario" className="p-2 rounded-lg bg-card hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                <span className="text-primary">Gestione</span>
                <span className="text-foreground"> Diario</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isSuperAdmin ? 'Vista Master - Tutti i clienti' : 'I tuoi clienti'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={cn("text-muted-foreground hover:text-foreground", showAnalytics && "text-primary")}
              title="Analytics"
            >
              <BarChart3 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChallengeDialogOpen(true)}
              className="text-muted-foreground hover:text-foreground"
              title="Crea Sfida"
            >
              <Trophy className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={exportCSV}
              className="text-muted-foreground hover:text-foreground"
              title="Esporta CSV"
            >
              <Download className="w-5 h-5" />
            </Button>
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

        {/* Admin-only: Coach Dashboard */}
        {isSuperAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <AdminCoachDashboard clients={clients} onRefresh={refetchClients} />
          </motion.div>
        )}

        {/* ── Messaggi ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="card-elegant rounded-xl p-4 mb-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Messaggi</span>
              {unreadTotal > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {unreadTotal}
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/messaggi')}
              className="text-xs text-primary hover:underline"
            >
              Vedi tutti →
            </button>
          </div>

          {msgConversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              Nessuna conversazione attiva
            </p>
          ) : (
            <div className="space-y-1">
              {msgConversations.slice(0, 4).map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => navigate('/messaggi', { state: { openChat: { userId: conv.userId, userName: conv.userName } } })}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-primary">{conv.userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{conv.userName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(conv.lastMessageAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
              {msgConversations.length > 4 && (
                <button
                  onClick={() => navigate('/messaggi')}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-1.5 transition-colors"
                >
                  + altri {msgConversations.length - 4} →
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-2 sm:gap-4 mb-6"
        >
          <div className="card-elegant rounded-xl p-3 sm:p-4 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-xl sm:text-2xl font-bold tabular-nums">{statusCounts.all}</div>
            <div className="text-xs text-muted-foreground">Totale</div>
          </div>
          <div className="card-elegant rounded-xl p-3 sm:p-4 text-center">
            <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-success" />
            <div className="text-xl sm:text-2xl font-bold tabular-nums text-success">{statusCounts.green}</div>
            <div className="text-xs text-muted-foreground">Green</div>
          </div>
          <div className="card-elegant rounded-xl p-3 sm:p-4 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-warning" />
            <div className="text-xl sm:text-2xl font-bold tabular-nums text-warning">{statusCounts.yellow}</div>
            <div className="text-xs text-muted-foreground">Yellow</div>
          </div>
          <div className="card-elegant rounded-xl p-3 sm:p-4 text-center">
            <XCircle className="w-5 h-5 mx-auto mb-1 text-destructive" />
            <div className="text-xl sm:text-2xl font-bold tabular-nums text-destructive">{statusCounts.red}</div>
            <div className="text-xs text-muted-foreground">Red</div>
          </div>
        </motion.div>

        {/* Analytics Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6"
        >
          <div className="card-elegant rounded-xl p-3 text-center">
            <Target className="w-4 h-4 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold tabular-nums text-primary">{analytics.completionRate}%</div>
            <div className="text-[10px] text-muted-foreground">Completamento oggi</div>
          </div>
          <div className="card-elegant rounded-xl p-3 text-center">
            <Activity className="w-4 h-4 mx-auto mb-1 text-blue-400" />
            <div className="text-lg font-bold tabular-nums">{analytics.avgRecovery}</div>
            <div className="text-[10px] text-muted-foreground">Recovery medio</div>
          </div>
          <div className="card-elegant rounded-xl p-3 text-center">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-400" />
            <div className="text-lg font-bold tabular-nums">{analytics.avgEnergy}</div>
            <div className="text-[10px] text-muted-foreground">Energy media</div>
          </div>
          <div className="card-elegant rounded-xl p-3 text-center">
            <Activity className="w-4 h-4 mx-auto mb-1 text-purple-400" />
            <div className="text-lg font-bold tabular-nums">{analytics.avgStreak}</div>
            <div className="text-[10px] text-muted-foreground">Streak medio</div>
          </div>
        </motion.div>

        {/* Advanced Analytics Panel */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <CoachAnalytics clients={clients} coachFilter={coachFilter} />
          </motion.div>
        )}

        {/* Search clienti */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative mb-3"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Cerca cliente per nome o email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 sm:gap-4 mb-6"
        >
          {/* Status Filter */}
          <div className="flex rounded-lg bg-card border border-border p-1">
            {(['all', 'green', 'yellow', 'red'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all",
                  statusFilter === status
                    ? status === 'green' ? 'bg-success text-success-foreground'
                    : status === 'yellow' ? 'bg-warning text-warning-foreground'
                    : status === 'red' ? 'bg-destructive text-destructive-foreground'
                    : 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {status === 'all' ? 'Tutti' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Coach Filter (for all admins) */}
          {(isSuperAdmin || isAdmin) && (
            <Select value={coachFilter} onValueChange={(v) => setCoachFilter(v as CoachFilter)}>
              <SelectTrigger className="w-[140px] bg-card">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Coach" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="all">Tutti i coach</SelectItem>
                <SelectItem value="Ilaria / Marco">Ilaria / Marco</SelectItem>
                <SelectItem value="Valentina">Valentina</SelectItem>
                <SelectItem value="Martina">Martina</SelectItem>
                <SelectItem value="Michela">Michela</SelectItem>
                <SelectItem value="Cristina">Cristina</SelectItem>
              </SelectContent>
            </Select>
          )}
        </motion.div>

        {/* Client List with Accordion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredClients.length === 0 ? (
            <div className="card-elegant rounded-xl p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">Nessun cliente trovato</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              <TooltipProvider>
                {filteredClients.map((client, index) => {
                  const metrics = clientMetrics.get(client.id) || { badge: getCurrentBadge(0, 0), isAtRisk: false, daysSince: 999 };
                  const clientBadge = metrics.badge;
                  const isAtRisk = metrics.isAtRisk;
                  const daysSince = metrics.daysSince;
                  
                  return (
                    <AccordionItem 
                      key={client.id} 
                      value={client.id}
                      className={cn(
                        "card-elegant rounded-xl overflow-hidden border-0",
                        client.status === 'red' && "border-l-4 border-l-destructive",
                        isAtRisk && client.status !== 'red' && "border-l-4 border-l-warning"
                      )}
                    >
                      <AccordionTrigger className="px-4 py-4 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-180">
                        <div className="flex-1 text-left">
                          {/* Risk Warning Banner */}
                          {isAtRisk && (
                            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-warning/10 text-warning text-xs">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>Rischio abbandono: {daysSince} giorni senza diario</span>
                            </div>
                          )}
                          
                          {/* Header Row */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Badge Emoji */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="text-2xl cursor-help shrink-0">
                                    {clientBadge.emoji}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-card border-border">
                                  <div className="text-sm">
                                    <p className="font-semibold text-badge-gold">{clientBadge.name}</p>
                                    <p className="text-muted-foreground">{clientBadge.description}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                              
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold truncate">{client.full_name}</h3>
                                  {/* Status indicator */}
                                  <div className={cn(
                                    "w-2.5 h-2.5 rounded-full shrink-0",
                                    client.status === 'green' && "status-green",
                                    client.status === 'yellow' && "status-yellow",
                                    client.status === 'red' && "status-red",
                                  )} />
                                  {client.streak > 0 && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
                                      🔥 {client.streak}
                                    </span>
                                  )}
                                  {premiumClients.has(client.id) && (
                                    <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                                      <Crown className="w-3 h-3" />
                                      Premium
                                    </span>
                                  )}
                                  {client.need_profile && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-xs bg-accent/10 text-accent-foreground px-2 py-0.5 rounded-full shrink-0 cursor-help">
                                          {client.need_profile === 'significance' && '⭐'}
                                          {client.need_profile === 'intelligence' && '🧠'}
                                          {client.need_profile === 'acceptance' && '🤝'}
                                          {client.need_profile === 'approval' && '🏆'}
                                          {client.need_profile === 'power' && '💪'}
                                          {client.need_profile === 'pity' && '🔥'}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="font-semibold">Profilo: {
                                          client.need_profile === 'significance' ? 'Il Protagonista' :
                                          client.need_profile === 'intelligence' ? 'Lo Stratega' :
                                          client.need_profile === 'acceptance' ? 'Il Connettore' :
                                          client.need_profile === 'approval' ? "L'Eccellente" :
                                          client.need_profile === 'power' ? 'Il Leader' :
                                          client.need_profile === 'pity' ? 'Il Resiliente' : ''
                                        }</p>
                                        <p className="text-muted-foreground text-xs">Provenienza: quiz 362gradi.ae</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {client.referral_source && (
                                    <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded shrink-0">
                                      via {client.referral_source}
                                    </span>
                                  )}
                                </div>
                                {isSuperAdmin && client.coach_names.length > 0 && (
                                  <p className="text-xs text-primary">
                                    Coach: {client.coach_names.join(', ').replace(/_/g, ' / ')}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Today's scores - compact */}
                            {client.last_checkin && (
                              <div className="hidden sm:flex gap-1.5 text-xs shrink-0">
                                <span className="px-1.5 py-0.5 rounded bg-muted">R:{client.last_checkin.recovery || '-'}</span>
                                <span className="px-1.5 py-0.5 rounded bg-muted">N:{client.last_checkin.nutrition_adherence ? '✓' : '✗'}</span>
                                <span className="px-1.5 py-0.5 rounded bg-muted">E:{client.last_checkin.energy || '-'}</span>
                                <span className="px-1.5 py-0.5 rounded bg-muted">M:{client.last_checkin.mindset || '-'}</span>
                              </div>
                            )}
                          </div>

                          {/* Contact Info */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-3">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </span>
                            {client.phone_number && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {client.phone_number}
                              </span>
                            )}
                          </div>

                          {/* 2% Edge message - compact */}
                          {client.last_checkin?.two_percent_edge && (
                            <div className="mt-3 p-2 rounded-lg bg-muted/50 text-sm">
                              <span className="text-primary font-medium">2%: </span>
                              <span className="text-muted-foreground">{client.last_checkin.two_percent_edge}</span>
                            </div>
                          )}
                        </div>
                        <ChevronDown className="chevron w-5 h-5 text-muted-foreground transition-transform duration-200 ml-2 shrink-0" />
                      </AccordionTrigger>
                      
                      <AccordionContent className="px-4 pb-4">
                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-2 mb-4 pt-2 border-t border-border">
                          {/* Task Academy Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary/40 text-primary hover:bg-primary/10"
                            onClick={() => handleTaskAcademyClick(client)}
                          >
                            <GraduationCap className="w-4 h-4 mr-1.5" />
                            Task Academy
                          </Button>

                          {/* Send Message Button → apre chat completa */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-500/40 text-blue-500 hover:bg-blue-500/10"
                            onClick={() => navigate('/messaggi', { state: { openChat: { userId: client.id, userName: client.full_name || client.email } } })}
                          >
                            <Send className="w-4 h-4 mr-1.5" />
                            Messaggio
                          </Button>

                          {/* Coach Notes Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="relative border-badge-gold/40 text-badge-gold hover:bg-badge-gold/10"
                            onClick={() => openNotesDialog(client)}
                          >
                            <MessageSquare className="w-4 h-4 mr-1.5" />
                            Note
                            {hasUnreadNotes(client.id) && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-badge-gold animate-pulse" />
                            )}
                          </Button>

                          {/* Assign Coach Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-teal-500/40 text-teal-500 hover:bg-teal-500/10"
                            onClick={async () => {
                              setCoachAssignClient(client);
                              setCoachAssignLoading(true);
                              setCoachAssignDialogOpen(true);

                              try {
                                // Carica coach disponibili da whitelist
                                const coaches = await getAvailableCoaches(supabase);
                                setAvailableCoaches(coaches);

                                // Carica coach attualmente assegnato
                                const { data: profileData } = await supabase
                                  .from('profiles')
                                  .select('coach_id')
                                  .eq('id', client.id)
                                  .single();
                                setAssignedCoachId((profileData as any)?.coach_id || null);
                              } catch (err) {
                                console.error('Errore caricamento coach:', err);
                              }
                              setCoachAssignLoading(false);
                            }}
                          >
                            <UserCheck className="w-4 h-4 mr-1.5" />
                            Assegna Coach
                          </Button>

                          {/* Premium Buttons */}
                          {premiumClients.has(client.id) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500/40 text-green-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/40"
                              disabled={togglingPremiumId === client.id}
                              onClick={() => togglePremiumDirect(client, false)}
                            >
                              {togglingPremiumId === client.id ? (
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                              ) : (
                                <Crown className="w-4 h-4 mr-1.5" />
                              )}
                              Premium Attivo
                            </Button>
                          ) : (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500/40 text-green-500 hover:bg-green-500/10"
                                disabled={togglingPremiumId === client.id}
                                onClick={() => togglePremiumDirect(client, true)}
                              >
                                {togglingPremiumId === client.id ? (
                                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                ) : (
                                  <Crown className="w-4 h-4 mr-1.5" />
                                )}
                                Attiva Premium
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
                                onClick={() => openPremiumCodeDialog(client)}
                              >
                                <Key className="w-4 h-4 mr-1.5" />
                                Codice
                              </Button>
                            </div>
                          )}

                          {/* Delete User Button - Super Admin Only */}
                          {isSuperAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10"
                              onClick={() => openDeleteDialog(client)}
                            >
                              <Trash2 className="w-4 h-4 mr-1.5" />
                              Elimina
                            </Button>
                          )}
                        </div>
                        
                        {/* Expanded Client View - Progress, Photos, Check History */}
                        <ClientExpandedView 
                          clientId={client.id}
                          clientName={client.full_name}
                          coachNames={client.coach_names}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </TooltipProvider>
            </Accordion>
          )}
        </motion.div>
      </div>

      {/* Teachable Modal */}
      {selectedClient && (
        <TeachableModal
          open={teachableModalOpen}
          onOpenChange={setTeachableModalOpen}
          clientName={selectedClient.full_name}
          clientStatus={selectedClient.status}
        />
      )}

      {/* Coach Notes Dialog */}
      {notesClient && (
        <CoachNotesDialog
          open={notesDialogOpen}
          onOpenChange={setNotesDialogOpen}
          clientName={notesClient.full_name}
          clientId={notesClient.id}
          notes={notes[notesClient.id] || []}
          onAddNote={addNote}
          onMarkAsRead={markAsRead}
        />
      )}

      {/* Coach Assignment Dialog */}
      <Dialog open={coachAssignDialogOpen} onOpenChange={(open) => {
        setCoachAssignDialogOpen(open);
        if (!open) { setCoachAssignClient(null); setAssignedCoachId(null); setAvailableCoaches([]); }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-500" />
              Assegna Coach
            </DialogTitle>
            <DialogDescription>
              {coachAssignClient?.full_name || coachAssignClient?.email}
            </DialogDescription>
          </DialogHeader>
          {coachAssignLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {availableCoaches.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nessun coach disponibile</p>
              )}
              {availableCoaches.map(coach => {
                const isAssigned = assignedCoachId === coach.id;
                return (
                  <div key={coach.id} className={`flex items-center justify-between rounded-lg border p-3 ${isAssigned ? 'border-teal-500/50 bg-teal-500/5' : 'border-border'}`}>
                    <span className={`text-sm font-medium ${isAssigned ? 'text-teal-500' : ''}`}>{coach.name}</span>
                    <Button
                      size="sm"
                      variant={isAssigned ? 'default' : 'outline'}
                      className={isAssigned ? 'bg-teal-500 hover:bg-red-500 text-white' : ''}
                      onClick={async () => {
                        if (!coachAssignClient) return;
                        setCoachAssignLoading(true);
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          if (!session?.access_token) { toast({ variant: 'destructive', title: 'Errore', description: 'Non autenticato' }); return; }

                          // Aggiorna tramite supabase client (usa il DB corretto del deployment)
                          const newCoachId = isAssigned ? null : coach.id;
                          const { error: updateErr } = await (supabase as any)
                            .from('profiles')
                            .update({ coach_id: newCoachId })
                            .eq('id', coachAssignClient.id);

                          if (!updateErr) {
                            if (isAssigned) { setAssignedCoachId(null); toast({ title: 'Coach rimosso' }); }
                            else { setAssignedCoachId(coach.id); toast({ title: 'Coach assegnato', description: coach.name }); }
                            refetchClients();
                          } else {
                            toast({ variant: 'destructive', title: 'Errore', description: updateErr.message || 'Errore sconosciuto' });
                          }
                        } catch (err) {
                          console.error('Errore:', err);
                          toast({ variant: 'destructive', title: 'Errore', description: 'Errore nell\'operazione' });
                        }
                        setCoachAssignLoading(false);
                      }}
                    >
                      {isAssigned ? 'Rimuovi' : 'Assegna'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        setDeleteDialogOpen(open);
        if (!open) {
          setDeleteConfirmStep(1);
          setClientToDelete(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {deleteConfirmStep === 1 
                ? `Eliminare ${clientToDelete?.full_name}?` 
                : `⚠️ Conferma definitiva`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirmStep === 1 ? (
                <>
                  Stai per eliminare <strong>{clientToDelete?.full_name}</strong> e tutti i suoi dati.
                  <br /><br />
                  Clicca "Continua" per procedere con la conferma finale.
                </>
              ) : (
                <>
                  <strong className="text-destructive">ATTENZIONE:</strong> Questa azione eliminerà definitivamente:
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Il profilo utente</li>
                    <li>Tutti i diari</li>
                    <li>Lo storico dei dati</li>
                    <li>Le note coach</li>
                  </ul>
                  <br />
                  <strong>Questa azione non può essere annullata.</strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annulla</AlertDialogCancel>
            <Button
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminazione...' : deleteConfirmStep === 1 ? 'Continua' : 'ELIMINA DEFINITIVAMENTE'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Premium Code Generation Dialog */}
      <Dialog open={premiumCodeDialogOpen} onOpenChange={(open) => {
        setPremiumCodeDialogOpen(open);
        if (!open) { setPremiumCodeTarget(null); setGeneratedPremiumCode(null); }
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Codice Premium per {premiumCodeTarget?.full_name}
            </DialogTitle>
            <DialogDescription>
              Genera un codice che il cliente inserirà nell'app per sbloccare Premium
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Direct Activate Button */}
            {!premiumClients.has(premiumCodeTarget?.id || '') && (
              <div className="text-center p-3 border border-green-500/30 rounded-lg bg-green-500/5">
                <p className="text-sm text-muted-foreground mb-2">Attiva Premium direttamente senza codice</p>
                <Button
                  onClick={() => premiumCodeTarget && directActivatePremiumFromDialog(premiumCodeTarget)}
                  disabled={togglingPremiumId === premiumCodeTarget?.id}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  {togglingPremiumId === premiumCodeTarget?.id ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Attivazione...</>
                  ) : (
                    <><Crown className="w-4 h-4 mr-2" />Attiva Premium Diretto</>
                  )}
                </Button>
              </div>
            )}

            {premiumClients.has(premiumCodeTarget?.id || '') && (
              <div className="text-center p-3 border border-green-500/30 rounded-lg bg-green-500/5">
                <span className="text-green-500 font-medium flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5" /> Già Premium
                </span>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground mb-3 text-center">Oppure genera un codice che il cliente inserirà nell'app</p>
              {generatedPremiumCode ? (
                <div className="text-center space-y-3">
                  <div className="font-mono text-2xl font-bold tracking-widest bg-muted p-4 rounded-lg">
                    {generatedPremiumCode}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPremiumCode);
                      toast({ title: 'Copiato!', description: 'Codice copiato negli appunti' });
                    }}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copia Codice
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Button
                    onClick={() => premiumCodeTarget && generatePremiumCode(premiumCodeTarget)}
                    disabled={isGeneratingPremiumCode}
                    variant="outline"
                    className="border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
                  >
                    {isGeneratingPremiumCode ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generazione...</>
                    ) : (
                      <><Key className="w-4 h-4 mr-2" />Genera Codice</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Challenge Creation Dialog */}
      <Dialog open={challengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Crea Nuova Sfida
            </DialogTitle>
            <DialogDescription>
              Crea una sfida per motivare i tuoi clienti
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Titolo</label>
              <Input
                placeholder="Es. 7 giorni di diario consecutivi"
                value={challengeTitle}
                onChange={(e) => setChallengeTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrizione (opzionale)</label>
              <Textarea
                placeholder="Descrivi la sfida..."
                value={challengeDesc}
                onChange={(e) => setChallengeDesc(e.target.value)}
                className="min-h-[60px]"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Target</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={challengeTarget}
                  onChange={(e) => setChallengeTarget(parseInt(e.target.value) || 7)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Giorni</label>
                <Input
                  type="number"
                  min={1}
                  max={90}
                  value={challengeDays}
                  onChange={(e) => setChallengeDays(parseInt(e.target.value) || 7)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Emoji</label>
                <Input
                  value={challengeEmoji}
                  onChange={(e) => setChallengeEmoji(e.target.value)}
                  className="text-center text-xl"
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleCreateChallenge}
              disabled={isCreatingChallenge || !challengeTitle.trim()}
            >
              {isCreatingChallenge ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creazione...</>
              ) : (
                'Crea Sfida'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-500" />
              Messaggio a {messageClient?.full_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Scrivi il tuo messaggio..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setMessageDialogOpen(false)}
              >
                Annulla
              </Button>
              <Button
                className="flex-1"
                onClick={handleSendMessage}
                disabled={isSendingMessage || !messageContent.trim()}
              >
                {isSendingMessage ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Invio...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" />Invia</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default GestioneDiario;
