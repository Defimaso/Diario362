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
  monthlyChecks?: MonthlyCheck[];
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

  // Find matching monthly check for a progress check by date
  const getMonthlyCheckForDate = (date: string): MonthlyCheck | undefined => {
    return monthlyChecks.find(mc => mc.check_date === date);
  };

  const handleRowClick = (check: ProgressCheck) => {
    const monthlyCheck = getMonthlyCheckForDate(check.date);
    if (monthlyCheck) {
      setSelectedMonthlyCheck(monthlyCheck);
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

        <ScrollArea className="h-[300px]">
          <TooltipProvider>
            <Table>
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
                  const hasMonthlyData = !!getMonthlyCheckForDate(check.date);
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
                        {(hasMonthlyData || onSelectCheck) && (
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
