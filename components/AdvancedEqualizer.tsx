import React, { useState, useEffect } from 'react';
import { Sliders, X, RotateCcw } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';

// 10-Band Professional Equalizer
interface ExtendedEQSettings {
    band60: number;    // 60 Hz (Sub-bass)
    band170: number;   // 170 Hz (Bass)
    band310: number;   // 310 Hz (Low-mids)
    band600: number;   // 600 Hz (Mids)
    band1k: number;    // 1 kHz (Mids)
    band3k: number;    // 3 kHz (Upper-mids)
    band6k: number;    // 6 kHz (Presence)
    band12k: number;   // 12 kHz (Brilliance)
    band14k: number;   // 14 kHz (Air)
    band16k: number;   // 16 kHz (Air)
    preamp: number;
}

// Professional EQ Presets (10-band)
const EQ_PRESETS: Record<string, ExtendedEQSettings> = {
    flat: { band60: 0, band170: 0, band310: 0, band600: 0, band1k: 0, band3k: 0, band6k: 0, band12k: 0, band14k: 0, band16k: 0, preamp: 0 },
    rock: { band60: 5, band170: 4, band310: -1, band600: -2, band1k: -1, band3k: 2, band6k: 3, band12k: 4, band14k: 4, band16k: 3, preamp: 2 },
    pop: { band60: -1, band170: 0, band310: 0, band600: 2, band1k: 3, band3k: 3, band6k: 2, band12k: 1, band14k: 2, band16k: 2, preamp: 1 },
    jazz: { band60: 2, band170: 3, band310: 2, band600: 1, band1k: 0, band3k: 2, band6k: 2, band12k: 3, band14k: 3, band16k: 2, preamp: 0 },
    classical: { band60: -2, band170: -1, band310: 0, band600: 0, band1k: -1, band3k: 1, band6k: 2, band12k: 3, band14k: 4, band16k: 4, preamp: 0 },
    electronic: { band60: 6, band170: 5, band310: 1, band600: -1, band1k: 0, band3k: 1, band6k: 3, band12k: 4, band14k: 5, band16k: 5, preamp: 1 },
    bassBoost: { band60: 9, band170: 8, band310: 6, band600: 3, band1k: 0, band3k: 0, band6k: 1, band12k: 2, band14k: 2, band16k: 2, preamp: 0 },
    vocal: { band60: -3, band170: -2, band310: 1, band600: 3, band1k: 5, band3k: 4, band6k: 3, band12k: 2, band14k: 1, band16k: 0, preamp: 1 },
    acoustic: { band60: 2, band170: 2, band310: 1, band600: 2, band1k: 2, band3k: 1, band6k: 2, band12k: 3, band14k: 3, band16k: 2, preamp: 0 },
    bassReduced: { band60: -6, band170: -5, band310: -3, band600: -1, band1k: 0, band3k: 1, band6k: 2, band12k: 2, band14k: 2, band16k: 1, preamp: 0 }
};

const PRESET_LABELS: Record<string, string> = {
    flat: 'Flat',
    rock: 'Rock',
    pop: 'Pop',
    jazz: 'Jazz',
    classical: 'Classical',
    electronic: 'Electronic',
    bassBoost: 'Bass Boost',
    vocal: 'Vocal / Podcast',
    acoustic: 'Acoustic',
    bassReduced: 'Bass Reduced'
};

const BAND_CONFIG = [
    { key: 'band60', label: '60', freq: 60 },
    { key: 'band170', label: '170', freq: 170 },
    { key: 'band310', label: '310', freq: 310 },
    { key: 'band600', label: '600', freq: 600 },
    { key: 'band1k', label: '1k', freq: 1000 },
    { key: 'band3k', label: '3k', freq: 3000 },
    { key: 'band6k', label: '6k', freq: 6000 },
    { key: 'band12k', label: '12k', freq: 12000 },
    { key: 'band14k', label: '14k', freq: 14000 },
    { key: 'band16k', label: '16k', freq: 16000 }
];

interface AdvancedEqualizerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AdvancedEqualizer: React.FC<AdvancedEqualizerProps> = ({ isOpen, onClose }) => {
    const { setEqualizer } = useMusic();

