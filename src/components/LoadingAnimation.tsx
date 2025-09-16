import React from 'react';
import { Progress } from '@/components/ui/progress';

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
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 p-8">
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
      <div className="flex space-x-4">
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
            <span className={`text-xs transition-colors duration-300 ${
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

      {/* Floating video icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-20 animate-float"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          >
            {['🎬', '🎥', '📹', '🎞️', '🎦', '📺'][i]}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg) translateY(-40px); }
          to { transform: rotate(360deg) translateY(-40px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;