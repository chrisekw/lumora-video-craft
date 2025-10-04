import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingAnimationProps {
  stage: string;
  progress: number;
  message?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  stage, 
  progress, 
  message = "Generating your video..." 
}) => {
  const stages = [
    { key: 'analyzing', label: 'Analyzing content', icon: '🔍' },
    { key: 'generating', label: 'Generating video', icon: '🎬' },
    { key: 'rendering', label: 'Rendering frames', icon: '🎨' },
    { key: 'processing', label: 'Processing audio', icon: '🎵' },
    { key: 'finalizing', label: 'Finalizing video', icon: '✨' },
  ];

  const currentStageIndex = stages.findIndex(s => s.key === stage);
  const currentStage = stages[currentStageIndex] || stages[0];

  return (
    <Card className="shadow-elegant w-full max-w-2xl mx-auto">
      <CardContent className="flex flex-col items-center justify-center min-h-[500px] space-y-8 p-8">
        {/* Animated particles */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary rounded-full opacity-60"
                style={{
                  animation: `spin 3s linear infinite`,
                  animationDelay: `${i * 0.375}s`,
                  transform: `rotate(${i * 45}deg) translateY(-40px)`,
                }}
              />
            ))}
          </div>
          
          {/* Central icon */}
          <div className="relative z-10 w-20 h-20 bg-background border-2 border-primary rounded-full flex items-center justify-center text-3xl animate-pulse">
            {currentStage.icon}
          </div>
        </div>

        {/* Stage indicators */}
        <div className="flex flex-wrap justify-center gap-4">
          {stages.map((stageItem, index) => (
            <div key={stageItem.key} className="flex flex-col items-center space-y-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                  index <= currentStageIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < currentStageIndex ? '✓' : index + 1}
              </div>
              <span className={`text-xs transition-colors duration-300 text-center ${
                index === currentStageIndex ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {stageItem.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{currentStage.label}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Message */}
        <p className="text-center text-muted-foreground max-w-md">
          {message}
        </p>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg) translateY(-40px); }
            to { transform: rotate(360deg) translateY(-40px); }
          }
        `}</style>
      </CardContent>
    </Card>
  );
};

export default LoadingAnimation;