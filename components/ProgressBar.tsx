
import React from 'react';

interface ProgressBarProps {
    progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));

    return (
        <div className="w-full h-full rounded-full bg-slate-700 overflow-hidden relative border-4 border-slate-600">
            <div
                className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ height: `${clampedProgress}%` }}
            >
                <div className="wave"></div>
                <div className="wave"></div>
            </div>
            <style>{`
                .wave {
                    background: rgba(255, 255, 255, 0.25);
                    border-radius: 1000% 1000% 0 0;
                    position: absolute;
                    width: 200%;
                    height: 12em;
                    animation: wave 10s -3s linear infinite;
                    transform: translate3d(0, 0, 0);
                    opacity: 0.8;
                    bottom: 0;
                    left: 0;
                }
                .wave:nth-of-type(2) {
                    bottom: -1.25em;
                    animation: wave 18s linear reverse infinite;
                    opacity: 0.5;
                }
                @keyframes wave {
                    2% { transform: translateX(1); }
                    25% { transform: translateX(-25%); }
                    50% { transform: translateX(-50%); }
                    75% { transform: translateX(-25%); }
                    100% { transform: translateX(1); }
                }
            `}</style>
        </div>
    );
};
