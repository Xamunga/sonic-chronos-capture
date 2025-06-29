
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Monitor } from 'lucide-react';

const RecordingControls = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setIsPaused(false);
      console.log('Recording started');
    } else {
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      console.log('Recording stopped');
    }
  };

  const handlePause = () => {
    if (isRecording) {
      setIsPaused(!isPaused);
      console.log(isPaused ? 'Recording resumed' : 'Recording paused');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-studio-electric mb-4">Recording Controls</h3>
        
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Button
            onClick={handleRecord}
            className={`pro-button w-16 h-16 rounded-full ${
              isRecording 
                ? 'bg-studio-warning hover:bg-studio-warning/80 recording-pulse animate-pulse-record' 
                : 'bg-studio-neon hover:bg-studio-neon/80'
            }`}
          >
            {isRecording ? (
              <Monitor className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-studio-dark" />
            )}
          </Button>
          
          <Button
            onClick={handlePause}
            disabled={!isRecording}
            className="pro-button w-12 h-12 rounded-full bg-studio-electric hover:bg-studio-electric/80 disabled:opacity-30"
          >
            <Pause className="w-4 h-4 text-studio-dark" />
          </Button>
        </div>

        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-studio-electric mb-2">
            {formatTime(recordingTime)}
          </div>
          <div className="text-sm text-muted-foreground">
            {isRecording ? (isPaused ? 'PAUSED' : 'RECORDING') : 'READY'}
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
      </div>
    </Card>
  );
};

export default RecordingControls;
