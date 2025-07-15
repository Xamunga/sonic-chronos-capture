
import { toast } from "sonner";
import { logSystem } from '@/utils/logSystem';

// NOVO: Debounce utility para otimização de performance
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

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
  private noiseGateNode: AudioWorkletNode | null = null;
  private volumeCallbacks: ((left: number, right: number, peak: boolean) => void)[] = [];
  private spectrumCallbacks: ((data: number[]) => void)[] = [];
  private hasSignal = false;
  
  // NOVO: Sistema de monitoramento independente
  private monitoringStream: MediaStream | null = null;
  private monitoringContext: AudioContext | null = null;
  private monitoringAnalyser: AnalyserNode | null = null;
  
  // Configurações do Noise Gate
  private noiseSuppressionEnabled = false;
  private noiseThreshold = -35; // dB
  private noiseGateAttack = 50; // ms
  private noiseGateRelease = 200; // ms

  constructor() {
    this.loadSettings();
    // NÃO inicializar monitoramento automaticamente
    console.log('🎛️ ElectronAudioService inicializado (monitoramento sob demanda)');
  }

  private loadSettings() {
    try {
      const settings = localStorage.getItem('audioSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        
        // Validar tipos antes de usar
        this.outputFormat = typeof parsed.outputFormat === 'string' ? parsed.outputFormat : 'wav';
        this.mp3Bitrate = typeof parsed.mp3Bitrate === 'number' ? parsed.mp3Bitrate : 320;
        this.splitEnabled = typeof parsed.splitEnabled === 'boolean' ? parsed.splitEnabled : false;
        this.splitIntervalMinutes = typeof parsed.splitIntervalMinutes === 'number' ? parsed.splitIntervalMinutes : 5;
        this.dateFolderEnabled = typeof parsed.dateFolderEnabled === 'boolean' ? parsed.dateFolderEnabled : false;
        this.dateFolderFormat = typeof parsed.dateFolderFormat === 'string' ? parsed.dateFolderFormat : 'dd-mm';
        this.fileNameFormat = typeof parsed.fileNameFormat === 'string' ? parsed.fileNameFormat : 'timestamp';
        this.inputDevice = typeof parsed.inputDevice === 'string' ? parsed.inputDevice : 'default';
        this.noiseSuppressionEnabled = typeof parsed.noiseSuppressionEnabled === 'boolean' ? parsed.noiseSuppressionEnabled : false;
        this.noiseThreshold = typeof parsed.noiseThreshold === 'number' ? parsed.noiseThreshold : -35;
        this.noiseGateAttack = typeof parsed.noiseGateAttack === 'number' ? parsed.noiseGateAttack : 50;
        this.noiseGateRelease = typeof parsed.noiseGateRelease === 'number' ? parsed.noiseGateRelease : 200;
        
        console.log('✅ Configurações carregadas com validação');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações, usando padrões:', error);
      logSystem.error(`Erro ao carregar configurações: ${error}`, 'Settings');
      // Usar valores padrão em caso de erro
      this.resetToDefaults();
    }
  }

  private resetToDefaults() {
    this.outputFormat = 'wav';
    this.mp3Bitrate = 320;
    this.splitEnabled = false;
    this.splitIntervalMinutes = 5;
    this.dateFolderEnabled = false;
    this.dateFolderFormat = 'dd-mm';
    this.fileNameFormat = 'timestamp';
    this.inputDevice = 'default';
    this.noiseSuppressionEnabled = false;
    this.noiseThreshold = -35;
    this.noiseGateAttack = 50;
    this.noiseGateRelease = 200;
  }

  saveSettings() {
    try {
      const settings = {
        outputFormat: this.outputFormat,
        mp3Bitrate: this.mp3Bitrate,
        splitEnabled: this.splitEnabled,
        splitIntervalMinutes: this.splitIntervalMinutes,
        dateFolderEnabled: this.dateFolderEnabled,
        dateFolderFormat: this.dateFolderFormat,
        fileNameFormat: this.fileNameFormat,
        inputDevice: this.inputDevice, // IMPORTANTE: Incluir inputDevice
        noiseSuppressionEnabled: this.noiseSuppressionEnabled,
        noiseThreshold: this.noiseThreshold,
        noiseGateAttack: this.noiseGateAttack,
        noiseGateRelease: this.noiseGateRelease
      };
      
      localStorage.setItem('audioSettings', JSON.stringify(settings));
      console.log('✅ Configurações salvas com sucesso');
      logSystem.info('Configurações salvas', 'Settings');
      
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      logSystem.error(`Erro ao salvar configurações: ${error}`, 'Settings');
      toast.error('Erro ao salvar configurações');
    }
  }

  // MÉTODO CORRIGIDO: requestMicrophonePermission
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: this.noiseSuppressionEnabled,
          noiseSuppression: this.noiseSuppressionEnabled,
          autoGainControl: this.noiseSuppressionEnabled,
          deviceId: this.inputDevice !== 'default' ? { exact: this.inputDevice } : undefined,
          channelCount: 1, // FORÇAR MONO
          sampleRate: 44100
        }
      });
      
      // Parar stream de teste
      stream.getTracks().forEach(track => track.stop());
      
      console.log('✅ Permissão de microfone concedida');
      console.log(`🎛️ Configurações aplicadas: supressão=${this.noiseSuppressionEnabled}`);
      logSystem.info(`Permissão de microfone concedida com supressão=${this.noiseSuppressionEnabled}`, 'Audio');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      logSystem.error(`Erro ao solicitar permissão de microfone: ${error}`, 'Audio');
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

      // Inicializar monitoramento apenas ao iniciar gravação
      if (!this.monitoringContext) {
        await this.initializeMonitoring();
      }

      // Carregar configurações mais recentes antes de iniciar
      this.loadSettings();
      
      // Log para aba de logs
      logSystem.info('Iniciando gravação', 'Recording');
      logSystem.info(`Dispositivo: ${this.inputDevice || 'padrão'}`, 'Audio');

      this.recordingStartTime = Date.now();
      this.currentSplitNumber = 1;

      // Criar pasta com data se habilitado
      let finalOutputPath = outputPath;
      if (this.dateFolderEnabled) {
        const dateFolder = this.formatDateFolder();
        // Remover barras duplas e normalizar o path
        const normalizedPath = outputPath.replace(/[\\\/]+$/, '');
        finalOutputPath = `${normalizedPath}\\${dateFolder}`;
        
        console.log(`Pasta por data habilitada. Pasta base: ${normalizedPath}`);
        console.log(`Formato de data: ${this.dateFolderFormat}`);
        console.log(`Pasta de data criada: ${dateFolder}`);
        console.log(`Caminho final: ${finalOutputPath}`);
        
        await this.ensureDirectoryExists(finalOutputPath);
      } else {
        console.log(`Pasta por data desabilitada. Usando pasta base: ${outputPath}`);
        await this.ensureDirectoryExists(outputPath);
        finalOutputPath = outputPath;
      }

      this.outputPath = finalOutputPath;
      console.log(`Gravação será salva em: ${this.outputPath}`);

      // Validar dispositivo antes de usar
      const isValidDevice = await this.validateAudioDevice(this.inputDevice);
      if (!isValidDevice) {
        console.warn('⚠️ Dispositivo inválido, usando padrão');
        this.inputDevice = 'default';
      }

      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) return false;

      console.log('🎤 INICIANDO GRAVAÇÃO');

      // Usar mesmo stream do monitoramento para gravação
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: this.inputDevice ? { exact: this.inputDevice } : undefined,
          echoCancellation: this.noiseSuppressionEnabled,
          noiseSuppression: this.noiseSuppressionEnabled,
          autoGainControl: this.noiseSuppressionEnabled,
          channelCount: 1, // FORÇAR MONO para evitar mixagem
          sampleRate: 44100
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Configurar análise de áudio DURANTE A GRAVAÇÃO
      this.setupAudioAnalysis(stream);
      
      // CRÍTICO: Iniciar análise independente para VU Meters sempre ativa
      this.forceAudioAnalysisStart();

      // Usar formato de alta qualidade sem compressão desnecessária
      let mimeType = 'audio/webm;codecs=opus';
      
      // Verificar suporte e usar melhor opção disponível
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else {
        mimeType = 'audio/mp4';
      }
      
      console.log(`Usando MIME type: ${mimeType} para formato: ${this.outputFormat}`);
      
      const mediaRecorderOptions: MediaRecorderOptions = {
        mimeType: mimeType,
        audioBitsPerSecond: this.mp3Bitrate * 1000
      };
      
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
      
      console.log('📈 VU Callbacks registrados:', this.volumeCallbacks.length);
      console.log('📊 Spectrum Callbacks registrados:', this.spectrumCallbacks.length);

      // Inicializar sinal de áudio após um pequeno delay
      setTimeout(() => {
        this.forceAudioAnalysisStart();
        console.log('🎵 Análise de áudio iniciada - VU Meters e Spectrum devem estar funcionando');
      }, 500);

      // Configurar split automático se habilitado
      if (this.splitEnabled) {
        this.scheduleSplit();
      }

      console.log('🎬 Gravação iniciada com sucesso');
      logSystem.info(`Formato: MP3, ${this.sampleRate}Hz, ${this.mp3Bitrate}kbps`, 'Recording');
      toast.success('Gravação iniciada com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Erro ao iniciar gravação:', error);
      logSystem.error(`Erro ao iniciar gravação: ${error.message}`, 'Recording');
      toast.error('Erro ao iniciar gravação');
      return false;
    }
  }

  async stopRecording(): Promise<void> {
    try {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        this.isRecording = false;
        this.isPaused = false;
        this.currentSplitNumber = 1;
        
        // Limpar contexto de áudio
        this.cleanupAudioAnalysis();
        
        // IMPORTANTE: Suspender monitoramento para economizar recursos
        if (this.monitoringContext && this.monitoringContext.state === 'running') {
          await this.monitoringContext.suspend();
          console.log('⏸️ Monitoramento suspenso para economizar recursos');
        }
        
        // Zerar VU meters
        this.volumeCallbacks.forEach(callback => {
          try {
            callback(-60, -60, false);
          } catch (error) {
            console.error('❌ Erro ao zerar VU:', error);
          }
        });
        
        // Zerar spectrum analyzer
        this.spectrumCallbacks.forEach(callback => {
          try {
            callback(Array(32).fill(0));
          } catch (error) {
            console.error('❌ Erro ao zerar spectrum:', error);
          }
        });
        
        console.log('⏹️ Gravação finalizada com sucesso');
        logSystem.info('Gravação finalizada', 'Recording');
        toast.success('Gravação finalizada');
      }
    } catch (error) {
      console.error('❌ Erro ao parar gravação:', error);
    }
  }

  // MÉTODO CORRIGIDO: pauseRecording
  pauseRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.pause();
        this.isPaused = true;
        
        // NÃO parar monitoramento durante pausa
        console.log('⏸️ Gravação pausada (monitoramento continua)');
        logSystem.info('Gravação pausada', 'Recording');
        toast.info('Gravação pausada');
      } else if (this.mediaRecorder.state === 'paused') {
        this.mediaRecorder.resume();
        this.isPaused = false;
        console.log('▶️ Gravação retomada');
        logSystem.info('Gravação retomada', 'Recording');
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

        // Garantir que estamos usando o outputPath correto (já inclui a subpasta se habilitada)
        console.log(`Salvando arquivo em: ${this.outputPath}`);
        console.log(`Nome do arquivo: ${filename}`);
        
        // Normalizar path e garantir que o arquivo seja salvo no diretório correto
        const normalizedPath = this.outputPath.replace(/[\\\/]+$/, '');
        const fullPath = `${normalizedPath}\\${filename}`;
        
        console.log(`Caminho completo do arquivo: ${fullPath}`);

        try {
          await window.electronAPI.saveAudioFile(fullPath, uint8Array);
          console.log(`✅ Arquivo salvo com sucesso em: ${fullPath}`);
          logSystem.info(`Arquivo salvo: ${filename}`, 'Recording');
          toast.success(`Arquivo salvo: ${filename}`);
        } catch (error) {
          console.error('❌ Erro ao salvar via Electron API:', error);
          logSystem.error(`Erro ao salvar arquivo: ${error}`, 'Recording');
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
    const oldDevice = this.inputDevice;
    this.inputDevice = deviceId;
    this.saveSettings();
    
    logSystem.info(`Dispositivo alterado: ${oldDevice || 'padrão'} → ${deviceId}`, 'Audio');
    
    this.restartMonitoring();
    
    console.log(`🎤 Dispositivo alterado para: ${deviceId}`);
  }

  // NOVO: Validação de dispositivos de áudio
  private async validateAudioDevice(deviceId: string): Promise<boolean> {
    try {
      if (deviceId === 'default') return true;
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      
      return audioInputs.some(device => device.deviceId === deviceId);
    } catch (error) {
      console.error('❌ Erro ao validar dispositivo:', error);
      return false;
    }
  }

  setOutputFormat(format: string): void {
    this.outputFormat = format;
  }

  setSampleRate(rate: number): void {
    this.sampleRate = rate;
  }

  async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      console.log(`🔍 Verificando diretório: ${dirPath}`);
      if (window.electronAPI) {
        await window.electronAPI.ensureDirectory(dirPath);
        console.log(`✅ Diretório criado/verificado: ${dirPath}`);
      } else {
        // No navegador, apenas logar
        console.log('⚠️ Modo navegador - diretórios não podem ser criados automaticamente');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar/criar diretório:', error);
      toast.error(`Erro ao criar pasta: ${dirPath}`);
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
        baseName = `${hours}-${minutes}-${seconds}-${this.currentSplitNumber.toString().padStart(3, '0')}`;
        break;
      case 'dd-mm-hh-mm-ss-seq':
        baseName = `${day}-${month}-${hours}-${minutes}-${seconds}-${this.currentSplitNumber.toString().padStart(3, '0')}`;
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
      this.audioContext = new AudioContext({ sampleRate: 44100 });
      const source = this.audioContext.createMediaStreamSource(stream);
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.3;
      
      // NÃO conectar ao destination para evitar feedback
      source.connect(this.analyser);
      
      console.log('🎤 Contexto de áudio configurado para análise em tempo real');
      console.log('📊 Configurações AudioContext:', {
        sampleRate: this.audioContext.sampleRate,
        fftSize: this.analyser.fftSize,
        frequencyBinCount: this.analyser.frequencyBinCount
      });
      this.startAudioAnalysis();
    } catch (error) {
      console.error('❌ Erro ao configurar análise de áudio:', error);
      logSystem.error(`Erro ao configurar análise de áudio: ${error}`, 'Audio');
    }
  }

  private createNoiseProcessingChain(audioContext: AudioContext, sourceNode: AudioNode): AudioNode {
    try {
      // Filtro High-Pass para remover ruído de baixa frequência
      const highPassFilter = audioContext.createBiquadFilter();
      highPassFilter.type = 'highpass';
      highPassFilter.frequency.setValueAtTime(80, audioContext.currentTime);
      highPassFilter.Q.setValueAtTime(1, audioContext.currentTime);
      
      // Filtro Notch para remover ruído elétrico de 60Hz
      const notchFilter60Hz = audioContext.createBiquadFilter();
      notchFilter60Hz.type = 'notch';
      notchFilter60Hz.frequency.setValueAtTime(60, audioContext.currentTime);
      notchFilter60Hz.Q.setValueAtTime(10, audioContext.currentTime);
      
      // Filtro Notch para remover ruído elétrico de 50Hz (Europa)
      const notchFilter50Hz = audioContext.createBiquadFilter();
      notchFilter50Hz.type = 'notch';
      notchFilter50Hz.frequency.setValueAtTime(50, audioContext.currentTime);
      notchFilter50Hz.Q.setValueAtTime(10, audioContext.currentTime);
      
      // Conectar filtros em série
      sourceNode.connect(highPassFilter);
      highPassFilter.connect(notchFilter60Hz);
      notchFilter60Hz.connect(notchFilter50Hz);
      
      console.log(`🎛️ Cadeia de filtros criada - Threshold: ${this.noiseThreshold}dB`);
      return notchFilter50Hz;
      
    } catch (error) {
      console.error('❌ Erro ao criar filtros de ruído:', error);
      logSystem.error(`Erro ao criar filtros de supressão de ruído: ${error}`, 'Audio');
      return sourceNode; // Fallback para nó original
    }
  }

  private startAudioAnalysis(): void {
    if (!this.analyser) {
      console.error('❌ startAudioAnalysis: analyser não disponível');
      logSystem.error('Análise de áudio não pode ser iniciada - analyser indisponível', 'Audio');
      return;
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let analysisCounter = 0;

    console.log('🎵 Iniciando análise de áudio em tempo real');
    logSystem.info('Análise de áudio em tempo real iniciada', 'Audio');

    const analyze = () => {
      if (!this.analyser || !this.isRecording) return;

      try {
        this.analyser.getByteFrequencyData(dataArray);
        
        // Calcular níveis de volume em dB usando log10 (correção Manus IA)
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const average = sum / bufferLength;
        
        // Calcular dB corretamente
        const dbLevel = average > 0 ? 20 * Math.log10(average / 255) : -Infinity;
        
        // Converter dB para porcentagem para VU Meters (0-100%)
        const leftLevel = Math.max(0, Math.min(100, (dbLevel + 60) * (100 / 60))); // Normalizar -60dB a 0dB para 0-100%
        const rightLevel = Math.max(0, Math.min(100, (dbLevel + 60) * (100 / 60) + Math.random() * 2 - 1)); // Simular stereo
        const peak = leftLevel > 85 || rightLevel > 85;

        // Notificar callbacks VU Meters
        this.volumeCallbacks.forEach(callback => {
          try {
            callback(leftLevel, rightLevel, peak);
          } catch (error) {
            console.error('Erro no callback VU:', error);
          }
        });

        // Log detalhado para debug (a cada 30 execuções = ~1 segundo)
        if (analysisCounter % 30 === 0) {
          console.log(`🎵 Nível de áudio detectado: ${dbLevel.toFixed(1)}dB`);
          console.log(`🎛️ Análise: sum=${sum} avg=${average.toFixed(1)} dB=${dbLevel.toFixed(1)} L=${leftLevel.toFixed(1)}% R=${rightLevel.toFixed(1)}% callbacks=${this.volumeCallbacks.length}/${this.spectrumCallbacks.length}`);
          logSystem.info(`Análise Audio: sum=${sum} avg=${average.toFixed(1)} dB=${dbLevel.toFixed(1)} L=${leftLevel.toFixed(1)}% R=${rightLevel.toFixed(1)}% hasSignal=${this.hasSignal} callbacks=${this.volumeCallbacks.length}/${this.spectrumCallbacks.length}`, 'AudioAnalysis');
        }
        analysisCounter++;

        // Marcar que há sinal com threshold mais baixo para melhor sensibilidade
        this.hasSignal = this.isRecording && (average > 0.1 || leftLevel > 0.5 || rightLevel > 0.5);
        
        // Sempre notificar callbacks quando está gravando, mesmo com sinal baixo
        if (this.isRecording) {
          // Notificar callbacks de volume
          if (this.volumeCallbacks.length > 0) {
            this.volumeCallbacks.forEach(callback => {
              callback(leftLevel, rightLevel, peak);
            });
          } else if (analysisCounter % 120 === 0) {
            console.warn('⚠️ Nenhum callback para VU Meters registrado');
          }

          // Processar dados para spectrum analyzer com FFT (correção Manus IA)
          const spectrumData = new Array(32).fill(0);
          const binSize = Math.floor(dataArray.length / 32);
          
          for (let i = 0; i < 32; i++) {
            let sum = 0;
            for (let j = 0; j < binSize; j++) {
              sum += dataArray[i * binSize + j];
            }
            spectrumData[i] = Math.min(100, (sum / binSize / 255) * 100);
          }
          
          // Log dados de espectro para debug (menos frequente)
          if (analysisCounter % 90 === 0) {
            console.log('📊 Dados de espectro:', spectrumData.slice(0, 5));
          }
          
          // Notificar callbacks de espectro
          if (this.spectrumCallbacks.length > 0) {
            this.spectrumCallbacks.forEach(callback => {
              callback(spectrumData);
            });
          } else if (analysisCounter % 120 === 0) {
            console.warn('⚠️ Nenhum callback para Spectrum Analyzer registrado');
          }
        }

        requestAnimationFrame(analyze);
      } catch (error) {
        console.error('❌ Erro durante análise de áudio:', error);
        logSystem.error(`Erro durante análise de áudio: ${error}`, 'Audio');
      }
    };

    console.log('🔄 Iniciando loop de análise de áudio em tempo real');
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
    console.log(`📊 Callback VU Meters registrado. Total: ${this.volumeCallbacks.length}`);
    logSystem.info(`Callback VU Meters registrado. Total: ${this.volumeCallbacks.length}`, 'Audio');
  }

  onSpectrumUpdate(callback: (data: number[]) => void): void {
    this.spectrumCallbacks.push(callback);
    console.log(`📈 Callback Spectrum registrado. Total: ${this.spectrumCallbacks.length}`);
    logSystem.info(`Callback Spectrum registrado. Total: ${this.spectrumCallbacks.length}`, 'Audio');
  }

  removeVolumeCallback(callback: (left: number, right: number, peak: boolean) => void): void {
    const index = this.volumeCallbacks.indexOf(callback);
    if (index > -1) {
      this.volumeCallbacks.splice(index, 1);
      console.log(`📊 Callback VU Meters removido. Total: ${this.volumeCallbacks.length}`);
    }
  }

  removeSpectrumCallback(callback: (data: number[]) => void): void {
    const index = this.spectrumCallbacks.indexOf(callback);
    if (index > -1) {
      this.spectrumCallbacks.splice(index, 1);
      console.log(`📈 Callback Spectrum removido. Total: ${this.spectrumCallbacks.length}`);
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
    return this.isRecording && this.analyser !== null;
  }
   
  // Forçar inicialização da análise de áudio para componentes
  forceAudioAnalysisStart(): void {
    if (this.isRecording && this.audioContext && this.analyser) {
      console.log('🎵 Forçando início da análise de áudio para VU Meters e Spectrum');
      this.hasSignal = true;
      
      // Inicializar componentes com dados vazios para ativar a interface
      this.volumeCallbacks.forEach(callback => {
        callback(0, 0, false);
      });
      this.spectrumCallbacks.forEach(callback => {
        callback(Array(32).fill(0));
      });
      
      console.log('✅ VU Meters e Spectrum inicializados');
    }
  }

  // Configurações de MP3 Bitrate
  setMp3Bitrate(bitrate: number): void {
    this.mp3Bitrate = bitrate;
  }

  getMp3Bitrate(): number {
    return this.mp3Bitrate;
  }

  // MÉTODO CORRIGIDO: setNoiseSuppressionEnabled
  setNoiseSuppressionEnabled(enabled: boolean): void {
    this.noiseSuppressionEnabled = enabled;
    this.saveSettings();
    
    // CRÍTICO: Reiniciar monitoramento com nova configuração
    this.restartMonitoring();
    
    console.log(`🎛️ Supressão de ruído: ${enabled ? 'ATIVADA' : 'DESATIVADA'}`);
    
    // Log para aba de logs
    logSystem.info(`Supressão de ruído ${enabled ? 'ativada' : 'desativada'}`, 'Audio');
  }

  getNoiseSuppressionEnabled(): boolean {
    return this.noiseSuppressionEnabled;
  }

  setNoiseThreshold(threshold: number): void {
    this.noiseThreshold = threshold;
    console.log(`Threshold de ruído ajustado para: ${threshold}dB`);
    logSystem.info(`Threshold de ruído ajustado para: ${threshold}dB`, 'Audio');
  }

  getNoiseThreshold(): number {
    return this.noiseThreshold;
  }

  setNoiseGateAttack(attack: number): void {
    this.noiseGateAttack = attack;
  }

  getNoiseGateAttack(): number {
    return this.noiseGateAttack;
  }

  setNoiseGateRelease(release: number): void {
    this.noiseGateRelease = release;
  }

  getNoiseGateRelease(): number {
    return this.noiseGateRelease;
  }

  // NOVO: Sistema de monitoramento independente para VU Meters sempre ativo
  private async initializeMonitoring(): Promise<void> {
    try {
      console.log('🎯 Inicializando sistema de monitoramento independente...');
      // CRÍTICO: Limpar contextos antes de inicializar
      await this.cleanupAllAudioContexts();
      await this.startMonitoring();
    } catch (error) {
      console.error('❌ Erro ao inicializar monitoramento:', error);
      logSystem.error(`Erro ao inicializar monitoramento: ${error}`, 'Audio');
    }
  }

  // NOVO MÉTODO: Limpeza completa de contextos
  private async cleanupAllAudioContexts(): Promise<void> {
    // Parar todas as tracks do stream de monitoramento
    if (this.monitoringStream) {
      this.monitoringStream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Track de monitoramento parada');
      });
      this.monitoringStream = null;
    }
    
    // Fechar contexto de monitoramento
    if (this.monitoringContext && this.monitoringContext.state !== 'closed') {
      await this.monitoringContext.close();
      this.monitoringContext = null;
      console.log('🛑 Contexto de monitoramento fechado');
    }
    
    // Fechar contexto de gravação se existir
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
      this.audioContext = null;
      console.log('🛑 Contexto de gravação fechado');
    }
    
    this.monitoringAnalyser = null;
    this.analyser = null;
    
    console.log('✅ Todos os contextos de áudio limpos');
  }

  private async startMonitoring(): Promise<void> {
    try {
      // CRÍTICO: Limpar TODOS os contextos antes de inicializar
      await this.cleanupAllAudioContexts();
      
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: this.inputDevice ? { exact: this.inputDevice } : undefined,
          echoCancellation: this.noiseSuppressionEnabled,
          noiseSuppression: this.noiseSuppressionEnabled,
          autoGainControl: this.noiseSuppressionEnabled,
          channelCount: 1, // FORÇAR MONO para evitar mixagem
          sampleRate: 44100 // Padrão profissional
        }
      };

      // USAR MESMO STREAM para monitoramento E gravação
      this.monitoringStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Configurar contexto de áudio
      this.monitoringContext = new AudioContext({ sampleRate: 44100 });
      const source = this.monitoringContext.createMediaStreamSource(this.monitoringStream);
      
      this.monitoringAnalyser = this.monitoringContext.createAnalyser();
      this.monitoringAnalyser.fftSize = 512; // Reduzido para melhor performance
      this.monitoringAnalyser.smoothingTimeConstant = 0.3;
      
      source.connect(this.monitoringAnalyser);
      
      this.startContinuousAnalysis();
      
      console.log('✅ Sistema de monitoramento iniciado com fonte única');
      console.log(`🎯 Dispositivo: ${this.inputDevice || 'padrão'}`);
      console.log(`🎛️ Supressão: ${this.noiseSuppressionEnabled ? 'ON' : 'OFF'}`);
      logSystem.info(`Monitoramento iniciado - Dispositivo: ${this.inputDevice || 'padrão'}, Supressão: ${this.noiseSuppressionEnabled ? 'ON' : 'OFF'}`, 'Audio');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar monitoramento:', error);
      logSystem.error(`Erro ao inicializar monitoramento: ${error}`, 'Audio');
      
      // Fallback: tentar com dispositivo padrão
      if (this.inputDevice !== 'default') {
        console.log('🔄 Tentando com dispositivo padrão...');
        this.inputDevice = 'default';
        try {
          await this.startMonitoring();
        } catch (fallbackError) {
          console.error('❌ Erro no fallback:', fallbackError);
          logSystem.error(`Erro no fallback de dispositivo: ${fallbackError}`, 'Audio');
        }
      }
    }
  }

  // MÉTODO CORRIGIDO: startContinuousAnalysis
  private startContinuousAnalysis(): void {
    if (!this.monitoringAnalyser) return;

    const bufferLength = this.monitoringAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let analysisCounter = 0;

    const analyze = () => {
      if (!this.monitoringAnalyser || !this.monitoringContext) return;

      try {
        this.monitoringAnalyser.getByteFrequencyData(dataArray);
        
        // Calcular RMS para VU meters
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const normalized = dataArray[i] / 255.0;
          sum += normalized * normalized;
        }
        
        const rms = Math.sqrt(sum / bufferLength);
        
        // CORREÇÃO: Escala dB profissional (-60dB a 0dB)
        const dbLevel = rms > 0 ? Math.max(20 * Math.log10(rms), -60) : -60;
        
        // Simular stereo para compatibilidade
        const leftLevel = dbLevel;
        const rightLevel = dbLevel;
        
        // Detectar peaks (próximo a 0dB)
        const peak = dbLevel > -6;

        // Notificar callbacks para VU meters
        this.volumeCallbacks.forEach(callback => {
          try {
            callback(leftLevel, rightLevel, peak);
          } catch (error) {
            console.error('❌ Erro no callback VU:', error);
          }
        });

        // Processar dados para spectrum analyzer com FFT
        const spectrumData = new Array(32).fill(0);
        const binSize = Math.floor(dataArray.length / 32);
        
        for (let i = 0; i < 32; i++) {
          let sum = 0;
          for (let j = 0; j < binSize; j++) {
            sum += dataArray[i * binSize + j];
          }
          spectrumData[i] = Math.min(100, (sum / binSize / 255) * 100);
        }
        
        // Notificar callbacks para spectrum analyzer
        this.spectrumCallbacks.forEach(callback => {
          try {
            callback(spectrumData);
          } catch (error) {
            console.error('❌ Erro no callback spectrum:', error);
          }
        });

        // Logs com escala correta
        if (analysisCounter % 60 === 0) {
          console.log(`🎛️ Análise CORRIGIDA: L=${leftLevel.toFixed(1)}dB R=${rightLevel.toFixed(1)}dB`);
        }
        analysisCounter++;

        // Continuar análise
        if (this.monitoringContext && this.monitoringContext.state === 'running') {
          requestAnimationFrame(analyze);
        }
        
      } catch (error) {
        console.error('❌ Erro durante análise de áudio:', error);
        logSystem.error(`Erro durante análise de áudio: ${error}`, 'Audio');
        // Tentar reiniciar após erro
        setTimeout(() => {
          if (this.monitoringAnalyser) {
            analyze();
          }
        }, 1000);
      }
    };

    console.log('🔄 Iniciando loop de análise de áudio em tempo real');
    analyze();
  }

  private stopMonitoring(): void {
    if (this.monitoringStream) {
      this.monitoringStream.getTracks().forEach(track => track.stop());
      this.monitoringStream = null;
    }
    
    if (this.monitoringContext) {
      this.monitoringContext.close();
      this.monitoringContext = null;
    }
    
    this.monitoringAnalyser = null;
    console.log('🛑 Sistema de monitoramento parado');
  }

  // MÉTODO CORRIGIDO: restartMonitoring
  private async restartMonitoring(): Promise<void> {
    console.log('🔄 Reiniciando monitoramento...');
    
    // CRÍTICO: Limpar recursos antes de reiniciar
    await this.cleanupAllAudioContexts();
    
    // Aguardar um momento para garantir limpeza
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Reinicializar
    await this.startMonitoring();
  }
}

export const audioService = new ElectronAudioService();
