
import { toast } from "sonner";

// Interface para funcionalidades de áudio nativas no Electron
export class ElectronAudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private outputPath = '';
  private inputDevice = 'default';
  private outputFormat = 'wav';
  private sampleRate = 44100;

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

      // Garantir que o diretório existe
      await this.ensureDirectoryExists(outputPath);

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

      // Verificar formatos suportados e usar o melhor disponível
      let mimeType = 'audio/webm;codecs=opus'; // Default mais compatível
      
      if (this.outputFormat === 'wav' && MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      } else if (this.outputFormat === 'mp3' && MediaRecorder.isTypeSupported('audio/mp3')) {
        mimeType = 'audio/mp3';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      }
      
      console.log(`Usando MIME type: ${mimeType} para formato: ${this.outputFormat}`);
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });

      this.audioChunks = [];
      this.outputPath = outputPath;

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
      console.log('Gravação finalizada');
      toast.success('Gravação finalizada');
    }
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.pause();
        console.log('Gravação pausada');
        toast.info('Gravação pausada');
      } else if (this.mediaRecorder.state === 'paused') {
        this.mediaRecorder.resume();
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
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const extension = this.outputFormat === 'wav' ? 'wav' : 
                         this.outputFormat === 'mp3' ? 'mp3' : 'webm';
        const filename = `gravacao_${timestamp}.${extension}`;
        const fullPath = this.outputPath.endsWith('\\') || this.outputPath.endsWith('/') 
          ? `${this.outputPath}${filename}` 
          : `${this.outputPath}/${filename}`;

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
}

export const audioService = new ElectronAudioService();