    // Load from localStorage or use flat preset
    const loadSettings = (): ExtendedEQSettings => {
        const saved = localStorage.getItem('swaz_eq_settings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return EQ_PRESETS.flat;
            }
        }
        return EQ_PRESETS.flat;
    };

    const [eqSettings, setEqSettings] = useState<ExtendedEQSettings>(loadSettings);
    const [activePreset, setActivePreset] = useState<string>('flat');

    // Save to localStorage whenever settings change
    useEffect(() => {
        localStorage.setItem('swaz_eq_settings', JSON.stringify(eqSettings));

        // Apply to Web Audio API (simplified 3-band mapping for existing backend)
        // Maps 10 bands to bass/mid/treble
        const bass = (eqSettings.band60 + eqSettings.band170 + eqSettings.band310) / 3;
        const mid = (eqSettings.band600 + eqSettings.band1k + eqSettings.band3k) / 3;
        const treble = (eqSettings.band6k + eqSettings.band12k + eqSettings.band14k + eqSettings.band16k) / 4;

        setEqualizer({ bass, mid, treble, preamp: eqSettings.preamp });
    }, [eqSettings]);

    if (!isOpen) return null;

    const handleChange = (key: keyof ExtendedEQSettings, value: number) => {
        setEqSettings({ ...eqSettings, [key]: value });
        setActivePreset('custom');
    };

    const applyPreset = (presetKey: string) => {
        setEqSettings(EQ_PRESETS[presetKey]);
        setActivePreset(presetKey);
    };

    const resetToFlat = () => {
        applyPreset('flat');
    };

    return (
        <div className="fixed bottom-full right-0 mb-4 bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in z-50 max-h-[80vh] overflow-auto">
            <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-accent">
                        <Sliders className="w-5 h-5" />
                        <h3 className="font-black text-lg">Advanced Equalizer</h3>
                    </div>
                    <span className="text-xs text-secondary bg-accent/10 px-2 py-1 rounded-full">10 Band</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={resetToFlat}
                        className="p-2 hover:bg-background rounded-full text-secondary hover:text-primary transition-colors"
                        title="Reset to Flat"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-background rounded-full text-secondary hover:text-primary transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Preset Selector */}
                <div>
                    <label className="text-xs font-medium text-secondary mb-2 block">Preset</label>
                    <select
                        value={activePreset}
                        onChange={(e) => applyPreset(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-primary font-medium focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none cursor-pointer hover:border-accent/50 transition-all"
                    >
                        {Object.entries(PRESET_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                        <option value="custom">Custom</option>
                    </select>
                </div>

                {/* Preamp */}
                <div>
                    <div className="flex justify-between text-xs font-medium text-secondary mb-2">
                        <span>Preamp</span>
                        <span className="font-mono text-accent">
                            {eqSettings.preamp > 0 ? '+' : ''}{eqSettings.preamp} dB
                        </span>
                    </div>
                    <input
                        type="range"
                        min="-12"
                        max="12"
                        step="1"
                        value={eqSettings.preamp}
                        onChange={(e) => handleChange('preamp', parseFloat(e.target.value))}
                        className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                </div>

                {/* 10-Band EQ */}
                <div>
                    <div className="text-xs font-medium text-secondary mb-3">Frequency Bands</div>
                    <div className="grid grid-cols-5 lg:grid-cols-10 gap-3">
                        {BAND_CONFIG.map((band) => (
                            <div key={band.key} className="flex flex-col items-center gap-2">
                                {/* Vertical Slider */}
                                <div className="h-32 w-10 relative bg-background rounded-full overflow-hidden flex justify-center shadow-inner">
                                    <input
                                        type="range"
                                        min="-12"
                                        max="12"
                                        step="1"
                                        value={eqSettings[band.key as keyof ExtendedEQSettings]}
                                        onChange={(e) => handleChange(band.key as keyof ExtendedEQSettings, parseFloat(e.target.value))}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 w-32 h-10 opacity-0 cursor-pointer z-10"
                                    />
                                    {/* Visual Fill */}
                                    <div
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-accent to-accent/50 transition-all duration-100"
                                        style={{
                                            height: `${((eqSettings[band.key as keyof ExtendedEQSettings] as number + 12) / 24) * 100}%`
                                        }}
                                    />
                                    {/* Center Line */}
                                    <div className="absolute top-1/2 w-full h-px bg-border -translate-y-1/2" />
                                </div>

                                {/* Label */}
                                <div className="text-center">
                                    <div className="text-[10px] font-bold text-primary">{band.label}</div>
                                    <div className="text-[9px] text-muted">Hz</div>
                                    <div className="text-[10px] text-accent font-mono mt-0.5">
                                        {eqSettings[band.key as keyof ExtendedEQSettings] > 0 ? '+' : ''}
                                        {eqSettings[band.key as keyof ExtendedEQSettings]}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Usage Hint */}
                <div className="text-xs text-secondary bg-background/50 rounded-xl p-3 border border-border">
                    <strong className="text-primary">💡 Tip:</strong> EQ changes apply in real-time. Use presets as starting points, then fine-tune to your taste.
                </div>
            </div>
        </div>
    );
};
