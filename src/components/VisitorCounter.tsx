import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

export const VisitorCounter: React.FC = () => {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                // Check if we've already counted this session
                const hasCounted = sessionStorage.getItem('hasCountedVisitor');

                let url = '/api/visitors';
                let method = 'GET';

                if (!hasCounted) {
                    url = '/api/visitors/increment';
                    method = 'POST';
                }

                const response = await fetch(url, { method });

                // Check if response is OK and is JSON
                if (!response.ok) {
                    // Silently fail if endpoint doesn't exist (404) or other errors
                    console.debug('Visitor counter API not available:', response.status);
                    return;
                }

                // Check content type to ensure it's JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    console.debug('Visitor counter API returned non-JSON response');
                    return;
                }

                const data = await response.json();
                setCount(data.count);
                
                if (!hasCounted) {
                    sessionStorage.setItem('hasCountedVisitor', 'true');
                }
            } catch (error) {
                // Silently handle errors - visitor counter is non-critical
                console.debug('Visitor counter unavailable:', error instanceof Error ? error.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchCount();
    }, []);

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full text-xs font-medium text-muted-foreground hover:bg-secondary/80 transition-colors cursor-help" title="Total Site Visitors">
            <Users size={14} />
            <span>{loading ? '...' : (count !== null ? count.toLocaleString() : '-')}</span>
        </div>
    );
};
