import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, CheckCircle2, AlertTriangle, XCircle, ArrowLeft, LogOut, Filter, MessageSquare, History, AlertCircle } from "lucide-react";
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

type FilterStatus = 'all' | 'green' | 'yellow' | 'red';
type CoachFilter = 'all' | 'Martina' | 'Michela' | 'Cristina';

const GestioneDiario = () => {
  const { user, signOut, isAdmin, isCollaborator, isSuperAdmin, loading: authLoading } = useAuth();
  const { clients, loading: clientsLoading } = useAdminClients();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [coachFilter, setCoachFilter] = useState<CoachFilter>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && user && !isAdmin && !isCollaborator && !isSuperAdmin) {
      navigate('/diario');
    }
  }, [user, authLoading, isAdmin, isCollaborator, isSuperAdmin, navigate]);

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

  if (coachFilter !== 'all') {
    filteredClients = filteredClients.filter(c => 
      c.coach_names.includes(coachFilter) || 
      (coachFilter === 'Martina' && c.coach_names.includes('Michela_Martina')) ||
      (coachFilter === 'Michela' && c.coach_names.includes('Michela_Martina'))
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

  const handleSendMessage = (client: ClientData, type: 'support' | 'calibration' | 'rescue') => {
    const messages = {
      support: `Ciao ${client.full_name}! 🌟 Continua così, stai facendo un ottimo lavoro. Il tuo impegno sta dando risultati!`,
      calibration: `Ciao ${client.full_name}! 💪 Ho notato qualche variazione nei tuoi dati. Vuoi che organizziamo una call per ricalibrare insieme?`,
      rescue: `Ciao ${client.full_name}! 🆘 Mi sembra che tu stia attraversando un momento difficile. Sono qui per te - rispondimi appena puoi.`,
    };

    const message = encodeURIComponent(messages[type]);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    
    toast({
      title: 'Messaggio preparato',
      description: `Messaggio ${type} pronto per ${client.full_name}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </motion.header>

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

          {/* Coach Filter (only for super admin) */}
          {isSuperAdmin && (
            <Select value={coachFilter} onValueChange={(v) => setCoachFilter(v as CoachFilter)}>
              <SelectTrigger className="w-[140px] bg-card">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Coach" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="all">Tutti i coach</SelectItem>
                <SelectItem value="Martina">Martina</SelectItem>
                <SelectItem value="Michela">Michela</SelectItem>
                <SelectItem value="Cristina">Cristina</SelectItem>
              </SelectContent>
            </Select>
          )}
        </motion.div>

        {/* Client List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {filteredClients.length === 0 ? (
            <div className="card-elegant rounded-xl p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">Nessun cliente trovato</p>
            </div>
          ) : (
            filteredClients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="card-elegant rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Status indicator */}
                    <div className={cn(
                      "w-3 h-3 rounded-full shrink-0",
                      client.status === 'green' && "status-green",
                      client.status === 'yellow' && "status-yellow",
                      client.status === 'red' && "status-red",
                    )} />
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{client.full_name}</h3>
                        {client.streak > 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            🔥 {client.streak}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                      {isSuperAdmin && client.coach_names.length > 0 && (
                        <p className="text-xs text-primary mt-1">
                          Coach: {client.coach_names.join(', ').replace('Michela_Martina', 'Michela / Martina')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Today's scores */}
                  {client.last_checkin && (
                    <div className="hidden sm:flex gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-muted">R: {client.last_checkin.recovery || '-'}</span>
                      <span className="px-2 py-1 rounded bg-muted">N: {client.last_checkin.nutrition_adherence ? '✓' : '✗'}</span>
                      <span className="px-2 py-1 rounded bg-muted">E: {client.last_checkin.energy || '-'}</span>
                      <span className="px-2 py-1 rounded bg-muted">M: {client.last_checkin.mindset || '-'}</span>
                    </div>
                  )}
                </div>

                {/* 2% Edge message */}
                {client.last_checkin?.two_percent_edge && (
                  <div className="mt-3 p-2 rounded-lg bg-muted/50 text-sm">
                    <span className="text-primary font-medium">2% Extra: </span>
                    {client.last_checkin.two_percent_edge}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {client.status === 'green' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-success border-success/30 hover:bg-success/10"
                      onClick={() => handleSendMessage(client, 'support')}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Continua Così
                    </Button>
                  )}
                  {client.status === 'yellow' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-warning border-warning/30 hover:bg-warning/10"
                      onClick={() => handleSendMessage(client, 'calibration')}
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Ricalibra
                    </Button>
                  )}
                  {client.status === 'red' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => handleSendMessage(client, 'rescue')}
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Intervieni
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GestioneDiario;
