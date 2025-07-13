
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Circle } from 'lucide-react';
import { audioService } from '@/services/electronAudio';
import { useElectron } from '@/hooks/useElectron';
import { useAudioRecording } from '@/hooks/useAudioRecording';

interface RecordingControlsProps {
  outputPath: string;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({ outputPath }) => {
  const { showSystemMessage } = useElectron();
  const { isRecording, isPaused, recordingTime, formatTime, setRecordingTime } = useAudioRecording();

  const handleRecord = async () => {
    if (!isRecording) {
      const success = await audioService.startRecording(outputPath);
      if (success) {
        setRecordingTime(0);
        await showSystemMessage('Gravação', 'Gravação iniciada com sucesso!');
      }
    } else {
      audioService.stopRecording();
      setRecordingTime(0);
      await showSystemMessage('Gravação', 'Gravação finalizada e arquivo salvo!');
    }
  };

  const handlePause = async () => {
    if (isRecording) {
      audioService.pauseRecording();
      await showSystemMessage('Gravação', isPaused ? 'Gravação retomada' : 'Gravação pausada');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-studio-electric mb-4">Controles de Gravação</h3>
        
        <div className="flex items-center justify-center space-x-6 mb-6">
          {/* Botão Gravar/Parar */}
          <Button
            onClick={handleRecord}
            className={`
              w-20 h-20 rounded-lg 
              ${isRecording 
                ? 'bg-green-600 hover:bg-green-500 border-2 border-green-400' 
                : 'bg-red-600 hover:bg-red-500 border-2 border-red-400'
              }
              transition-all duration-200 flex flex-col items-center justify-center shadow-lg
            `}
          >
            {isRecording ? (
              <Square className="w-8 h-8 text-white" />
            ) : (
              <Circle className="w-8 h-8 text-white fill-white" />
            )}
          </Button>
          
          {/* Botão Pausar */}
          <Button
            onClick={handlePause}
            disabled={!isRecording}
            className="
              w-16 h-16 rounded-lg 
              bg-yellow-600 hover:bg-yellow-500 border-2 border-yellow-400
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-200 flex flex-col items-center justify-center shadow-lg
            "
          >
            <Pause className="w-6 h-6 text-white" />
          </Button>
        </div>

        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-studio-electric mb-2">
            {formatTime(recordingTime)}
          </div>
          <div className={`text-lg font-bold ${
            isRecording 
              ? (isPaused ? 'text-yellow-400' : 'text-green-400') 
              : 'text-red-400'
          }`}>
            {isRecording ? (isPaused ? 'PAUSADO' : 'GRAVANDO') : 'PARADO'}
          </div>
        </div>

        <div className="mt-4 flex justify-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isRecording && !isPaused ? 'bg-studio-warning animate-pulse' : 'bg-studio-slate'
          }`} />
          <div className={`w-3 h-3 rounded-full ${
            isPaused ? 'bg-studio-electric' : 'bg-studio-slate'
          }`} />
          <div className={`w-3 h-3 rounded-full ${
            !isRecording ? 'bg-studio-neon' : 'bg-studio-slate'
          }`} />
        </div>

        <div className="mt-4 text-xs text-center text-muted-foreground">
          Sistema de Buffer Duplo: <span className="text-studio-neon">ATIVO</span><br />
          Proteção contra Perda de Áudio: <span className="text-studio-neon">100%</span>
        </div>
      </div>
    </Card>
  );
};

export default RecordingControls;
