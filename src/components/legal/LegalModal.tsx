import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LegalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'terms' | 'privacy';
}

const LegalModal = ({ open, onOpenChange, type }: LegalModalProps) => {
  const isTerms = type === 'terms';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {isTerms ? 'Termini e Condizioni' : 'Informativa sulla Privacy'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {isTerms ? <TermsContent /> : <PrivacyContent />}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const TermsContent = () => (
  <div className="space-y-4 text-sm text-muted-foreground">
    <h3 className="text-foreground font-semibold">1. Accettazione dei Termini</h3>
    <p>
      Utilizzando l'applicazione 362gradi.ae ("App"), l'utente accetta di essere vincolato 
      dai presenti Termini e Condizioni. L'App è di proprietà di MerryProject Global, 
      con sede a Dubai, UAE.
    </p>

    <h3 className="text-foreground font-semibold">2. Descrizione del Servizio</h3>
    <p>
      362gradi.ae è una piattaforma di coaching per il benessere e il fitness che permette 
      agli utenti di tracciare i propri progressi attraverso check giornalieri, foto di 
      avanzamento e monitoraggio del peso corporeo.
    </p>

    <h3 className="text-foreground font-semibold">3. Account Utente</h3>
    <p>
      L'utente è responsabile del mantenimento della riservatezza delle proprie credenziali 
      di accesso. Ogni attività svolta attraverso l'account è responsabilità dell'utente.
    </p>

    <h3 className="text-foreground font-semibold">4. Uso Appropriato</h3>
    <p>
      L'utente si impegna a utilizzare l'App solo per scopi leciti e in conformità con 
      questi Termini. È vietato:
    </p>
    <ul className="list-disc pl-6 space-y-1">
      <li>Caricare contenuti illegali, offensivi o inappropriati</li>
      <li>Tentare di accedere a dati di altri utenti</li>
      <li>Utilizzare l'App per scopi commerciali non autorizzati</li>
      <li>Interferire con il funzionamento dell'App</li>
    </ul>

    <h3 className="text-foreground font-semibold">5. Proprietà Intellettuale</h3>
    <p>
      Tutti i contenuti dell'App, inclusi loghi, design e software, sono di proprietà 
      esclusiva di MerryProject Global e sono protetti dalle leggi sulla proprietà 
      intellettuale.
    </p>

    <h3 className="text-foreground font-semibold">6. Limitazione di Responsabilità</h3>
    <p>
      L'App è fornita "così com'è". MerryProject Global non garantisce risultati specifici 
      dall'uso del servizio. Il coaching fornito non sostituisce consulenza medica 
      professionale.
    </p>

    <h3 className="text-foreground font-semibold">7. Modifiche ai Termini</h3>
    <p>
      Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. 
      Le modifiche saranno comunicate attraverso l'App o via email.
    </p>

    <h3 className="text-foreground font-semibold">8. Legge Applicabile</h3>
    <p>
      Questi Termini sono regolati dalle leggi degli Emirati Arabi Uniti. Per qualsiasi 
      controversia sarà competente il foro di Dubai.
    </p>

    <h3 className="text-foreground font-semibold">9. Contatti</h3>
    <p>
      Per domande sui presenti Termini, contattare: legal@362gradi.ae
    </p>

    <p className="text-xs text-muted-foreground/70 pt-4">
      Ultimo aggiornamento: Gennaio 2026
    </p>
  </div>
);

const PrivacyContent = () => (
  <div className="space-y-4 text-sm text-muted-foreground">
    <h3 className="text-foreground font-semibold">1. Titolare del Trattamento</h3>
    <p>
      Il Titolare del trattamento dei dati è MerryProject Global, con sede a Dubai, UAE. 
      Email DPO: dpo@362gradi.ae
    </p>

    <h3 className="text-foreground font-semibold">2. Dati Raccolti</h3>
    <p>Raccogliamo le seguenti categorie di dati:</p>
    <ul className="list-disc pl-6 space-y-1">
      <li><strong>Dati identificativi:</strong> nome, email, numero di telefono</li>
      <li><strong>Dati biometrici e sanitari:</strong> peso corporeo, foto del corpo</li>
      <li><strong>Dati di utilizzo:</strong> check giornalieri, note, progressi</li>
      <li><strong>Dati tecnici:</strong> indirizzo IP, informazioni sul dispositivo</li>
    </ul>

    <h3 className="text-foreground font-semibold">3. Finalità del Trattamento</h3>
    <p>I dati sono trattati per:</p>
    <ul className="list-disc pl-6 space-y-1">
      <li>Erogazione del servizio di coaching</li>
      <li>Monitoraggio dei progressi dell'utente</li>
      <li>Comunicazioni relative al servizio</li>
      <li>Miglioramento dell'esperienza utente</li>
    </ul>

    <h3 className="text-foreground font-semibold">4. Base Giuridica</h3>
    <p>
      Il trattamento dei dati personali si basa sul consenso esplicito dell'utente 
      (Art. 6(1)(a) GDPR). Per i dati sensibili (foto, peso), è richiesto un consenso 
      specifico (Art. 9(2)(a) GDPR).
    </p>

    <h3 className="text-foreground font-semibold">5. Condivisione dei Dati</h3>
    <p>
      I dati sono accessibili solo ai coach assegnati all'utente e al personale 
      autorizzato di 362gradi.ae. Non vendiamo né condividiamo dati con terze parti 
      per scopi di marketing.
    </p>

    <h3 className="text-foreground font-semibold">6. Conservazione dei Dati</h3>
    <p>
      I dati sono conservati per tutta la durata del rapporto contrattuale e per 
      un massimo di 2 anni dopo la cessazione del servizio, salvo obblighi legali 
      diversi.
    </p>

    <h3 className="text-foreground font-semibold">7. Diritti dell'Interessato</h3>
    <p>L'utente ha diritto a:</p>
    <ul className="list-disc pl-6 space-y-1">
      <li><strong>Accesso:</strong> ottenere copia dei propri dati</li>
      <li><strong>Rettifica:</strong> correggere dati inesatti</li>
      <li><strong>Cancellazione:</strong> richiedere l'eliminazione dei dati ("diritto all'oblio")</li>
      <li><strong>Portabilità:</strong> ricevere i dati in formato strutturato</li>
      <li><strong>Opposizione:</strong> opporsi a determinati trattamenti</li>
      <li><strong>Revoca del consenso:</strong> revocare il consenso in qualsiasi momento</li>
    </ul>

    <h3 className="text-foreground font-semibold">8. Sicurezza dei Dati</h3>
    <p>
      Implementiamo misure di sicurezza tecniche e organizzative per proteggere i dati, 
      inclusa crittografia, controlli di accesso e audit regolari.
    </p>

    <h3 className="text-foreground font-semibold">9. Trasferimenti Internazionali</h3>
    <p>
      I dati possono essere trasferiti e conservati su server situati al di fuori 
      del SEE. In tal caso, garantiamo adeguate salvaguardie ai sensi del GDPR.
    </p>

    <h3 className="text-foreground font-semibold">10. Contatti</h3>
    <p>
      Per esercitare i propri diritti o per domande sulla privacy, contattare il 
      Data Protection Officer: dpo@362gradi.ae
    </p>

    <p className="text-xs text-muted-foreground/70 pt-4">
      Ultimo aggiornamento: Gennaio 2026
    </p>
  </div>
);

export default LegalModal;
