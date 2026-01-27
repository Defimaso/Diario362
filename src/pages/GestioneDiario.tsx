import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, CheckCircle2, AlertTriangle, XCircle, ArrowLeft, LogOut, Filter, GraduationCap, Phone, Mail, AlertCircle, Trash2, MessageSquare, ChevronDown } from "lucide-react";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useCoachNotes } from "@/hooks/useCoachNotes";
import CoachNotesDialog from "@/components/CoachNotesDialog";
import ClientExpandedView from "@/components/ClientExpandedView";

// WhatsApp SVG Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

type FilterStatus = 'all' | 'green' | 'yellow' | 'red';
type CoachFilter = 'all' | 'Ilaria' | 'Marco' | 'Martina' | 'Michela' | 'Cristina';

const GestioneDiario = () => {
  const { user, signOut, isAdmin, isCollaborator, isSuperAdmin, loading: authLoading } = useAuth();
  const { clients, loading: clientsLoading, refetch: refetchClients } = useAdminClients();
  const { notes, addNote, markAsRead, hasUnreadNotes } = useCoachNotes();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [coachFilter, setCoachFilter] = useState<CoachFilter>('all');
  const [teachableModalOpen, setTeachableModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  
  // Delete user state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientData | null>(null);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Coach notes state
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesClient, setNotesClient] = useState<ClientData | null>(null);
  
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
    filteredClients = filteredClients.filter(c => {
      if (coachFilter === 'Ilaria') {
        return c.coach_names.some(name => 
          name === 'Ilaria' || name.includes('Ilaria')
        );
      }
      if (coachFilter === 'Marco') {
        return c.coach_names.some(name => 
          name === 'Marco' || name.includes('Marco')
        );
      }
      if (coachFilter === 'Martina') {
        return c.coach_names.some(name => 
          name === 'Martina' || name.includes('Martina')
        );
      }
      if (coachFilter === 'Michela') {
        return c.coach_names.some(name => 
          name === 'Michela' || name.includes('Michela')
        );
      }
      return c.coach_names.includes(coachFilter);
    });
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

  const formatPhoneForWhatsApp = (phone: string | null): string => {
    if (!phone) return '';
    // Remove all non-digit characters except the leading +
    return phone.replace(/[^\d]/g, '');
  };

  const handleWhatsAppClick = (client: ClientData) => {
    const formattedPhone = formatPhoneForWhatsApp(client.phone_number);
    if (formattedPhone) {
      window.open(`https://wa.me/${formattedPhone}`, '_blank');
    } else {
      toast({
        variant: 'destructive',
        title: 'Numero non disponibile',
        description: `${client.full_name} non ha un numero di telefono registrato.`,
      });
    }
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

  // Helper to calculate days since last checkin
  const getDaysSinceLastCheckin = (client: ClientData): number => {
    if (!client.last_checkin?.date) return 999;
    const lastDate = new Date(client.last_checkin.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Get client badge
  const getClientBadge = (client: ClientData) => {
    const totalCheckins = client.streak || 0;
    return getCurrentBadge(client.streak, totalCheckins);
  };

  // Check if client is at risk
  const checkClientRisk = (client: ClientData): boolean => {
    const daysSince = getDaysSinceLastCheckin(client);
    const badge = getClientBadge(client);
    return isClientAtRisk(badge, daysSince);
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

          {/* Coach Filter (for all admins) */}
          {(isSuperAdmin || isAdmin) && (
            <Select value={coachFilter} onValueChange={(v) => setCoachFilter(v as CoachFilter)}>
              <SelectTrigger className="w-[140px] bg-card">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Coach" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                <SelectItem value="all">Tutti i coach</SelectItem>
                <SelectItem value="Ilaria">Ilaria</SelectItem>
                <SelectItem value="Marco">Marco</SelectItem>
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
                  const clientBadge = getClientBadge(client);
                  const isAtRisk = checkClientRisk(client);
                  const daysSince = getDaysSinceLastCheckin(client);
                  
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
                              <span>Rischio abbandono: {daysSince} giorni senza check-in</span>
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
                          {/* WhatsApp Button */}
                          {client.phone_number ? (
                            <a
                              href={`https://wa.me/${formatPhoneForWhatsApp(client.phone_number)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className={cn(
                                  "text-[#25D366] border-[#25D366]/30 hover:bg-[#25D366]/10",
                                  client.status === 'red' && "animate-pulse"
                                )}
                              >
                                <WhatsAppIcon className="w-4 h-4 mr-1.5" />
                                WhatsApp
                                {client.status === 'red' && (
                                  <span className="ml-1.5 w-2 h-2 rounded-full bg-destructive animate-ping" />
                                )}
                              </Button>
                            </a>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-muted-foreground border-muted cursor-not-allowed"
                              disabled
                            >
                              <WhatsAppIcon className="w-4 h-4 mr-1.5" />
                              N/D
                            </Button>
                          )}

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
                    <li>Tutti i check-in</li>
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
    </div>
  );
};

export default GestioneDiario;
