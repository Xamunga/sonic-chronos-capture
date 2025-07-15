import { toast } from "sonner";
import { logSystem } from '@/utils/logSystem';

// VERSÃO 3.0 - BASE ESTÁVEL SIMPLIFICADA
// Implementação baseada no plano Manus para correção crítica dos problemas da v2.9

export class ElectronAudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private isPaused = false;
  private outputPath = '';
  private inputDevice = 'default';
  private outputFormat = 'wav';
  private mp3Bitrate = 128;
  private splitEnabled = false;
  private splitIntervalMinutes = 5;
  private dateFolderEnabled = false;
  private dateFolderFormat = 'dd-mm';
  private fileNameFormat = 'hh-mm-ss-seq';
  private recordingStartTime = 0;
  private currentSplitNumber = 1;
  private stream: MediaStream | null = null;
  
  // Sistema básico de análise
  private monitoringContext: AudioContext | null = null;
  private monitoringAnalyser: AnalyserNode | null = null;
  private volumeCallbacks: ((left: number, right: number, peakL: boolean, peakR: boolean) => void)[] = [];
  
  // Configurações do Noise Gate
  private noiseSuppressionEnabled = false;
  private noiseThreshold = -35;
  private noiseGateAttack = 50;
  private noiseGateRelease = 200;

  constructor() {
    this.loadSettings();
    console.log('🎛️ ElectronAudioService v3.0 inicializado (modo básico estável)');
  }

  private loadSettings() {
    try {
      const settings = localStorage.getItem('audioSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        
        this.outputFormat = typeof parsed.outputFormat === 'string' ? parsed.outputFormat : 'wav';
        this.mp3Bitrate = typeof parsed.mp3Bitrate === 'number' ? parsed.mp3Bitrate : 128;
        this.splitEnabled = typeof parsed.splitEnabled === 'boolean' ? parsed.splitEnabled : false;
        this.splitIntervalMinutes = typeof parsed.splitIntervalMinutes === 'number' ? parsed.splitIntervalMinutes : 5;
        this.dateFolderEnabled = typeof parsed.dateFolderEnabled === 'boolean' ? parsed.dateFolderEnabled : false;
        this.dateFolderFormat = typeof parsed.dateFolderFormat === 'string' ? parsed.dateFolderFormat : 'dd-mm';
        this.fileNameFormat = typeof parsed.fileNameFormat === 'string' ? parsed.fileNameFormat : 'hh-mm-ss-seq';
        this.inputDevice = typeof parsed.inputDevice === 'string' ? parsed.inputDevice : 'default';
        this.noiseSuppressionEnabled = typeof parsed.noiseSuppressionEnabled === 'boolean' ? parsed.noiseSuppressionEnabled : false;
        this.noiseThreshold = typeof parsed.noiseThreshold === 'number' ? parsed.noiseThreshold : -35;
        this.noiseGateAttack = typeof parsed.noiseGateAttack === 'number' ? parsed.noiseGateAttack : 50;
        this.noiseGateRelease = typeof parsed.noiseGateRelease === 'number' ? parsed.noiseGateRelease : 200;
        
        console.log('✅ Configurações carregadas');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      logSystem.error(`Erro ao carregar configurações: ${error}`, 'Settings');
    }
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
        inputDevice: this.inputDevice,
        noiseSuppressionEnabled: this.noiseSuppressionEnabled,
        noiseThreshold: this.noiseThreshold,
        noiseGateAttack: this.noiseGateAttack,
        noiseGateRelease: this.noiseGateRelease
      };
      
      localStorage.setItem('audioSettings', JSON.stringify(settings));
      console.log('✅ Configurações salvas');
      logSystem.info('Configurações salvas', 'Settings');
      
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      logSystem.error(`Erro ao salvar configurações: ${error}`, 'Settings');
      toast.error('Erro ao salvar configurações');
    }
  }

  // CORREÇÃO 1: startRecording SIMPLIFICADO (Plano Manus)
  async startRecording(outputPath: string): Promise<boolean> {
    try {
      // SIMPLIFICAR - apenas inicialização básica
      this.outputPath = outputPath;
      this.recordingStartTime = Date.now();
      this.currentSplitNumber = 1;
      
      // CONFIGURAÇÃO BÁSICA DO MEDIARECORDER
      const constraints = {
        audio: {
          deviceId: this.inputDevice === 'default' ? undefined : { exact: this.inputDevice },
          sampleRate: 44100, // FIXO para estabilidade
          channelCount: 1,    // MONO para simplicidade
          echoCancellation: false,
          noiseSuppression: this.noiseSuppressionEnabled,
          autoGainControl: false
        }
      };
      
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // CONFIGURAÇÃO SIMPLES DO MEDIARECORDER
      const options = {
        mimeType: 'audio/webm;codecs=opus', // MANTER WebM por enquanto
        audioBitsPerSecond: this.mp3Bitrate * 1000
      };
      
      this.mediaRecorder = new MediaRecorder(this.stream, options);
      
      // EVENTOS BÁSICOS APENAS
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        this.saveRecording();
      };
      
      // INICIAR GRAVAÇÃO
      this.mediaRecorder.start();
      this.isRecording = true;
      
      // Configurar VU meters básicos
      this.setupBasicMonitoring();
      
      console.log('✅ Gravação iniciada (modo básico v3.0)');
      logSystem.info('Gravação iniciada em modo básico', 'Recording');
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao iniciar gravação:', error);
      logSystem.error(`Erro ao iniciar gravação: ${error}`, 'Recording');
      toast.error('Erro ao iniciar gravação');
      return false;
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.isPaused = false;
      
      // Cleanup básico
      if (this.monitoringContext) {
        this.monitoringContext.close();
        this.monitoringContext = null;
        this.monitoringAnalyser = null;
      }
      
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      
      console.log('✅ Gravação parada');
      logSystem.info('Gravação parada', 'Recording');
    }
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      if (this.isPaused) {
        this.mediaRecorder.resume();
        this.isPaused = false;
        console.log('▶️ Gravação retomada');
      } else {
        this.mediaRecorder.pause();
        this.isPaused = true;
        console.log('⏸️ Gravação pausada');
      }
    }
  }

  // CORREÇÃO 2: ensureOutputDirectory SIMPLIFICADO (Plano Manus)
  private async ensureOutputDirectory(outputPath: string): Promise<string> {
    try {
      let finalPath = outputPath;
      
      // APENAS se pasta por data estiver habilitada
      if (this.dateFolderEnabled) {
        const now = new Date();
        
        // FORMATO FIXO E SIMPLES
        const dateFolder = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        
        finalPath = `${outputPath}/${dateFolder}`;
        
        // CRIAR PASTA APENAS UMA VEZ
        await window.electronAPI.ensureDirectory(finalPath);
      }
      
      return finalPath;
      
    } catch (error) {
      console.error('❌ Erro ao criar diretório:', error);
      logSystem.error(`Erro ao criar diretório: ${error}`, 'FileSystem');
      return outputPath; // FALLBACK para pasta original
    }
  }

  private async saveRecording(): Promise<void> {
    if (this.audioChunks.length === 0) {
      console.warn('⚠️ Nenhum dado de áudio para salvar');
      return;
    }

    try {
      const finalOutputPath = await this.ensureOutputDirectory(this.outputPath);
      const filename = this.generateFileName();
      const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      console.log(`💾 Salvando arquivo: ${filename} (${(blob.size / 1024 / 1024).toFixed(2)}MB)`);
      
      // Converter Blob para Uint8Array
      const arrayBuffer = await blob.arrayBuffer();
      const audioData = new Uint8Array(arrayBuffer);
      
      await window.electronAPI.saveAudioFile(`${finalOutputPath}/${filename}`, audioData);
      
      this.audioChunks = [];
      
      console.log('✅ Arquivo salvo com sucesso');
      logSystem.info(`Arquivo salvo: ${filename}`, 'Recording');
      
    } catch (error) {
      console.error('❌ Erro ao salvar gravação:', error);
      logSystem.error(`Erro ao salvar gravação: ${error}`, 'Recording');
      toast.error('Erro ao salvar arquivo de áudio');
    }
  }

  private generateFileName(): string {
    const now = new Date();
    
    switch (this.fileNameFormat) {
      case 'hh-mm-ss-seq':
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const seq = this.currentSplitNumber.toString().padStart(3, '0');
        return `${hours}-${minutes}-${seconds}-${seq}.${this.outputFormat === 'mp3' ? 'mp3' : 'webm'}`;
      
      default:
        const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[1].split('-').slice(0, 3).join('-');
        return `gravacao_${timestamp}_${this.currentSplitNumber}.${this.outputFormat === 'mp3' ? 'mp3' : 'webm'}`;
    }
  }

  // CORREÇÃO 3: VU Meters SIMPLIFICADO (Plano Manus)
  private setupBasicMonitoring(): void {
    if (!this.stream) return;
    
    try {
      this.monitoringContext = new AudioContext();
      const source = this.monitoringContext.createMediaStreamSource(this.stream);
      
      this.monitoringAnalyser = this.monitoringContext.createAnalyser();
      this.monitoringAnalyser.fftSize = 256;
      this.monitoringAnalyser.smoothingTimeConstant = 0.3;
      
      source.connect(this.monitoringAnalyser);
      
      this.startAnalysisLoop();
      
      console.log('✅ Monitoramento básico configurado');
      
    } catch (error) {
      console.error('❌ Erro ao configurar monitoramento:', error);
      logSystem.error(`Erro ao configurar monitoramento: ${error}`, 'Audio');
    }
  }

  // SIMPLIFICAR análise - remover callbacks complexos
  private startAnalysisLoop(): void {
    if (!this.monitoringAnalyser || !this.isRecording) return;
    
    const analyze = () => {
      // VERIFICAR se ainda está gravando
      if (!this.isRecording || !this.monitoringAnalyser) {
        return; // PARAR se não estiver gravando
      }
      
      try {
        const bufferLength = this.monitoringAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        this.monitoringAnalyser.getByteFrequencyData(dataArray);
        
        // CÁLCULO SIMPLES DE VOLUME
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const volume = (average / 255) * 100;
        
        // CALLBACK SIMPLES
        if (this.volumeCallbacks.length > 0) {
          this.volumeCallbacks.forEach(callback => {
            try {
              callback(volume, volume, false, false); // L, R, peakL, peakR
            } catch (error) {
              console.error('❌ Erro no callback de volume:', error);
            }
          });
        }
        
        // CONTINUAR APENAS SE GRAVANDO
        if (this.isRecording) {
          setTimeout(() => analyze(), 100); // 10 FPS fixo
        }
        
      } catch (error) {
        console.error('❌ Erro na análise de áudio:', error);
      }
    };
    
    analyze();
  }

  // Métodos públicos básicos
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  isPausedState(): boolean {
    return this.isPaused;
  }

  hasAudioSignal(): boolean {
    return this.isRecording;
  }

  // Configurações
  setInputDevice(device: string): void {
    this.inputDevice = device;
    this.saveSettings();
  }

  getInputDevice(): string {
    return this.inputDevice;
  }

  setOutputFormat(format: string): void {
    this.outputFormat = format;
    this.saveSettings();
  }

  getOutputFormat(): string {
    return this.outputFormat;
  }

  setMp3Bitrate(bitrate: number): void {
    this.mp3Bitrate = bitrate;
    this.saveSettings();
  }

  getMp3Bitrate(): number {
    return this.mp3Bitrate;
  }

  setSplitEnabled(enabled: boolean): void {
    this.splitEnabled = enabled;
    this.saveSettings();
  }

  isSplitEnabled(): boolean {
    return this.splitEnabled;
  }

  getSplitEnabled(): boolean {
    return this.splitEnabled;
  }

  setSplitInterval(minutes: number): void {
    this.splitIntervalMinutes = minutes;
    this.saveSettings();
  }

  getSplitInterval(): number {
    return this.splitIntervalMinutes;
  }

  setDateFolderEnabled(enabled: boolean): void {
    this.dateFolderEnabled = enabled;
    this.saveSettings();
  }

  isDateFolderEnabled(): boolean {
    return this.dateFolderEnabled;
  }

  getDateFolderEnabled(): boolean {
    return this.dateFolderEnabled;
  }

  setDateFolderFormat(format: string): void {
    this.dateFolderFormat = format;
    this.saveSettings();
  }

  getDateFolderFormat(): string {
    return this.dateFolderFormat;
  }

  setFileNameFormat(format: string): void {
    this.fileNameFormat = format;
    this.saveSettings();
  }

  getFileNameFormat(): string {
    return this.fileNameFormat;
  }

  setNoiseSuppressionEnabled(enabled: boolean): void {
    this.noiseSuppressionEnabled = enabled;
    this.saveSettings();
  }

  isNoiseSuppressionEnabled(): boolean {
    return this.noiseSuppressionEnabled;
  }

  getNoiseSuppressionEnabled(): boolean {
    return this.noiseSuppressionEnabled;
  }

  setNoiseThreshold(threshold: number): void {
    this.noiseThreshold = threshold;
    this.saveSettings();
  }

  getNoiseThreshold(): number {
    return this.noiseThreshold;
  }

  setNoiseGateAttack(attack: number): void {
    this.noiseGateAttack = attack;
    this.saveSettings();
  }

  getNoiseGateAttack(): number {
    return this.noiseGateAttack;
  }

  setNoiseGateRelease(release: number): void {
    this.noiseGateRelease = release;
    this.saveSettings();
  }

  getNoiseGateRelease(): number {
    return this.noiseGateRelease;
  }

  // Callbacks básicos
  onVolumeUpdate(callback: (left: number, right: number, peakL: boolean, peakR: boolean) => void): void {
    this.volumeCallbacks.push(callback);
    console.log(`📊 Callback VU Meters registrado. Total: ${this.volumeCallbacks.length}`);
  }

  removeVolumeCallback(callback: (left: number, right: number, peakL: boolean, peakR: boolean) => void): void {
    const index = this.volumeCallbacks.indexOf(callback);
    if (index > -1) {
      this.volumeCallbacks.splice(index, 1);
      console.log(`📊 Callback VU Meters removido. Total: ${this.volumeCallbacks.length}`);
    }
  }

  // Método para obter dispositivos de áudio
  async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('❌ Erro ao obter dispositivos:', error);
      return [];
    }
  }

  // Método para solicitar permissão do microfone
  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: this.noiseSuppressionEnabled,
          noiseSuppression: this.noiseSuppressionEnabled,
          autoGainControl: this.noiseSuppressionEnabled,
          deviceId: this.inputDevice !== 'default' ? { exact: this.inputDevice } : undefined,
          channelCount: 1,
          sampleRate: 44100
        }
      });
      
      stream.getTracks().forEach(track => track.stop());
      
      console.log('✅ Permissão de microfone concedida');
      logSystem.info('Permissão de microfone concedida', 'Audio');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      logSystem.error(`Erro ao solicitar permissão de microfone: ${error}`, 'Audio');
      toast.error('Erro ao acessar o microfone. Verifique as permissões.');
      return false;
    }
  }

  // Métodos temporários para compatibilidade com componentes existentes
  onSpectrumUpdate(callback: (data: number[]) => void): void {
    // Implementação básica - apenas para evitar erros
    console.log('⚠️ Spectrum Analyzer temporariamente desabilitado na v3.0');
  }

  removeSpectrumCallback(callback: (data: number[]) => void): void {
    // Implementação básica - apenas para evitar erros
  }

  getSampleRate(): number {
    return 44100; // Valor fixo para v3.0
  }
}

// Instância única do serviço
export const audioService = new ElectronAudioService();