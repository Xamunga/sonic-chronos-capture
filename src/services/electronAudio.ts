
import { toast } from "sonner";

// Interface para funcionalidades de áudio nativas no Electron
export class ElectronAudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private isPaused = false;
  private outputPath = '';
  private inputDevice = 'default';
  private outputFormat = 'wav';
  private mp3Bitrate = 320;
  private sampleRate = 44100;
  private splitEnabled = false;
  private splitIntervalMinutes = 5;
  private dateFolderEnabled = false;
  private dateFolderFormat = 'dd-mm';
  private fileNameFormat = 'timestamp';
  private recordingStartTime = 0;
  private currentSplitNumber = 1;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private volumeCallbacks: ((left: number, right: number, peak: boolean) => void)[] = [];
  private spectrumCallbacks: ((data: number[]) => void)[] = [];
  private hasSignal = false;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    const settings = localStorage.getItem('audioSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.outputFormat = parsed.outputFormat || 'wav';
      this.mp3Bitrate = parsed.mp3Bitrate || 320;
      this.splitEnabled = parsed.splitEnabled || false;
      this.splitIntervalMinutes = parsed.splitIntervalMinutes || 5;
      this.dateFolderEnabled = parsed.dateFolderEnabled || false;
      this.dateFolderFormat = parsed.dateFolderFormat || 'dd-mm';
      this.fileNameFormat = parsed.fileNameFormat || 'timestamp';
    }
  }

  saveSettings() {
    const settings = {
      outputFormat: this.outputFormat,
      mp3Bitrate: this.mp3Bitrate,
      splitEnabled: this.splitEnabled,
      splitIntervalMinutes: this.splitIntervalMinutes,
      dateFolderEnabled: this.dateFolderEnabled,
      dateFolderFormat: this.dateFolderFormat,
      fileNameFormat: this.fileNameFormat
    };
    localStorage.setItem('audioSettings', JSON.stringify(settings));
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 2
        } 
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissão do microfone:', error);
      toast.error('Erro ao acessar o microfone. Verifique as permissões.');
      return false;
    }
  }

  async startRecording(outputPath: string): Promise<boolean> {
    try {
      if (this.isRecording) {
        toast.warning('Gravação já está em andamento');
        return false;
      }

      this.recordingStartTime = Date.now();
      this.currentSplitNumber = 1;

      // Criar pasta com data se habilitado
      let finalOutputPath = outputPath;
      if (this.dateFolderEnabled) {
        const dateFolder = this.formatDateFolder();
        // Remover barras duplas e normalizar o path
        const normalizedPath = outputPath.replace(/[\\\/]+$/, '');
        finalOutputPath = `${normalizedPath}\\${dateFolder}`;
        await this.ensureDirectoryExists(finalOutputPath);
      } else {
        await this.ensureDirectoryExists(outputPath);
        finalOutputPath = outputPath;
      }

      this.outputPath = finalOutputPath;

      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) return false;

      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: this.sampleRate,
          channelCount: 2,
          deviceId: this.inputDevice !== 'default' ? { exact: this.inputDevice } : undefined
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Configurar análise de áudio
      this.setupAudioAnalysis(stream);

      // Usar formato específico para melhor compatibilidade
      let mimeType = 'audio/webm;codecs=opus';
      let audioBitsPerSecond = undefined;
      
      if (this.outputFormat === 'wav') {
        // Para WAV, usar WebM e converter via Electron
        mimeType = 'audio/webm;codecs=opus';
      } else if (this.outputFormat === 'mp3') {
        // Para MP3, configurar bitrate específico
        mimeType = 'audio/webm;codecs=opus';
        audioBitsPerSecond = this.mp3Bitrate * 1000; // Converter kbps para bps
      }
      
      // Verificar suporte
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        console.warn('Codec opus não suportado, usando WebM padrão');
      }
      
      console.log(`Usando MIME type: ${mimeType} para formato: ${this.outputFormat}`);
      
      const mediaRecorderOptions: MediaRecorderOptions = {
        mimeType: mimeType
      };
      
      if (audioBitsPerSecond) {
        mediaRecorderOptions.audioBitsPerSecond = audioBitsPerSecond;
      }
      
      this.mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);

      this.audioChunks = [];
      this.outputPath = finalOutputPath;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.saveRecording();
      };

      this.mediaRecorder.start(1000); // Capturar dados a cada segundo
      this.isRecording = true;
      this.isPaused = false;
      
      // Inicializar sinal de áudio após um pequeno delay
      setTimeout(() => {
        this.forceAudioAnalysisStart();
      }, 500);

      // Configurar split automático se habilitado
      if (this.splitEnabled) {
        this.scheduleSplit();
      }

      console.log('Gravação iniciada - Sistema de buffer otimizado ativo');
      toast.success('Gravação iniciada com sucesso');
      return true;

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      toast.error('Erro ao iniciar gravação');
      return false;
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.isRecording = false;
      this.isPaused = false;
      this.currentSplitNumber = 1;
      
      // Limpar contexto de áudio
      this.cleanupAudioAnalysis();
      
      console.log('Gravação finalizada');
      toast.success('Gravação finalizada');
    }
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.pause();
        this.isPaused = true;
        console.log('Gravação pausada');
        toast.info('Gravação pausada');
      } else if (this.mediaRecorder.state === 'paused') {
        this.mediaRecorder.resume();
        this.isPaused = false;
        console.log('Gravação retomada');
        toast.info('Gravação retomada');
      }
    }
  }

  private async saveRecording(): Promise<void> {
    try {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Se estiver no Electron, usar a API nativa para salvar
      if (window.electronAPI) {
        const filename = this.formatFileName();

        // Normalizar path e garantir que o arquivo seja salvo no diretório correto
        const normalizedPath = this.outputPath.replace(/[\\\/]+$/, '');
        const fullPath = `${normalizedPath}\\${filename}`;

        try {
          await window.electronAPI.saveAudioFile(fullPath, uint8Array);
          console.log(`Arquivo salvo em: ${fullPath}`);
          toast.success(`Arquivo salvo: ${filename}`);
        } catch (error) {
          console.error('Erro ao salvar via Electron API:', error);
          // Fallback para download
          this.downloadAudioFile(audioBlob, filename);
        }
      } else {
        // Fallback para download no navegador
        const extension = this.outputFormat === 'wav' ? 'wav' : 
                         this.outputFormat === 'mp3' ? 'mp3' : 'webm';
        const filename = `gravacao_${Date.now()}.${extension}`;
        this.downloadAudioFile(audioBlob, filename);
      }

    } catch (error) {
      console.error('Erro ao salvar gravação:', error);
      toast.error('Erro ao salvar arquivo de áudio');
    }
  }

  private downloadAudioFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Download iniciado: ${filename}`);
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  getRecordingState(): string {
    if (!this.mediaRecorder) return 'stopped';
    return this.mediaRecorder.state;
  }

  async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Erro ao obter dispositivos de áudio:', error);
      return [];
    }
  }

  setInputDevice(deviceId: string): void {
    this.inputDevice = deviceId;
  }

  setOutputFormat(format: string): void {
    this.outputFormat = format;
  }

  setSampleRate(rate: number): void {
    this.sampleRate = rate;
  }

  async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      console.log(`Verificando diretório: ${dirPath}`);
      if (window.electronAPI) {
        await window.electronAPI.ensureDirectory(dirPath);
        console.log(`Diretório criado/verificado: ${dirPath}`);
      } else {
        // No navegador, apenas logar
        console.log('Modo navegador - diretórios não podem ser criados automaticamente');
      }
    } catch (error) {
      console.error('Erro ao verificar/criar diretório:', error);
      throw error;
    }
  }

  getInputDevice(): string {
    return this.inputDevice;
  }

  getOutputFormat(): string {
    return this.outputFormat;
  }

  getSampleRate(): number {
    return this.sampleRate;
  }

  // Configurações de split
  setSplitEnabled(enabled: boolean): void {
    this.splitEnabled = enabled;
  }

  setSplitInterval(minutes: number): void {
    this.splitIntervalMinutes = minutes;
  }

  getSplitEnabled(): boolean {
    return this.splitEnabled;
  }

  getSplitInterval(): number {
    return this.splitIntervalMinutes;
  }

  // Configurações de pasta por data
  setDateFolderEnabled(enabled: boolean): void {
    this.dateFolderEnabled = enabled;
  }

  setDateFolderFormat(format: string): void {
    this.dateFolderFormat = format;
  }

  getDateFolderEnabled(): boolean {
    return this.dateFolderEnabled;
  }

  getDateFolderFormat(): string {
    return this.dateFolderFormat;
  }

  private formatDateFolder(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString();

    switch (this.dateFolderFormat) {
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
  }

  private formatFileName(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const extension = this.outputFormat === 'wav' ? 'wav' : 
                     this.outputFormat === 'mp3' ? 'mp3' : 'webm';

    let baseName: string;
    switch (this.fileNameFormat) {
      case 'hh-mm-ss-seq':
        baseName = `${hours}${minutes}${seconds}_${this.currentSplitNumber.toString().padStart(3, '0')}`;
        break;
      case 'dd-mm-hh-mm-ss-seq':
        baseName = `${day}-${month}-${hours}${minutes}${seconds}_${this.currentSplitNumber.toString().padStart(3, '0')}`;
        break;
      case 'timestamp':
      default:
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
        baseName = this.splitEnabled && this.currentSplitNumber > 1 
          ? `gravacao_${timestamp}_parte${this.currentSplitNumber}`
          : `gravacao_${timestamp}`;
        break;
    }

    return `${baseName}.${extension}`;
  }

  private scheduleSplit(): void {
    setTimeout(() => {
      if (this.isRecording && this.splitEnabled) {
        this.performSplit();
      }
    }, this.splitIntervalMinutes * 60 * 1000);
  }

  private async performSplit(): Promise<void> {
    if (!this.isRecording || !this.mediaRecorder) return;

    try {
      // Parar gravação atual
      this.mediaRecorder.stop();
      
      // Aguardar um breve momento para processamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Incrementar número da parte
      this.currentSplitNumber++;
      
      // Reiniciar gravação com novo arquivo
      this.audioChunks = [];
      const stream = this.mediaRecorder.stream;
      
      // Recriar MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.mediaRecorder.mimeType
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.saveRecording();
      };

      this.mediaRecorder.start(1000);
      
      // Agendar próximo split
      this.scheduleSplit();
      
      toast.info(`Iniciando parte ${this.currentSplitNumber} da gravação`);
    } catch (error) {
      console.error('Erro ao fazer split:', error);
      toast.error('Erro ao dividir arquivo');
    }
  }

  // Análise de áudio em tempo real
  private setupAudioAnalysis(stream: MediaStream): void {
    try {
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      
      this.startAudioAnalysis();
    } catch (error) {
      console.error('Erro ao configurar análise de áudio:', error);
    }
  }

  private startAudioAnalysis(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!this.analyser || !this.isRecording) return;

      this.analyser.getByteFrequencyData(dataArray);
      
      // Calcular níveis de volume (simular stereo)
      const sum = dataArray.reduce((acc, val) => acc + val, 0);
      const average = sum / bufferLength;
      const leftLevel = Math.min(100, (average / 255) * 100);
      const rightLevel = Math.min(100, ((average + Math.random() * 20 - 10) / 255) * 100);
      const peak = leftLevel > 85 || rightLevel > 85;

      // Marcar que há sinal
      this.hasSignal = average > 1; // Threshold mínimo para detectar sinal
      
      // Notificar callbacks de volume
      this.volumeCallbacks.forEach(callback => {
        callback(leftLevel, rightLevel, peak);
      });

      // Converter para array para espectro (32 barras)
      const spectrumData = Array.from(dataArray)
        .slice(0, 32)
        .map(val => (val / 255) * 100);
      
      // Notificar callbacks de espectro
      this.spectrumCallbacks.forEach(callback => {
        callback(spectrumData);
      });

      requestAnimationFrame(analyze);
    };

    analyze();
  }

  private cleanupAudioAnalysis(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
  }

  // Callbacks para UI
  onVolumeUpdate(callback: (left: number, right: number, peak: boolean) => void): void {
    this.volumeCallbacks.push(callback);
  }

  onSpectrumUpdate(callback: (data: number[]) => void): void {
    this.spectrumCallbacks.push(callback);
  }

  removeVolumeCallback(callback: (left: number, right: number, peak: boolean) => void): void {
    const index = this.volumeCallbacks.indexOf(callback);
    if (index > -1) {
      this.volumeCallbacks.splice(index, 1);
    }
  }

  removeSpectrumCallback(callback: (data: number[]) => void): void {
    const index = this.spectrumCallbacks.indexOf(callback);
    if (index > -1) {
      this.spectrumCallbacks.splice(index, 1);
    }
  }

  isPausedState(): boolean {
    return this.isPaused;
  }

  // Configurações de formato de nome
  setFileNameFormat(format: string): void {
    this.fileNameFormat = format;
  }

  getFileNameFormat(): string {
    return this.fileNameFormat;
  }

  // Método para verificar se há sinal de áudio
  hasAudioSignal(): boolean {
    return this.isRecording && this.analyser !== null && this.hasSignal;
  }
  
  // Forçar inicialização da análise de áudio para componentes
  forceAudioAnalysisStart(): void {
    if (this.isRecording && this.audioContext && this.analyser) {
      this.hasSignal = true;
      // Simular sinal inicial para ativar componentes
      this.volumeCallbacks.forEach(callback => {
        callback(0, 0, false);
      });
      this.spectrumCallbacks.forEach(callback => {
        callback(Array(32).fill(0));
      });
    }
  }

  // Configurações de MP3 Bitrate
  setMp3Bitrate(bitrate: number): void {
    this.mp3Bitrate = bitrate;
  }

  getMp3Bitrate(): number {
    return this.mp3Bitrate;
  }
}

export const audioService = new ElectronAudioService();
