import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Folder, Calendar, Clock, FileText, Trash2, Settings } from 'lucide-react';

const FileManagementSettings = () => {
  const [outputPath, setOutputPath] = useState('C:\\Gravacoes\\');
  const [autoDateFolder, setAutoDateFolder] = useState(true);
  const [dateFormat, setDateFormat] = useState('YYYY/MM/DD');
  const [autoDeleteOld, setAutoDeleteOld] = useState(false);
  const [keepDays, setKeepDays] = useState(30);
  const [splitInterval, setSplitInterval] = useState(60);
  const [fileNamePattern, setFileNamePattern] = useState('timestamp-title-sequence');
  const [customTitle, setCustomTitle] = useState('Gravacao');

  const dateFormats = [
    { value: 'YYYY/MM/DD', label: 'AAAA/MM/DD (2024/12/29)' },
    { value: 'YYYY-MM-DD', label: 'AAAA-MM-DD (2024-12-29)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/AAAA (29/12/2024)' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-AAAA (29-12-2024)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/AAAA (12/29/2024)' },
    { value: 'MM-DD-YYYY', label: 'MM-DD-AAAA (12-29-2024)' },
    { value: 'YYYY/MM', label: 'AAAA/MM (2024/12)' },
    { value: 'YYYY-MM', label: 'AAAA-MM (2024-12)' },
    { value: 'YYYY', label: 'Apenas Ano (2024)' }
  ];

  const fileNamePatterns = [
    { value: 'timestamp-title-sequence', label: 'Data/Hora + Título + Sequência' },
    { value: 'title-timestamp-sequence', label: 'Título + Data/Hora + Sequência' },
    { value: 'sequence-timestamp-title', label: 'Sequência + Data/Hora + Título' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const formatExampleFileName = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const sequence = '001';
    
    switch (fileNamePattern) {
      case 'timestamp-title-sequence':
        return `${timestamp}_${customTitle}_${sequence}.wav`;
      case 'title-timestamp-sequence':
        return `${customTitle}_${timestamp}_${sequence}.wav`;
      case 'sequence-timestamp-title':
        return `${sequence}_${timestamp}_${customTitle}.wav`;
      default:
        return `${timestamp}_${customTitle}_${sequence}.wav`;
    }
  };

  const formatExampleDateFolder = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    switch (dateFormat) {
      case 'YYYY/MM/DD':
        return `${year}/${month}/${day}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'MM-DD-YYYY':
        return `${month}-${day}-${year}`;
      case 'YYYY/MM':
        return `${year}/${month}`;
      case 'YYYY-MM':
        return `${year}-${month}`;
      case 'YYYY':
        return `${year}`;
      default:
        return `${year}/${month}/${day}`;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Folder className="w-5 h-5 text-studio-electric" />
            <h3 className="text-lg font-semibold text-studio-electric">Configurações de Diretório</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="output-path" className="text-sm font-medium text-studio-electric">
                Diretório de Saída
              </Label>
              <div className="flex mt-2 space-x-2">
                <Input
                  id="output-path"
                  value={outputPath}
                  onChange={(e) => setOutputPath(e.target.value)}
                  className="flex-1 bg-studio-dark border-studio-electric/30 text-studio-electric"
                  placeholder="C:\Gravacoes\"
                />
                <Button className="pro-button bg-studio-electric hover:bg-studio-electric/80 text-studio-dark">
                  Procurar
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-studio-electric">
                  Criar Subpastas por Data
                </Label>
                <p className="text-xs text-muted-foreground">
                  Organiza automaticamente por data
                </p>
              </div>
              <Switch
                checked={autoDateFolder}
                onCheckedChange={setAutoDateFolder}
              />
            </div>

            {autoDateFolder && (
              <div>
                <Label htmlFor="date-format" className="text-sm font-medium text-studio-electric">
                  Formato das Subpastas
                </Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger className="mt-2 bg-studio-dark border-studio-electric/30">
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent className="bg-studio-dark border-studio-electric/30">
                    {dateFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="text-xs text-muted-foreground bg-studio-dark p-3 rounded">
              <strong>Estrutura de Pastas:</strong><br />
              {autoDateFolder ? 
                `${outputPath}${formatExampleDateFolder()}\\arquivo.wav` : 
                `${outputPath}arquivo.wav`
              }
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-studio-electric" />
            <h3 className="text-lg font-semibold text-studio-electric">Divisão de Arquivos</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="split-interval" className="text-sm font-medium text-studio-electric">
                Intervalo de Divisão (minutos): {splitInterval}
              </Label>
              <div className="flex mt-2 space-x-2 items-center">
                <Input
                  id="split-interval"
                  type="number"
                  min="1"
                  max="999"
                  value={splitInterval}
                  onChange={(e) => setSplitInterval(Number(e.target.value))}
                  className="w-24 bg-studio-dark border-studio-electric/30 text-studio-electric"
                />
                <span className="text-sm text-muted-foreground">
                  min (1-999)
                </span>
              </div>
            </div>

            <div className="bg-studio-warning/10 border border-studio-warning/30 p-3 rounded">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-studio-warning" />
                <span className="text-sm font-medium text-studio-warning">
                  Gravação Sem Perdas
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sistema de buffer duplo garante transição perfeita entre arquivos.
                Zero perda de áudio garantida.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Próxima Divisão:</span>
                <span className="text-studio-neon ml-2 font-mono">
                  {Math.floor(splitInterval - (new Date().getMinutes() % splitInterval))} min
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Buffer Status:</span>
                <span className="text-studio-neon ml-2 font-mono">Ativo</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-studio-electric" />
            <h3 className="text-lg font-semibold text-studio-electric">Nomenclatura de Arquivos</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-title" className="text-sm font-medium text-studio-electric">
                Título Personalizado
              </Label>
              <Input
                id="custom-title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="mt-2 bg-studio-dark border-studio-electric/30 text-studio-electric"
                placeholder="Ex: Gravacao, Sessao, Audio"
              />
            </div>

            <div>
              <Label htmlFor="name-pattern" className="text-sm font-medium text-studio-electric">
                Padrão de Nomenclatura
              </Label>
              <Select value={fileNamePattern} onValueChange={setFileNamePattern}>
                <SelectTrigger className="mt-2 bg-studio-dark border-studio-electric/30">
                  <SelectValue placeholder="Selecione o padrão" />
                </SelectTrigger>
                <SelectContent className="bg-studio-dark border-studio-electric/30">
                  {fileNamePatterns.map((pattern) => (
                    <SelectItem key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-studio-dark p-3 rounded border border-studio-electric/20">
              <Label className="text-xs text-muted-foreground">Exemplo de Arquivo:</Label>
              <div className="text-sm text-studio-neon font-mono mt-1">
                {formatExampleFileName()}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Trash2 className="w-5 h-5 text-studio-electric" />
            <h3 className="text-lg font-semibold text-studio-electric">Limpeza Automática</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-studio-electric">
                  Excluir Arquivos Antigos
                </Label>
                <p className="text-xs text-muted-foreground">
                  Remove automaticamente arquivos mais antigos que o período definido
                </p>
              </div>
              <Switch
                checked={autoDeleteOld}
                onCheckedChange={setAutoDeleteOld}
              />
            </div>

            {autoDeleteOld && (
              <div>
                <Label htmlFor="keep-days" className="text-sm font-medium text-studio-electric">
                  Manter Arquivos por (dias): {keepDays}
                </Label>
                <Input
                  id="keep-days"
                  type="number"
                  min="1"
                  max="365"
                  value={keepDays}
                  onChange={(e) => setKeepDays(Number(e.target.value))}
                  className="mt-2 w-24 bg-studio-dark border-studio-electric/30 text-studio-electric"
                />
              </div>
            )}

            <div className="bg-studio-warning/10 border border-studio-warning/30 p-3 rounded">
              <p className="text-xs text-studio-warning">
                ⚠️ Atenção: Arquivos excluídos não poderão ser recuperados.
                Certifique-se de fazer backup dos arquivos importantes.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FileManagementSettings;
