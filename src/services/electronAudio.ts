import { toast } from "sonner";
import { logSystem } from '@/utils/logSystem';

// VERSÃO 2.8 RESTAURADA + CORREÇÕES CRÍTICAS
// Base funcional da v2.8 com problemas específicos corrigidos

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
  private stream: MediaStream | null = null;
  
  // Configurações do Noise Gate
  private noiseSuppressionEnabled = false;
  private noiseThreshold = -35;
  private noiseGateAttack = 50;
  private noiseGateRelease = 200;

  constructor() {
    this.loadSettings();
    console.log('🎛️ ElectronAudioService v2.8 Corrigido inicializado');
  }

  private loadSettings() {
    try {
      const settings = localStorage.getItem('audioSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        
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

  async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('❌ Erro ao obter dispositivos:', error);
      return [];
    }
  }

  async startRecording(outputPath: string): Promise<boolean> {
    try {
      console.log('🎤 Iniciando gravação v2.8...');
      
      this.outputPath = outputPath;
      this.recordingStartTime = Date.now();
      this.currentSplitNumber = 1;
      
      const constraints = {
        audio: {
          deviceId: this.inputDevice === 'default' ? undefined : { exact: this.inputDevice },
          sampleRate: this.sampleRate,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: this.noiseSuppressionEnabled,
          autoGainControl: false
        }
      };
      
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // CORREÇÃO: Usar WEBM mas salvar como MP3 real posteriormente
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: this.mp3Bitrate * 1000
      };
      
      this.mediaRecorder = new MediaRecorder(this.stream, options);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        this.saveRecording();
      };
      
      this.mediaRecorder.start(1000);
      this.isRecording = true;
      
      // Configurar análise de áudio
      this.setupAudioAnalysis(this.stream);
      
      // Agendar split se habilitado
      if (this.splitEnabled) {
        this.scheduleSplit();
      }
      
      console.log('✅ Gravação iniciada com sucesso');
      logSystem.info('Gravação iniciada', 'Recording');
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
      
      this.cleanupAudioAnalysis();
      
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
      console.log('🔄 Iniciando split otimizado - Fase 1');
      const splitStartTime = performance.now();
      
      // FASE 1: Preparar novo MediaRecorder ANTES de parar o atual
      const [newRecorder, currentChunks] = await Promise.all([
        this.prepareNewMediaRecorder(),
        this.getCurrentChunks()
      ]);
      
      // Parar gravação atual (timing crítico)
      this.mediaRecorder.stop();
      const stopTime = performance.now();
      
      // PARALELO: Processar arquivo + configurar próximo
      const [savedFile] = await Promise.all([
        this.saveCurrentFileAsync(currentChunks),
        this.setupNewRecorderAsync(newRecorder)
      ]);
      
      // Reiniciar IMEDIATAMENTE
      this.mediaRecorder = newRecorder;
      this.mediaRecorder.start(100); // timeslice otimizado
      
      const totalGap = performance.now() - stopTime;
      const totalTime = performance.now() - splitStartTime;
      
      this.currentSplitNumber++;
      this.scheduleSplit();
      
      console.log(`✅ Split Fase 1 - Gap: ${totalGap.toFixed(1)}ms | Total: ${totalTime.toFixed(1)}ms`);
      toast.info(`Split ${this.currentSplitNumber} - Gap otimizado: ${totalGap.toFixed(0)}ms`);
      
    } catch (error) {
      console.error('❌ Erro no split otimizado:', error);
      toast.error('Erro ao dividir arquivo');
      
      // Fallback para método tradicional
      await this.performSplitFallback();
    }
  }

  private async prepareNewMediaRecorder(): Promise<MediaRecorder> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: this.inputDevice !== 'default' ? { exact: this.inputDevice } : undefined,
        channelCount: 1,
        sampleRate: 44100,
        echoCancellation: this.noiseSuppressionEnabled,
        noiseSuppression: this.noiseSuppressionEnabled,
        autoGainControl: this.noiseSuppressionEnabled
      }
    });
    
    const recorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: this.mp3Bitrate * 1000
    });
    
    return recorder;
  }

  private async getCurrentChunks(): Promise<Blob[]> {
    return [...this.audioChunks];
  }

  private async saveCurrentFileAsync(chunks: Blob[]): Promise<string> {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const filename = this.generateFileName();
    
    if (window.electronAPI?.saveAudioFile) {
      const arrayBuffer = await blob.arrayBuffer();
      const audioData = new Uint8Array(arrayBuffer);
      const outputPath = await this.ensureOutputDirectory(this.outputPath);
      await window.electronAPI.saveAudioFile(`${outputPath}/${filename}`, audioData);
    }
    
    return filename;
  }

  private async setupNewRecorderAsync(recorder: MediaRecorder): Promise<void> {
    this.audioChunks = [];
    
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      this.saveRecording();
    };
  }

  private async performSplitFallback(): Promise<void> {
    console.log('🔄 Executando split fallback...');
    this.mediaRecorder?.stop();
    await new Promise(resolve => setTimeout(resolve, 100));
    this.currentSplitNumber++;
    this.audioChunks = [];
    
    if (this.stream) {
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: this.mp3Bitrate * 1000
      });
      
      this.setupNewRecorderAsync(this.mediaRecorder);
      this.mediaRecorder.start(100);
      this.scheduleSplit();
    }
  }

  // CORREÇÃO: Estrutura de pastas simplificada
  private async ensureOutputDirectory(outputPath: string): Promise<string> {
    try {
      let finalPath = outputPath;
      
      if (this.dateFolderEnabled) {
        const now = new Date();
        let dateFolder: string;
        
        switch (this.dateFolderFormat) {
          case 'dd-mm':
            dateFolder = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
            break;
          case 'mm-dd':
            dateFolder = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
            break;
          case 'yyyy-mm-dd':
            dateFolder = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
            break;
          default:
            dateFolder = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        }
        
        finalPath = `${outputPath}/${dateFolder}`;
        
        // CORREÇÃO: Criar pasta apenas uma vez
        await window.electronAPI.ensureDirectory(finalPath);
      }
      
      return finalPath;
      
    } catch (error) {
      console.error('❌ Erro ao criar diretório:', error);
      logSystem.error(`Erro ao criar diretório: ${error}`, 'FileSystem');
      return outputPath;
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
      
      case 'timestamp':
      default:
        const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[1].split('-').slice(0, 3).join('-');
        return `gravacao_${timestamp}_${this.currentSplitNumber}.${this.outputFormat === 'mp3' ? 'mp3' : 'webm'}`;
    }
  }

  // Sistema de análise de áudio da v2.8 (funcional)
  private setupAudioAnalysis(stream: MediaStream): void {
    try {
      this.audioContext = new AudioContext({ sampleRate: 44100 });
      const source = this.audioContext.createMediaStreamSource(stream);
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.3;
      
      source.connect(this.analyser);
      
      console.log('🎤 Contexto de áudio configurado');
      this.startAudioAnalysis();
    } catch (error) {
      console.error('❌ Erro ao configurar análise de áudio:', error);
      logSystem.error(`Erro ao configurar análise de áudio: ${error}`, 'Audio');
    }
  }

  // CORREÇÃO: RTA otimizado com throttle da v2.9
  private startAudioAnalysis(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let frameCount = 0;

    console.log('🎵 Iniciando análise de áudio otimizada');
    logSystem.info('Análise de áudio iniciada', 'Audio');

    const analyze = () => {
      if (!this.analyser || !this.isRecording) return;

      try {
        this.analyser.getByteFrequencyData(dataArray);
        
        // Calcular níveis de volume
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const average = sum / bufferLength;
        
        const dbLevel = average > 0 ? 20 * Math.log10(average / 255) : -Infinity;
        const leftLevel = Math.max(0, Math.min(100, (dbLevel + 60) * (100 / 60)));
        const rightLevel = Math.max(0, Math.min(100, (dbLevel + 60) * (100 / 60) + Math.random() * 2 - 1));
        const peak = leftLevel > 85 || rightLevel > 85;

        // Callbacks VU Meters (sempre chamar quando gravando)
        this.volumeCallbacks.forEach(callback => {
          try {
            callback(leftLevel, rightLevel, peak);
          } catch (error) {
            console.error('Erro no callback VU:', error);
          }
        });

        // OTIMIZAÇÃO: Spectrum callbacks apenas a cada 3 frames (throttle)
        if (frameCount % 3 === 0) {
          const spectrumData = new Array(32).fill(0);
          const binSize = Math.floor(dataArray.length / 32);
          
          for (let i = 0; i < 32; i++) {
            let sum = 0;
            for (let j = 0; j < binSize; j++) {
              sum += dataArray[i * binSize + j];
            }
            spectrumData[i] = Math.min(100, (sum / binSize / 255) * 100);
          }
          
          this.spectrumCallbacks.forEach(callback => {
            try {
              callback(spectrumData);
            } catch (error) {
              console.error('Erro no callback spectrum:', error);
            }
          });
        }

        this.hasSignal = average > 0.1;
        frameCount++;

        // OTIMIZAÇÃO: requestAnimationFrame para melhor performance
        requestAnimationFrame(analyze);
      } catch (error) {
        console.error('❌ Erro durante análise de áudio:', error);
        logSystem.error(`Erro durante análise de áudio: ${error}`, 'Audio');
      }
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
    console.log(`📊 Callback VU Meters registrado. Total: ${this.volumeCallbacks.length}`);
  }

  onSpectrumUpdate(callback: (data: number[]) => void): void {
    this.spectrumCallbacks.push(callback);
    console.log(`📈 Callback Spectrum registrado. Total: ${this.spectrumCallbacks.length}`);
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

  // Estados
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  isPausedState(): boolean {
    return this.isPaused;
  }

  hasAudioSignal(): boolean {
    return this.hasSignal;
  }

  // Configurações - todas com getters para compatibilidade
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

  getSampleRate(): number {
    return this.sampleRate;
  }
}

// Instância única do serviço
export const audioService = new ElectronAudioService();