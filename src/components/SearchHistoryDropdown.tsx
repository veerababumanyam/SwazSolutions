import React from 'react';
import { Clock, X, Search } from 'lucide-react';
import { useMusic } from '../contexts/MusicContext';

interface SearchHistoryDropdownProps {
    onSelect: (query: string) => void;
    onClose: () => void;
}

export const SearchHistoryDropdown: React.FC<SearchHistoryDropdownProps> = ({ onSelect, onClose }) => {
    const { searchHistory, removeFromSearchHistory, clearSearchHistory } = useMusic();

    if (searchHistory.length === 0) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card bg-surface/95 border border-border z-50 overflow-hidden animate-fade-in shadow-xl">
            <div className="flex items-center justify-between p-3 border-b border-border bg-background/50">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Recent Searches</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        clearSearchHistory();
                        onClose();
                    }}
                    className="text-xs text-accent hover:text-accent-dark transition-colors"
                >
                    Clear All
                </button>
            </div>

            <div className="max-h-60 overflow-y-auto">
                {searchHistory.map((query, index) => (
                    <div
                        key={`${query}-${index}`}
                        className="group flex items-center justify-between p-3 hover:bg-background/80 transition-colors cursor-pointer border-b border-border/50 last:border-0"
                        onClick={() => {
                            onSelect(query);
                            onClose();
                        }}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Clock className="w-4 h-4 text-secondary group-hover:text-primary transition-colors flex-shrink-0" />
                            <span className="text-sm text-primary truncate group-hover:text-accent transition-colors">{query}</span>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFromSearchHistory(query);
                            }}
                            className="p-1 text-secondary hover:text-accent opacity-0 group-hover:opacity-100 transition-all"
                            aria-label="Remove from history"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
