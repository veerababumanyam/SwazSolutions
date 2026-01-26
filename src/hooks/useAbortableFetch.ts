import { useEffect, useRef } from 'react';
import { createAbortableRequest, AbortError } from '../services/api';

/**
 * Custom hook for making abortable API requests with automatic cleanup on unmount
 * Prevents memory leaks and "setState on unmounted component" errors
 *
 * @returns A function that makes abortable requests
 *
 * @example
 * const abortableFetch = useAbortableFetch();
 *
 * useEffect(() => {
 *   const fetchData = async () => {
 *     try {
 *       const data = await abortableFetch('/api/songs');
 *       setSongs(data);
 *     } catch (error) {
 *       if (error instanceof AbortError) return; // Request was cancelled, ignore error
 *       setError(error.message);
 *     }
 *   };
 *
 *   fetchData();
 * }, []);
 */
export function useAbortableFetch() {
    const abortControllerRef = useRef<ReturnType<typeof createAbortableRequest> | null>(null);

    useEffect(() => {
        // Create a new abortable request handler for this component instance
        abortControllerRef.current = createAbortableRequest();

        // Cleanup: abort any ongoing request when component unmounts
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Return a wrapper function that uses the ref's request method
    return async (endpoint: string, options: RequestInit = {}) => {
        if (!abortControllerRef.current) {
            throw new Error('useAbortableFetch: Abort controller not initialized');
        }
        return abortControllerRef.current.request(endpoint, options);
    };
}

/**
 * Custom hook for making multiple abortable requests in the same component
 * Each request gets its own abort controller
 *
 * @param keys - Unique identifiers for each request
 *
 * @example
 * const { fetch: fetchSongs } = useAbortableFetchMap('songs');
 * const { fetch: fetchAlbums } = useAbortableFetchMap('albums');
 */
export function useAbortableFetchMap(key: string) {
    const abortControllersRef = useRef<Map<string, ReturnType<typeof createAbortableRequest>>>(new Map());

    useEffect(() => {
        return () => {
            // Abort all requests when component unmounts
            abortControllersRef.current.forEach(({ abort }) => abort());
            abortControllersRef.current.clear();
        };
    }, []);

    const fetch = async (endpoint: string, options: RequestInit = {}) => {
        let abortable = abortControllersRef.current.get(key);

        if (!abortable) {
            abortable = createAbortableRequest();
            abortControllersRef.current.set(key, abortable);
        }

        return abortable.request(endpoint, options);
    };

    const abort = () => {
        const abortable = abortControllersRef.current.get(key);
        if (abortable) {
            abortable.abort();
            abortControllersRef.current.delete(key);
        }
    };

    return { fetch, abort };
}

export { AbortError };
