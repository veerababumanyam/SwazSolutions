
import React from 'react';
import { Sliders, X } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';

interface EqualizerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Equalizer: React.FC<EqualizerProps> = ({ isOpen, onClose }) => {
    const { equalizer, setEqualizer } = useMusic();

    if (!isOpen) return null;

    const handleChange = (key: keyof typeof equalizer, value: number) => {
        setEqualizer({ ...equalizer, [key]: value });
    };

    return (
        <div className="absolute bottom-full right-0 mb-4 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl w-80 animate-scale-in z-50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-accent">
                    <Sliders className="w-5 h-5" />
                    <h3 className="font-bold">Equalizer</h3>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-background rounded-full text-secondary hover:text-primary">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Preamp */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-secondary">
                        <span>Preamp</span>
                        <span>{equalizer.preamp > 0 ? '+' : ''}{equalizer.preamp} dB</span>
                    </div>
                    <input
                        type="range" min="-12" max="12" step="1"
                        value={equalizer.preamp}
                        onChange={(e) => handleChange('preamp', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-background rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
                    />
                </div>

                {/* Bands */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Bass', key: 'bass', min: -12, max: 12 },
                        { label: 'Mid', key: 'mid', min: -12, max: 12 },
                        { label: 'Treble', key: 'treble', min: -12, max: 12 },
                    ].map((band) => (
                        <div key={band.key} className="flex flex-col items-center gap-3">
                            <div className="h-32 relative w-8 bg-background rounded-full overflow-hidden flex justify-center">
                                <input
                                    type="range"
                                    min={band.min} max={band.max} step="1"
                                    value={equalizer[band.key as keyof typeof equalizer]}
                                    onChange={(e) => handleChange(band.key as any, parseFloat(e.target.value))}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 w-32 h-8 opacity-0 cursor-pointer z-10"
                                />
                                {/* Visual Indicator */}
                                <div
                                    className="absolute bottom-0 w-full bg-accent/20 transition-all duration-100"
                                    style={{ height: `${((equalizer[band.key as keyof typeof equalizer] + 12) / 24) * 100}%` }}
                                />
                                <div
                                    className="absolute bottom-0 w-1 bg-accent transition-all duration-100 rounded-t-full"
                                    style={{ height: `${((equalizer[band.key as keyof typeof equalizer] + 12) / 24) * 100}%` }}
                                />
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-bold text-primary">{band.label}</div>
                                <div className="text-[10px] text-secondary mt-0.5">
                                    {equalizer[band.key as keyof typeof equalizer] > 0 ? '+' : ''}
                                    {equalizer[band.key as keyof typeof equalizer]}dB
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
