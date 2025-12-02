import React from 'react';
import { X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const shortcuts = [
    {
        category: 'Playback', items: [
            { keys: ['Space'], description: 'Play / Pause' },
            { keys: ['N'], description: 'Next track' },
            { keys: ['P'], description: 'Previous track' },
            { keys: ['←', '→'], description: 'Seek backward / forward 5s' },
            { keys: ['Home'], description: 'Jump to start' },
            { keys: ['End'], description: 'Jump to end' },
        ]
    },
    {
        category: 'Volume', items: [
            { keys: ['↑', '↓'], description: 'Volume up / down' },
            { keys: ['M'], description: 'Mute / Unmute' },
        ]
    },
    {
        category: 'Features', items: [
            { keys: ['L'], description: 'Toggle Like' },
            { keys: ['S'], description: 'Toggle Shuffle' },
            { keys: ['R'], description: 'Toggle Repeat' },
            { keys: ['Q'], description: 'Toggle Queue Panel' },
            { keys: ['/'], description: 'Focus Search' },
            { keys: ['?'], description: 'Show this help' },
        ]
    },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="modal-backdrop"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="modal-content glass-card bg-surface/98 border border-border">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-2xl font-bold text-primary">Keyboard Shortcuts</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-background rounded-full text-secondary hover:text-primary transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">
                    {shortcuts.map((section) => (
                        <div key={section.category}>
                            <h3 className="text-lg font-semibold text-primary mb-4">{section.category}</h3>
                            <div className="space-y-3">
                                {section.items.map((shortcut, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background transition-colors"
                                    >
                                        <span className="text-sm text-primary">{shortcut.description}</span>
                                        <div className="flex items-center gap-2">
                                            {shortcut.keys.map((key, keyIdx) => (
                                                <React.Fragment key={keyIdx}>
                                                    {keyIdx > 0 && <span className="text-xs text-secondary">/</span>}
                                                    <kbd className="px-3 py-1.5 text-xs font-mono bg-surface border border-border rounded-md text-primary shadow-sm min-w-[2.5rem] text-center">
                                                        {key}
                                                    </kbd>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-background/30">
                    <p className="text-sm text-secondary text-center">
                        Press <kbd className="px-2 py-1 text-xs bg-surface border border-border rounded">?</kbd> or{' '}
                        <kbd className="px-2 py-1 text-xs bg-surface border border-border rounded">Esc</kbd> to close
                    </p>
                </div>
            </div>
        </>
    );
};
