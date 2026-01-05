import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Target, Zap } from "lucide-react";

interface TeachableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  clientStatus: 'green' | 'yellow' | 'red';
}

const TeachableModal = ({ open, onOpenChange, clientName, clientStatus }: TeachableModalProps) => {
  // TODO: Future integration with Teachable API
  // This will eventually trigger an API call to Teachable to assign specific modules
  // based on the client's current status (Red/Yellow/Green)
  
  const suggestedModules = {
    red: [
      { name: "Modulo Recupero Base", icon: Target, description: "Fondamenti per tornare in carreggiata" },
      { name: "Gestione dello Stress", icon: Zap, description: "Tecniche di rilassamento e mindfulness" },
    ],
    yellow: [
      { name: "Ottimizzazione Performance", icon: Zap, description: "Strategie per migliorare i risultati" },
      { name: "Nutrizione Avanzata", icon: BookOpen, description: "Approfondimenti nutrizionali" },
    ],
    green: [
      { name: "Masterclass Elite", icon: GraduationCap, description: "Contenuti avanzati per top performer" },
      { name: "Mindset Champion", icon: Target, description: "Mentalità vincente" },
    ],
  };

  const modules = suggestedModules[clientStatus];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Assegna Task Academy
          </DialogTitle>
          <DialogDescription>
            Seleziona materiale da assegnare a <span className="font-medium text-foreground">{clientName}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Materiali suggeriti in base allo stato attuale:
          </p>
          
          <div className="space-y-3">
            {modules.map((module, index) => (
              <button
                key={index}
                className="w-full p-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left group"
                onClick={() => {
                  // TODO: Integrate with Teachable API
                  onOpenChange(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <module.icon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{module.name}</p>
                    <p className="text-xs text-muted-foreground">{module.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-dashed border-border">
            <p className="text-xs text-muted-foreground text-center">
              🚧 Integrazione Teachable in arrivo
            </p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeachableModal;
