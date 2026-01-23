import { motion } from 'framer-motion';
import { Calendar, Scale, Image, ChevronRight } from 'lucide-react';
import { ProgressCheck } from '@/hooks/useProgressChecks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HistoryTableProps {
  data: ProgressCheck[];
  onSelectCheck?: (check: ProgressCheck) => void;
}

const HistoryTable = ({ data, onSelectCheck }: HistoryTableProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const countPhotos = (check: ProgressCheck) => {
    let count = 0;
    if (check.photo_front_url) count++;
    if (check.photo_side_url) count++;
    if (check.photo_back_url) count++;
    return count;
  };

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elegant rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Storico Check</h3>
        </div>
        <div className="h-[100px] flex items-center justify-center text-muted-foreground text-sm">
          Nessun check registrato
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elegant rounded-xl p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Storico Check</h3>
        <Badge variant="secondary" className="ml-auto">
          {data.length} check
        </Badge>
      </div>

      <ScrollArea className="h-[300px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Data</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Foto</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((check) => (
              <TableRow 
                key={check.id}
                className={onSelectCheck ? 'cursor-pointer hover:bg-muted/50' : ''}
                onClick={() => onSelectCheck?.(check)}
              >
                <TableCell className="font-medium text-sm">
                  {formatDate(check.date)}
                </TableCell>
                <TableCell>
                  {check.weight ? (
                    <div className="flex items-center gap-1">
                      <Scale className="w-3 h-3 text-muted-foreground" />
                      <span>{check.weight} kg</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {countPhotos(check) > 0 ? (
                    <div className="flex items-center gap-1">
                      <Image className="w-3 h-3 text-muted-foreground" />
                      <span>{countPhotos(check)}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {onSelectCheck && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </motion.div>
  );
};

export default HistoryTable;
