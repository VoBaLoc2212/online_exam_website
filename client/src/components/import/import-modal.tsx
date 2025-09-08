import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslation } from "@/lib/i18n";
import { Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, options: ImportOptions) => Promise<void>;
  questionBanks: Array<{ id: string; name: string }>;
}

interface ImportOptions {
  questionBankId: string;
  testType: string;
  skillType: string;
  format: string;
}

export function ImportModal({ isOpen, onClose, onImport, questionBanks }: ImportModalProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [options, setOptions] = useState<ImportOptions>({
    questionBankId: '',
    testType: 'aptis',
    skillType: 'reading',
    format: 'excel'
  });
  const [importing, setImporting] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !options.questionBankId) return;
    
    setImporting(true);
    try {
      await onImport(selectedFile, options);
      onClose();
      setSelectedFile(null);
      setOptions({
        questionBankId: '',
        testType: 'aptis',
        skillType: 'reading',
        format: 'excel'
      });
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setImporting(false);
    }
  };

  const getSupportedFormats = () => {
    switch (options.format) {
      case 'word':
        return '.docx';
      case 'excel':
        return '.xlsx';
      case 'json':
        return '.json';
      default:
        return '.docx,.xlsx,.json';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="import-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>{t('importQuestions')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3">{t('selectFile')}</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
              data-testid="file-dropzone"
            >
              {selectedFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="w-6 h-6 text-primary" />
                  <span className="text-foreground font-medium">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-muted-foreground mb-4 mx-auto" />
                  <p className="text-foreground font-medium mb-2">
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports: .docx, .xlsx, .json
                  </p>
                </>
              )}
              <Input
                id="file-input"
                type="file"
                className="hidden"
                accept={getSupportedFormats()}
                onChange={handleFileSelect}
                data-testid="file-input"
              />
            </div>
          </div>

          {/* Question Bank Selection */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-2">Question Bank</Label>
            <Select 
              value={options.questionBankId} 
              onValueChange={(value) => setOptions(prev => ({ ...prev, questionBankId: value }))}
            >
              <SelectTrigger data-testid="select-question-bank">
                <SelectValue placeholder="Select a question bank" />
              </SelectTrigger>
              <SelectContent>
                {questionBanks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format Selection */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-3">{t('fileFormat')}</Label>
            <RadioGroup
              value={options.format}
              onValueChange={(value) => setOptions(prev => ({ ...prev, format: value }))}
              className="grid grid-cols-3 gap-4"
              data-testid="format-selection"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent cursor-pointer">
                <RadioGroupItem value="word" id="format-word" />
                <Label htmlFor="format-word" className="cursor-pointer">
                  <div className="text-sm font-medium text-foreground">Word Document</div>
                  <div className="text-xs text-muted-foreground">.docx format</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent cursor-pointer">
                <RadioGroupItem value="excel" id="format-excel" />
                <Label htmlFor="format-excel" className="cursor-pointer">
                  <div className="text-sm font-medium text-foreground">Excel Sheet</div>
                  <div className="text-xs text-muted-foreground">.xlsx format</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent cursor-pointer">
                <RadioGroupItem value="json" id="format-json" />
                <Label htmlFor="format-json" className="cursor-pointer">
                  <div className="text-sm font-medium text-foreground">JSON File</div>
                  <div className="text-xs text-muted-foreground">.json format</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Test Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2">{t('testType')}</Label>
              <Select 
                value={options.testType} 
                onValueChange={(value) => setOptions(prev => ({ ...prev, testType: value }))}
              >
                <SelectTrigger data-testid="select-test-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aptis">APTIS ESOL</SelectItem>
                  <SelectItem value="vstep">VSTEP</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-foreground mb-2">{t('skillCategory')}</Label>
              <Select 
                value={options.skillType} 
                onValueChange={(value) => setOptions(prev => ({ ...prev, skillType: value }))}
              >
                <SelectTrigger data-testid="select-skill-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reading">{t('reading')}</SelectItem>
                  <SelectItem value="listening">{t('listening')}</SelectItem>
                  <SelectItem value="grammar">{t('grammar')}</SelectItem>
                  <SelectItem value="vocabulary">{t('vocabulary')}</SelectItem>
                  <SelectItem value="writing">{t('writing')}</SelectItem>
                  <SelectItem value="speaking">{t('speaking')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-import">
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleImport}
            disabled={!selectedFile || !options.questionBankId || importing}
            data-testid="button-import-questions"
          >
            <Upload className="w-4 h-4 mr-2" />
            {importing ? t('loading') : t('importQuestions')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
