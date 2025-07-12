import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FolderOpen, FileText, Clock, Trash2 } from 'lucide-react';
import { audioService } from '@/services/electronAudio';
import { toast } from 'sonner';

const FileManagementSettings = () => {
  const [outputPath, setOutputPath] = useState('C:\\Gravacoes\\');
  const [dateFormat, setDateFormat] = useState('dd-mm-yyyy');
  const [dateFolderEnabled, setDateFolderEnabled] = useState(false);
  const [autoDelete, setAutoDelete] = useState(false);
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitInterval, setSplitInterval] = useState('60');
  const [fileNamePattern, setFileNamePattern] = useState('timestamp');
  const [customTitle, setCustomTitle] = useState('');

  // Sincronizar com audioService na inicialização
  useEffect(() => {
    setDateFolderEnabled(audioService.getDateFolderEnabled());
    setDateFormat(audioService.getDateFolderFormat());
    setSplitEnabled(audioService.getSplitEnabled());
    setSplitInterval(audioService.getSplitInterval().toString());
  }, []);

  const dateFormats = [
    { value: 'dd-mm-yyyy', label: 'DD-MM-AAAA (31-12-2024)', example: '31-12-2024' },
    { value: 'mm-dd-yyyy', label: 'MM-DD-AAAA (12-31-2024)', example: '12-31-2024' },
    { value: 'yyyy-mm-dd', label: 'AAAA-MM-DD (2024-12-31)', example: '2024-12-31' },
    { value: 'yyyy/mm/dd', label: 'AAAA/MM/DD (2024/12/31)', example: '2024/12/31' }
  ];

  const fileNamePatterns = [
    { value: 'timestamp', label: 'Data/Hora (2024-12-31_14-30-15)', example: 'gravacao_2024-12-31_14-30-15.wav' },
    { value: 'custom-timestamp', label: 'Título + Data/Hora', example: 'Sessao_2024-12-31_14-30-15.wav' },
    { value: 'sequence', label: 'Sequencial (001, 002, 003)', example: 'gravacao_001.wav' },
    { value: 'custom', label: 'Personalizado', example: 'CustomName.wav' }
  ];

  const formatExampleFileName = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const title = customTitle || 'gravacao';
    
    switch (fileNamePattern) {
      case 'timestamp':
        return `gravacao_${timestamp}.wav`;
      case 'custom-timestamp':
        return `${title}_${timestamp}.wav`;
      case 'sequence':
        return `${title}_001.wav`;
      case 'custom':
        return `${title}.wav`;
      default:
        return `gravacao_${timestamp}.wav`;
    }
  };

  const formatExampleDateFolder = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString();

    switch (dateFormat) {
      case 'dd-mm-yyyy':
        return `${day}-${month}-${year}`;
      case 'mm-dd-yyyy':
        return `${month}-${day}-${year}`;
      case 'yyyy-mm-dd':
        return `${year}-${month}-${day}`;
      case 'yyyy/mm/dd':
        return `${year}/${month}/${day}`;
      default:
        return `${day}-${month}-${year}`;
    }
  };

  // Handlers para sincronizar com audioService
  const handleDateFolderToggle = (enabled: boolean) => {
    setDateFolderEnabled(enabled);
    audioService.setDateFolderEnabled(enabled);
    toast.success(enabled ? 'Pastas por data ativadas' : 'Pastas por data desativadas');
  };

  const handleDateFormatChange = (format: string) => {
    setDateFormat(format);
    audioService.setDateFolderFormat(format);
    toast.success('Formato de data atualizado');
  };

  const handleSplitToggle = (enabled: boolean) => {
    setSplitEnabled(enabled);
    audioService.setSplitEnabled(enabled);
    toast.success(enabled ? 'Divisão automática ativada' : 'Divisão automática desativada');
  };

  const handleSplitIntervalChange = (interval: string) => {
    setSplitInterval(interval);
    audioService.setSplitInterval(parseInt(interval));
    toast.success(`Intervalo de divisão: ${interval} minutos`);
  };

  return (
    <div className="space-y-6">
      {/* Configurações de Diretório */}
      <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FolderOpen className="w-5 h-5 text-studio-electric" />
            <h3 className="text-lg font-semibold text-studio-electric">Configurações de Diretório</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="date-folders" className="text-sm font-medium text-studio-electric">
                Organizar por Data
              </Label>
              <Switch 
                id="date-folders" 
                checked={dateFolderEnabled}
                onCheckedChange={handleDateFolderToggle}
                className="data-[state=checked]:bg-studio-electric"
              />
            </div>
            {dateFolderEnabled && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Formato da Pasta</Label>
                <Select value={dateFormat} onValueChange={handleDateFormatChange}>
                  <SelectTrigger className="bg-studio-dark border-studio-electric/30 text-studio-electric">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-studio-charcoal border-studio-electric/30">
                    {dateFormats.map((format) => (
                      <SelectItem 
                        key={format.value} 
                        value={format.value}
                        className="text-studio-electric hover:bg-studio-electric/20"
                      >
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-studio-neon">
                  Pasta criada: {formatExampleDateFolder()}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Separator className="bg-studio-electric/20" />

      {/* Configurações de Divisão de Arquivos */}
      <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-studio-electric" />
            <h3 className="text-lg font-semibold text-studio-electric">Divisão Automática de Arquivos</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-split" className="text-sm font-medium text-studio-electric">
                Divisão Automática
              </Label>
              <Switch 
                id="auto-split" 
                checked={splitEnabled}
                onCheckedChange={handleSplitToggle}
                className="data-[state=checked]:bg-studio-electric"
              />
            </div>
            {splitEnabled && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Intervalo (minutos)</Label>
                <Select value={splitInterval} onValueChange={handleSplitIntervalChange}>
                  <SelectTrigger className="bg-studio-dark border-studio-electric/30 text-studio-electric">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-studio-charcoal border-studio-electric/30">
                    <SelectItem value="15" className="text-studio-electric hover:bg-studio-electric/20">15 minutos</SelectItem>
                    <SelectItem value="30" className="text-studio-electric hover:bg-studio-electric/20">30 minutos</SelectItem>
                    <SelectItem value="60" className="text-studio-electric hover:bg-studio-electric/20">1 hora</SelectItem>
                    <SelectItem value="120" className="text-studio-electric hover:bg-studio-electric/20">2 horas</SelectItem>
                    <SelectItem value="180" className="text-studio-electric hover:bg-studio-electric/20">3 horas</SelectItem>
                    <SelectItem value="360" className="text-studio-electric hover:bg-studio-electric/20">6 horas</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-studio-neon">
                  Divisão a cada: {splitInterval} minutos
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Separator className="bg-studio-electric/20" />

      {/* Configurações de Nomenclatura */}
      <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-studio-electric" />
            <h3 className="text-lg font-semibold text-studio-electric">Nomenclatura de Arquivos</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Título Personalizado (opcional)</Label>
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Ex: Sessao, Podcast, Entrevista"
                className="bg-studio-dark border-studio-electric/30 text-studio-electric"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Padrão de Nomenclatura</Label>
              <Select value={fileNamePattern} onValueChange={setFileNamePattern}>
                <SelectTrigger className="bg-studio-dark border-studio-electric/30 text-studio-electric">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-studio-charcoal border-studio-electric/30">
                  {fileNamePatterns.map((pattern) => (
                    <SelectItem 
                      key={pattern.value} 
                      value={pattern.value}
                      className="text-studio-electric hover:bg-studio-electric/20"
                    >
                      {pattern.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-studio-neon">
                Arquivo criado: {formatExampleFileName()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Separator className="bg-studio-electric/20" />

      {/* Limpeza Automática */}
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
                  Remove automaticamente arquivos mais antigos
                </p>
              </div>
              <Switch 
                checked={autoDelete}
                onCheckedChange={setAutoDelete}
                className="data-[state=checked]:bg-studio-electric"
              />
            </div>
            
            {autoDelete && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Manter arquivos por (dias)</Label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  defaultValue="30"
                  className="w-24 bg-studio-dark border-studio-electric/30 text-studio-electric"
                />
                <p className="text-xs text-studio-warning">
                  ⚠️ Arquivos excluídos não poderão ser recuperados
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Status das Configurações */}
      <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-studio-electric mb-4">Resumo das Configurações</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Pastas por Data:</span>
              <span className={`ml-2 font-semibold ${dateFolderEnabled ? 'text-studio-neon' : 'text-studio-warning'}`}>
                {dateFolderEnabled ? 'Ativado' : 'Desativado'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Divisão Automática:</span>
              <span className={`ml-2 font-semibold ${splitEnabled ? 'text-studio-neon' : 'text-studio-warning'}`}>
                {splitEnabled ? `${splitInterval}min` : 'Desativado'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Formato de Data:</span>
              <span className="ml-2 font-semibold text-studio-electric">
                {dateFormat}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Limpeza Auto:</span>
              <span className={`ml-2 font-semibold ${autoDelete ? 'text-studio-neon' : 'text-studio-warning'}`}>
                {autoDelete ? 'Ativado' : 'Desativado'}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FileManagementSettings;