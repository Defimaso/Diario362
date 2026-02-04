import { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface StaffDocumentUploadProps {
  onUpload: (file: File, title: string) => Promise<boolean>;
  uploading: boolean;
}

const StaffDocumentUpload = ({ onUpload, uploading }: StaffDocumentUploadProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title from filename if empty
      if (!title) {
        setTitle(file.name.replace(/\.pdf$/i, ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    const success = await onUpload(selectedFile, title);
    if (success) {
      setOpen(false);
      setTitle('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTitle('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Upload className="w-4 h-4" />
          Carica PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Carica Documento</DialogTitle>
          <DialogDescription>
            Carica un PDF che il cliente potrà scaricare.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titolo documento</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es: Scheda Allenamento Settimana 1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">File PDF</Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
            />
            <p className="text-xs text-muted-foreground">
              Solo formato PDF • Max 10MB
            </p>
          </div>
          
          {selectedFile && (
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
              File selezionato: {selectedFile.name}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={uploading}
          >
            Annulla
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Caricamento...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Carica
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StaffDocumentUpload;
