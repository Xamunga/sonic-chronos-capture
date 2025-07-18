import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FolderOpen, FileText, Clock, Trash2, Music } from 'lucide-react';
import { audioService } from '@/services/electronAudio';
import { toast } from 'sonner';
import { logSystem } from '@/utils/logSystem';
import { DateFolderFormat, FileNameFormat, MP3MetadataSettings } from '@/types/audioTypes';

const FileManagementSettings = () => {
  const [outputPath, setOutputPath] = useState('C:\\Gravacoes\\');
  const [dateFormat, setDateFormat] = useState<DateFolderFormat>('dd-mm');
  const [dateFolderEnabled, setDateFolderEnabled] = useState(false);
  const [autoDelete, setAutoDelete] = useState(false);
  const [autoDeleteDays, setAutoDeleteDays] = useState(30);
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitInterval, setSplitInterval] = useState('5');
  const [fileNamePattern, setFileNamePattern] = useState<FileNameFormat>('hh-mm-ss-seq');
  const [customTitle, setCustomTitle] = useState('');
  const [mp3Metadata, setMp3Metadata] = useState<MP3MetadataSettings>({
    title: '',
    artist: 'ALES - Setor de Sonorização',
    album: 'Gravador Real Time Pro',
    year: '',
    genre: 'Speech',
    comment: ''
  });

  // Sincronizar com audioService na inicialização
  useEffect(() => {
    const loadSettings = () => {
      setDateFolderEnabled(audioService.getDateFolderEnabled());
      setDateFormat(audioService.getDateFolderFormat());
      setSplitEnabled(audioService.getSplitEnabled());
      setSplitInterval(audioService.getSplitInterval().toString());
      setFileNamePattern(audioService.getFileNameFormat());
      setMp3Metadata(audioService.getMp3Metadata());
      
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
    { value: 'mm-dd-yyyy', label: 'MM-DD-YYYY (12-31-2025)', example: '12-31-2025' },
    { value: 'ddmmyy', label: 'DDMMYY (311225)', example: '311225' },
  ];

  const fileNamePatterns = [
    { value: 'hh-mm-ss-seq', label: 'Atual (14-25-33-001.mp3)', example: '14-25-33-001.mp3' },
    { value: 'ddmmyy_hhmmss', label: 'Sistema Antigo (311225_142533.mp3)', example: '311225_142533.mp3' },
  ];

  const formatExampleFileName = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString().slice(-2);
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    switch (fileNamePattern) {
      case 'hh-mm-ss-seq':
        return `${hours}-${minutes}-${seconds}-001.mp3`;
      case 'ddmmyy_hhmmss':
        return `${day}${month}${year}_${hours}${minutes}${seconds}.mp3`;
      default:
        return `${hours}-${minutes}-${seconds}-001.mp3`;
    }
  };

  const formatExampleDateFolder = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString();
    const yearShort = year.slice(-2);

    switch (dateFormat) {
      case 'dd-mm':
        return `${day}-${month}`;
      case 'mm-dd-yyyy':
        return `${month}-${day}-${year}`;
      case 'ddmmyy':
        return `${day}${month}${yearShort}`;
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

  const handleDateFormatChange = (value: string) => {
    const format = value as DateFolderFormat;
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

  const handleFileNameFormatChange = (value: string) => {
    const format = value as FileNameFormat;
    setFileNamePattern(format);
    audioService.setFileNameFormat(format);
    toast.success('Formato de arquivo atualizado');
  };

  const handleMetadataChange = (newMetadata: MP3MetadataSettings) => {
    setMp3Metadata(newMetadata);
    audioService.setMp3Metadata(newMetadata);
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
        sampleRate: audioService.getSampleRate(),
        mp3Metadata
      };
      
      localStorage.setItem('audioSettings', JSON.stringify(settings));
      audioService.saveSettings();
      
      toast.success('Configurações salvas com sucesso!');
      logSystem.info('Configurações de arquivos salvas', 'Files');
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
            <h3 className="text-lg font-semibold text-studio-electric">Formatos de Arquivo e Pasta</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-studio-electric mb-2 block">
                Formato do Nome do Arquivo
              </Label>
              <Select value={fileNamePattern} onValueChange={handleFileNameFormatChange}>
                <SelectTrigger className="bg-muted/50 border-studio-electric font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fileNamePatterns.map((pattern) => (
                    <SelectItem key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-white mt-1">
                Exemplo: {formatExampleFileName()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Separator />

      {/* Metadados MP3 */}
      <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Music className="w-5 h-5 text-studio-electric" />
            <h3 className="text-lg font-semibold text-studio-electric">Metadados MP3</h3>
          </div>
          <p className="text-sm text-white mb-4">
            Configure os metadados que serão incluídos nos arquivos MP3. 
            Deixe em branco para usar valores automáticos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Título */}
            <div>
              <Label className="text-sm font-medium text-studio-electric mb-2 block">
                Título
              </Label>
              <Input
                type="text"
                value={mp3Metadata.title}
                onChange={(e) => handleMetadataChange({...mp3Metadata, title: e.target.value})}
                placeholder="Deixe vazio para usar nome do arquivo"
                className="bg-muted/50 border-studio-electric"
              />
              <p className="text-xs text-white mt-1">
                Vazio = "Gravação 170725_025340"
              </p>
            </div>

            {/* Artista */}
            <div>
              <Label className="text-sm font-medium text-studio-electric mb-2 block">
                Artista
              </Label>
              <Input
                type="text"
                value={mp3Metadata.artist}
                onChange={(e) => handleMetadataChange({...mp3Metadata, artist: e.target.value})}
                placeholder="Ex: ALES - Setor de Sonorização"
                className="bg-muted/50 border-studio-electric"
              />
            </div>

            {/* Álbum */}
            <div>
              <Label className="text-sm font-medium text-studio-electric mb-2 block">
                Álbum
              </Label>
              <Input
                type="text"
                value={mp3Metadata.album}
                onChange={(e) => handleMetadataChange({...mp3Metadata, album: e.target.value})}
                placeholder="Ex: Gravador Real Time Pro"
                className="bg-muted/50 border-studio-electric"
              />
            </div>

            {/* Ano */}
            <div>
              <Label className="text-sm font-medium text-studio-electric mb-2 block">
                Ano
              </Label>
              <Input
                type="number"
                value={mp3Metadata.year}
                onChange={(e) => handleMetadataChange({...mp3Metadata, year: e.target.value})}
                placeholder="Deixe vazio para usar ano atual"
                min="1900"
                max="2100"
                className="bg-muted/50 border-studio-electric"
              />
              <p className="text-xs text-white mt-1">
                Vazio = {new Date().getFullYear()}
              </p>
            </div>

            {/* Gênero */}
            <div>
              <Label className="text-sm font-medium text-studio-electric mb-2 block">
                Gênero
              </Label>
              <Select
                value={mp3Metadata.genre}
                onValueChange={(value) => handleMetadataChange({...mp3Metadata, genre: value})}
              >
                <SelectTrigger className="bg-muted/50 border-studio-electric">
                  <SelectValue placeholder="Selecione um gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  <SelectItem value="Speech">Speech (Fala)</SelectItem>
                  <SelectItem value="Podcast">Podcast</SelectItem>
                  <SelectItem value="Interview">Interview (Entrevista)</SelectItem>
                  <SelectItem value="Meeting">Meeting (Reunião)</SelectItem>
                  <SelectItem value="Conference">Conference (Conferência)</SelectItem>
                  <SelectItem value="Lecture">Lecture (Palestra)</SelectItem>
                  <SelectItem value="Other">Other (Outro)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Comentário */}
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-studio-electric mb-2 block">
                Comentário
              </Label>
              <Textarea
                value={mp3Metadata.comment}
                onChange={(e) => handleMetadataChange({...mp3Metadata, comment: e.target.value})}
                placeholder="Deixe vazio para usar data/hora automática"
                rows={3}
                className="bg-muted/50 border-studio-electric"
              />
              <p className="text-xs text-white mt-1">
                Vazio = "Gravado em 17/07/2025 02:53:40 - 320kbps"
              </p>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex space-x-3 mt-4">
            <Button
              onClick={() => handleMetadataChange({
                title: '',
                artist: 'ALES - Setor de Sonorização',
                album: 'Gravador Real Time Pro',
                year: '',
                genre: 'Speech',
                comment: ''
              })}
              variant="outline"
              size="sm"
            >
              Restaurar Padrões
            </Button>
            
            <Button
              onClick={() => handleMetadataChange({
                title: '',
                artist: '',
                album: '',
                year: '',
                genre: '',
                comment: ''
              })}
              variant="outline"
              size="sm"
            >
              Limpar Todos
            </Button>
          </div>

          {/* Preview dos metadados */}
          <div className="mt-4 p-3 bg-muted/20 rounded-md">
            <h4 className="text-sm font-medium text-studio-electric mb-2">
              Preview dos Metadados:
            </h4>
            <div className="text-xs text-white space-y-1">
              <div><strong>Título:</strong> {mp3Metadata.title || 'Gravação 170725_025340'}</div>
              <div><strong>Artista:</strong> {mp3Metadata.artist || 'Não definido'}</div>
              <div><strong>Álbum:</strong> {mp3Metadata.album || 'Não definido'}</div>
              <div><strong>Ano:</strong> {mp3Metadata.year || new Date().getFullYear()}</div>
              <div><strong>Gênero:</strong> {mp3Metadata.genre || 'Não definido'}</div>
              <div><strong>Comentário:</strong> {mp3Metadata.comment || 'Gravado em [data/hora] - [qualidade]kbps'}</div>
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
              <span className="text-white">Formato de Arquivo:</span>
              <span className="ml-2 font-bold text-studio-electric">
                {fileNamePattern === 'hh-mm-ss-seq' ? 'Atual' : 'Sistema Antigo'}
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
          <Button onClick={handleSaveSettings} className="w-full font-bold">
            Salvar Configurações
          </Button>
          <p className="text-xs text-white mt-2">
            Todas as configurações serão salvas permanentemente
          </p>
        </div>
      </Card>
    </div>
  );
};

export default FileManagementSettings;