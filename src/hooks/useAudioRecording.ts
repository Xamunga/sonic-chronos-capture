import { useState, useEffect, useCallback } from 'react';
import { audioService } from '@/services/electronAudio';

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  // Sincronizar estados com o audioService
  useEffect(() => {
    const syncStates = () => {
      setIsRecording(audioService.isCurrentlyRecording());
      setIsPaused(audioService.isPausedState());
    };

    // Verificar estados a cada segundo
    const interval = setInterval(syncStates, 500); // Mais responsivo
    syncStates(); // Verificação inicial

    return () => clearInterval(interval);
  }, []);

  // Timer de gravação
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Carregar dispositivos de áudio
  const loadDevices = useCallback(async () => {
    try {
      const audioDevices = await audioService.getAudioDevices();
      setDevices(audioDevices);
      console.log('Dispositivos carregados:', audioDevices);
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRecording,
    isPaused,
    recordingTime,
    devices,
    formatTime,
    setRecordingTime,
    loadDevices
  };
};