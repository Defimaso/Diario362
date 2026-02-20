import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Scale, Image, ChevronRight, FileSpreadsheet, Database } from 'lucide-react';
import { ProgressCheck } from '@/hooks/useProgressChecks';
import { MonthlyCheck } from '@/hooks/useMonthlyChecks';
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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import MonthlyCheckDetails from './MonthlyCheckDetails';

interface HistoryTableProps {
  data: ProgressCheck[];
  monthlyChecks?: MonthlyCheck[] | ProgressCheck[];
  onSelectCheck?: (check: ProgressCheck) => void;
}

const HistoryTable = ({ data, monthlyChecks = [], onSelectCheck }: HistoryTableProps) => {
  const [selectedMonthlyCheck, setSelectedMonthlyCheck] = useState<MonthlyCheck | null>(null);

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

  // Convert a ProgressCheck (external) to MonthlyCheck format for the details modal
  const toMonthlyCheck = (check: ProgressCheck): MonthlyCheck => ({
    id: check.id,
    user_id: check.user_id,
    email: '',
    current_weight: check.weight,
    photo_front_url: check.photo_front_url,
    photo_side_url: check.photo_side_url,
    photo_back_url: check.photo_back_url,
    check_date: check.date,
    created_at: check.created_at,
    updated_at: check.updated_at,
  });

  const handleRowClick = (check: ProgressCheck) => {
    if (check.source === 'external') {
      setSelectedMonthlyCheck(toMonthlyCheck(check));
    } else if (onSelectCheck) {
      onSelectCheck(check);
    }
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
    <>
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

        {/* Mobile: card list — Desktop: tabella */}
        <ScrollArea className="h-[300px]">
          <TooltipProvider>
            {/* Card layout su mobile */}
            <div className="sm:hidden space-y-2">
              {data.map((check) => {
                const isExternal = check.source === 'external';
                return (
                  <div
                    key={check.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 cursor-pointer active:bg-muted/60 transition-colors"
                    onClick={() => handleRowClick(check)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">
                        {new Date(check.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {check.weight && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Scale className="w-3 h-3" />{check.weight} kg
                          </span>
                        )}
                        {countPhotos(check) > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Image className="w-3 h-3" />{countPhotos(check)} foto
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isExternal ? (
                        <FileSpreadsheet className="w-4 h-4 text-green-500" />
                      ) : (
                        <Database className="w-4 h-4 text-blue-500" />
                      )}
                      {(isExternal || onSelectCheck) && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tabella su sm+ */}
            <Table className="hidden sm:table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Data</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Foto</TableHead>
                  <TableHead className="w-[50px]">Fonte</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((check) => {
                  const isExternal = check.source === 'external';

                  return (
                    <TableRow
                      key={check.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(check)}
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
                        <Tooltip>
                          <TooltipTrigger>
                            {isExternal ? (
                              <FileSpreadsheet className="w-4 h-4 text-green-500" />
                            ) : (
                              <Database className="w-4 h-4 text-blue-500" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {isExternal ? 'Importato da Google Sheets' : 'Inserito manualmente'}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {(isExternal || onSelectCheck) && (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TooltipProvider>
        </ScrollArea>
      </motion.div>

      {/* Monthly Check Details Modal */}
      <AnimatePresence>
        {selectedMonthlyCheck && (
          <MonthlyCheckDetails
            check={selectedMonthlyCheck}
            onClose={() => setSelectedMonthlyCheck(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default HistoryTable;
