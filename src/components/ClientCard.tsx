import { motion } from "framer-motion";
import { Client, calculateDailyScore } from "@/lib/storage";
import { MessageCircle, Send, AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ClientCardProps {
  client: Client;
}

const ClientCard = ({ client }: ClientCardProps) => {
  const score = client.lastCheckin ? calculateDailyScore(client.lastCheckin) : 0;
  
  const handleSendMessage = (type: 'keep-going' | 'recalibrate' | 'intervention') => {
    const messages = {
      'keep-going': "Keep going! Your consistency is inspiring. 🔥",
      'recalibrate': "Time for a quick recalibration. Let's jump on a call this week.",
      'intervention': "Hey, I noticed you might need some extra support. I'm reaching out directly.",
    };
    
    toast({
      title: "Message sent",
      description: `Sent to ${client.name}: "${messages[type]}"`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl transition-all duration-300",
        client.status === 'red' && "card-elegant border-l-4 border-l-destructive",
        client.status === 'yellow' && "card-elegant border-l-4 border-l-warning",
        client.status === 'green' && "card-elegant border-l-4 border-l-success",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-semibold">{client.name}</h4>
            <p className="text-sm text-muted-foreground">
              {client.streak > 0 ? `${client.streak} day streak` : 'No active streak'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            client.status === 'green' && "status-green",
            client.status === 'yellow' && "status-yellow",
            client.status === 'red' && "status-red",
          )} />
          <span className="text-sm font-medium">
            {score > 0 ? score.toFixed(1) : '--'}
          </span>
        </div>
      </div>

      {client.lastCheckin && (
        <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
          <div className="text-center p-2 rounded bg-muted/50">
            <div className="text-muted-foreground">Recovery</div>
            <div className="font-semibold">{client.lastCheckin.recovery}</div>
          </div>
          <div className="text-center p-2 rounded bg-muted/50">
            <div className="text-muted-foreground">Nutrition</div>
            <div className="font-semibold">{client.lastCheckin.nutritionHit ? '✓' : '✗'}</div>
          </div>
          <div className="text-center p-2 rounded bg-muted/50">
            <div className="text-muted-foreground">Energy</div>
            <div className="font-semibold">{client.lastCheckin.energy}</div>
          </div>
          <div className="text-center p-2 rounded bg-muted/50">
            <div className="text-muted-foreground">Mindset</div>
            <div className="font-semibold">{client.lastCheckin.mindset}</div>
          </div>
        </div>
      )}

      {client.lastCheckin?.twoPercentEdge && (
        <div className="mt-3 p-2 rounded bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground">2% Edge:</p>
          <p className="text-sm">{client.lastCheckin.twoPercentEdge}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {client.status === 'green' && (
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-success border-success/30 hover:bg-success/10"
            onClick={() => handleSendMessage('keep-going')}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Keep Going
          </Button>
        )}
        {client.status === 'yellow' && (
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-warning border-warning/30 hover:bg-warning/10"
            onClick={() => handleSendMessage('recalibrate')}
          >
            <Send className="w-4 h-4 mr-1" />
            Recalibrate
          </Button>
        )}
        {client.status === 'red' && (
          <Button 
            size="sm" 
            className="flex-1 bg-destructive hover:bg-destructive/90"
            onClick={() => handleSendMessage('intervention')}
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            Intervene Now
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default ClientCard;
