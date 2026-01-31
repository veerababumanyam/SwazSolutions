import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { getPreferences } from '../services/preferencesApi';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [duration, setDuration] = useState(3000); // Default 3 seconds
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Load notification preferences
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const preferences = await getPreferences();
                setDuration(preferences.notifications.duration);
                setSoundEnabled(preferences.notifications.sound);
            } catch (error) {
                console.error('Failed to load notification preferences:', error);
                // Use defaults if loading fails
            }
        };

        loadPreferences();
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        // Play sound if enabled
        if (soundEnabled) {
            try {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                // Brief beep sound
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            } catch (error) {
                // Silently fail if audio context is not available
            }
        }

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, [duration, soundEnabled]);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border animate-slide-up
                            ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
                            ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
                            ${toast.type === 'info' ? 'bg-surface border-border text-primary' : ''}
                        `}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                        {toast.type === 'info' && <Info className="w-5 h-5 text-accent" />}

                        <span className="text-sm font-medium">{toast.message}</span>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-black/5 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 opacity-50" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
