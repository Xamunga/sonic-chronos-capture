import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FolderOpen, FileText, Clock, Trash2 } from 'lucide-react';
import { audioService } from '@/services/electronAudio';
import { toast } from 'sonner';

const FileManagementSettings = () => {
  const [outputPath, setOutputPath] = useState('C:\\Gravacoes\\');
  const [dateFormat, setDateFormat] = useState('dd-mm-yyyy');
  const [dateFolderEnabled, setDateFolderEnabled] = useState(false);
  const [autoDelete, setAutoDelete] = useState(false);
  const [autoDeleteDays, setAutoDeleteDays] = useState(30);
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitInterval, setSplitInterval] = useState('5');
  const [fileNamePattern, setFileNamePattern] = useState('timestamp');
  const [fileNameFormat, setFileNameFormat] = useState('timestamp');
  const [customTitle, setCustomTitle] = useState('');

  // Sincronizar com audioService na inicialização
  useEffect(() => {
    const loadSettings = () => {
      setDateFolderEnabled(audioService.getDateFolderEnabled());
      setDateFormat(audioService.getDateFolderFormat());
      setSplitEnabled(audioService.getSplitEnabled());
      setSplitInterval(audioService.getSplitInterval().toString());
      setFileNamePattern(audioService.getFileNameFormat());
      
      // Carregar configurações de limpeza automática
      const savedSettings = localStorage.getItem('audioSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setAutoDelete(parsed.autoDelete || false);
        setAutoDeleteDays(parsed.autoDeleteDays || 30);
        setOutputPath(parsed.outputPath || 'C:\\Gravacoes\\');
        setCustomTitle(parsed.customTitle || '');
      }
    };
    
    loadSettings();
  }, []);

  const dateFormats = [
    { value: 'dd-mm', label: 'DD-MM (31-12)', example: '31-12' },
    { value: 'dd-mm-yyyy', label: 'DD-MM-AAAA (31-12-2024)', example: '31-12-2024' },
    { value: 'mm-dd-yyyy', label: 'MM-DD-AAAA (12-31-2024)', example: '12-31-2024' },
    { value: 'yyyy-mm-dd', label: 'AAAA-MM-DD (2024-12-31)', example: '2024-12-31' },
    { value: 'yyyy/mm/dd', label: 'AAAA/MM/DD (2024/12/31)', example: '2024/12/31' }
  ];

  const fileNamePatterns = [
    { value: 'timestamp', label: 'Data/Hora (2024-12-31_14-30-15)', example: 'gravacao_2024-12-31_14-30-15.wav' },
    { value: 'hh-mm-ss-seq', label: 'hh-mm-ss-sequência (150520_001)', example: '150520_001.wav' },
    { value: 'dd-mm-hh-mm-ss-seq', label: 'dd-mm-hh-mm-ss-sequência (10-07-150520_001)', example: '10-07-150520_001.wav' },
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
      case 'dd-mm':
        return `${day}-${month}`;
      case 'dd-mm-yyyy':
        return `${day}-${month}-${year}`;
      case 'mm-dd-yyyy':
        return `${month}-${day}-${year}`;
      case 'yyyy-mm-dd':
        return `${year}-${month}-${day}`;
      case 'yyyy/mm/dd':
        return `${year}/${month}/${day}`;
      default:
        return `${day}-${month}`;
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

  const handleAutoDeleteToggle = (enabled: boolean) => {
    setAutoDelete(enabled);
    toast.success(enabled ? 'Limpeza automática ativada' : 'Limpeza automática desativada');
  };

  const handleAutoDeleteDaysChange = (days: string) => {
    const numDays = parseInt(days);
    setAutoDeleteDays(numDays);
  };

  const handleOutputPathChange = (path: string) => {
    setOutputPath(path);
  };

  const handleSaveSettings = () => {
    try {
      // Salvar todas as configurações no audioService e localStorage
      const settings = {
        outputPath,
        dateFolderEnabled,
        dateFolderFormat: dateFormat,
        splitEnabled,
        splitIntervalMinutes: parseInt(splitInterval),
        fileNameFormat: fileNamePattern,
        customTitle,
        autoDelete,
        autoDeleteDays,
        outputFormat: audioService.getOutputFormat(),
        mp3Bitrate: audioService.getMp3Bitrate(),
        sampleRate: audioService.getSampleRate()
      };
      
      localStorage.setItem('audioSettings', JSON.stringify(settings));
      audioService.saveSettings();
      
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const selectDirectory = async () => {
    if (window.electronAPI && window.electronAPI.selectDirectory) {
      try {
        const result = await window.electronAPI.selectDirectory();
        if (typeof result === 'string' && result) {
          setOutputPath(result);
          toast.success(`Diretório selecionado: ${result}`);
        }
      } catch (error) {
        console.error('Erro ao selecionar diretório:', error);
        toast.error('Erro ao selecionar diretório');
      }
    } else {
      toast.warning('Seleção de diretório disponível apenas no modo desktop');
    }
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
            {/* Seletor de Diretório Principal */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-studio-electric">Diretório Principal</Label>
              <div className="flex space-x-2">
                <Input
                  value={outputPath}
                  onChange={(e) => handleOutputPathChange(e.target.value)}
                  placeholder="C:\Gravacoes\"
                  className="flex-1 bg-muted/50 border-studio-electric font-bold"
                />
                <Button onClick={selectDirectory} variant="outline" size="sm">
                  <FolderOpen className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-white">
                Pasta onde os arquivos serão salvos
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="date-folders" className="text-sm font-medium text-studio-electric">
                Organizar por Data
              </Label>
              <Switch 
                id="date-folders" 
                checked={dateFolderEnabled}
                onCheckedChange={handleDateFolderToggle}
              />
            </div>
            {dateFolderEnabled && (
              <div className="space-y-2">
                <Label className="text-xs text-studio-electric">Formato da Pasta</Label>
                <Select value={dateFormat} onValueChange={handleDateFormatChange}>
                  <SelectTrigger className="bg-muted/50 border-studio-electric font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateFormats.map((format) => (
                      <SelectItem 
                        key={format.value} 
                        value={format.value}
                      >
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-white">
                  Pasta criada: {formatExampleDateFolder()}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Separator />

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
              />
            </div>
            {splitEnabled && (
              <div className="space-y-2">
                <Label className="text-xs text-studio-electric">Intervalo (minutos)</Label>
                <Select value={splitInterval} onValueChange={handleSplitIntervalChange}>
                  <SelectTrigger className="bg-muted/50 border-studio-electric font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 minuto</SelectItem>
                    <SelectItem value="5">5 minutos</SelectItem>
                    <SelectItem value="10">10 minutos</SelectItem>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-white">
                  Divisão a cada: {splitInterval} minutos
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Separator />

      {/* Configurações de Nomenclatura */}
      <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-studio-electric" />
            <h3 className="text-lg font-semibold text-studio-electric">Nomenclatura de Arquivos</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-studio-electric">Título Personalizado (opcional)</Label>
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Ex: Sessao, Podcast, Entrevista"
                className="bg-muted/50 border-studio-electric font-bold"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-studio-electric">Padrão de Nomenclatura</Label>
              <Select value={fileNamePattern} onValueChange={(value) => {
                setFileNamePattern(value);
                audioService.setFileNameFormat(value);
              }}>
                <SelectTrigger className="bg-muted/50 border-studio-electric font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fileNamePatterns.map((pattern) => (
                    <SelectItem 
                      key={pattern.value} 
                      value={pattern.value}
                    >
                      {pattern.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-white">
                Arquivo criado: {formatExampleFileName()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Separator />

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
                <p className="text-xs text-white">
                  Remove automaticamente arquivos mais antigos
                </p>
              </div>
              <Switch 
                checked={autoDelete}
                onCheckedChange={handleAutoDeleteToggle}
              />
            </div>
            
            {autoDelete && (
              <div className="space-y-2">
                <Label className="text-xs text-studio-electric">Manter arquivos por (dias)</Label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={autoDeleteDays}
                  onChange={(e) => handleAutoDeleteDaysChange(e.target.value)}
                  className="w-24 bg-muted/50 border-studio-electric font-bold"
                />
                <p className="text-xs text-destructive">
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
              <span className="text-white">Pastas por Data:</span>
              <span className={`ml-2 font-bold ${dateFolderEnabled ? 'text-studio-electric' : 'text-destructive'}`}>
                {dateFolderEnabled ? 'Ativado' : 'Desativado'}
              </span>
            </div>
            <div>
              <span className="text-white">Divisão Automática:</span>
              <span className={`ml-2 font-bold ${splitEnabled ? 'text-studio-electric' : 'text-destructive'}`}>
                {splitEnabled ? `${splitInterval}min` : 'Desativado'}
              </span>
            </div>
            <div>
              <span className="text-white">Formato de Data:</span>
              <span className="ml-2 font-bold text-studio-electric">
                {dateFormat}
              </span>
            </div>
            <div>
              <span className="text-white">Limpeza Auto:</span>
              <span className={`ml-2 font-bold ${autoDelete ? 'text-studio-electric' : 'text-destructive'}`}>
                {autoDelete ? 'Ativado' : 'Desativado'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Botão Salvar */}
      <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
        <div className="p-6 text-center">
          <Button onClick={handleSaveSettings} className="w-full">
            Salvar Configurações
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Todas as configurações serão salvas permanentemente
          </p>
        </div>
      </Card>
    </div>
  );
};

export default FileManagementSettings;