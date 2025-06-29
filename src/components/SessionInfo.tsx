
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SessionInfo = () => {
  const [sessionName, setSessionName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [outputPath, setOutputPath] = useState('C:\\Recordings\\');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    // Generate default session name
    const now = new Date();
    const defaultName = `Recording_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    setSessionName(defaultName);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="bg-gradient-to-br from-studio-charcoal to-studio-slate border-studio-electric/30">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-studio-electric mb-4">Session Information</h3>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-studio-dark rounded-lg border border-studio-electric/20">
            <div className="text-2xl font-mono font-bold text-studio-electric">
              {currentDate.toLocaleTimeString()}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {currentDate.toLocaleDateString()}
            </div>
          </div>

          <div>
            <Label htmlFor="session-name" className="text-sm font-medium text-studio-electric">
              Session Name
            </Label>
            <Input
              id="session-name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="mt-2 bg-studio-dark border-studio-electric/30 text-studio-electric"
              placeholder="Enter session name"
            />
          </div>

          <div>
            <Label htmlFor="output-path" className="text-sm font-medium text-studio-electric">
              Output Directory
            </Label>
            <div className="flex mt-2 space-x-2">
              <Input
                id="output-path"
                value={outputPath}
                onChange={(e) => setOutputPath(e.target.value)}
                className="flex-1 bg-studio-dark border-studio-electric/30 text-studio-electric"
                placeholder="Output directory path"
              />
              <Button className="pro-button bg-studio-electric hover:bg-studio-electric/80 text-studio-dark">
                Browse
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-studio-electric/20">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Files Created:</span>
                <span className="text-studio-neon ml-2 font-mono">0</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Size:</span>
                <span className="text-studio-neon ml-2 font-mono">0 MB</span>
              </div>
              <div>
                <span className="text-muted-foreground">Free Space:</span>
                <span className="text-studio-neon ml-2 font-mono">1.2 TB</span>
              </div>
              <div>
                <span className="text-muted-foreground">Split Every:</span>
                <span className="text-studio-neon ml-2 font-mono">1 Hour</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SessionInfo;
