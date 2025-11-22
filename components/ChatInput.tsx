import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    disabled?: boolean;
    placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    value,
    onChange,
    onSend,
    disabled = false,
    placeholder = "Type a message..."
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize logic
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Cap at 200px
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!disabled && value.trim()) {
                onSend();
            }
        }
    };

    return (
        <div className="relative group w-full">
            <div className="relative flex items-end gap-2 bg-surface border border-accent/20 rounded-2xl shadow-sm focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all duration-200 overflow-hidden">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    className="w-full bg-transparent border-none focus:ring-0 resize-none py-4 pl-5 pr-12 max-h-[200px] min-h-[56px] scrollbar-thin text-primary placeholder:text-muted disabled:opacity-50 leading-relaxed"
                    style={{ height: 'auto' }}
                />
                <button
                    onClick={onSend}
                    disabled={!value.trim() || disabled}
                    className="absolute right-2 bottom-2 p-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-all shadow-md disabled:opacity-50 disabled:shadow-none flex items-center justify-center hover:scale-105 active:scale-95"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
