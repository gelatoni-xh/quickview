import { useCallback, useEffect, useState } from 'react'
import { getActivityTags } from '../services/activityApi'
import type { ActivityTag } from '../types/activity'

const globalTagCache = {
    data: [] as ActivityTag[],
    loading: false,
    error: null as string | null,
    promise: null as Promise<ActivityTag[]> | null,
    listeners: [] as ((data: ActivityTag[]) => void)[],
};

export function useActivityTags() {
    const [data, setData] = useState<ActivityTag[]>(() => globalTagCache.data);
    const [, setLoading] = useState(() => {
        if (globalTagCache.data.length > 0) {
            return false;
        }
        return globalTagCache.loading;
    });
    const [error, setError] = useState<string | null>(() => globalTagCache.error);

    const fetchData = useCallback(async () => {
        if (globalTagCache.data.length > 0 && !globalTagCache.error) {
            return globalTagCache.data;
        }

        if (globalTagCache.promise) {
            return await globalTagCache.promise;
        }

        globalTagCache.loading = true;
        globalTagCache.error = null;
        
        const promise = (async () => {
            try {
                const result = await getActivityTags();
                const data = Array.isArray(result.data) ? result.data : [];
                
                globalTagCache.data = data;
                globalTagCache.loading = false;
                globalTagCache.listeners.forEach(listener => listener(data));
                
                return data;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                globalTagCache.error = errorMessage;
                globalTagCache.loading = false;
                throw err;
            } finally {
                globalTagCache.promise = null;
            }
        })();

        globalTagCache.promise = promise;
        return await promise;
    }, []);

    useEffect(() => {
        const listener = (newData: ActivityTag[]) => {
            setData(newData);
            setLoading(false);
            setError(globalTagCache.error);
        };

        if (globalTagCache.data.length > 0) {
            listener(globalTagCache.data);
        }

        globalTagCache.listeners.push(listener);

        if (globalTagCache.data.length === 0 && !globalTagCache.promise) {
            fetchData().catch(err => console.error('Failed to fetch activity tags:', err));
        }

        return () => {
            const index = globalTagCache.listeners.indexOf(listener);
            if (index > -1) {
                globalTagCache.listeners.splice(index, 1);
            }
        };
    }, [fetchData]);

    const refresh = useCallback(async () => {
        globalTagCache.data = [];
        globalTagCache.error = null;
        globalTagCache.promise = null;
        globalTagCache.loading = false;
        
        return await fetchData();
    }, [fetchData]);

    return {
        data,
        loading: globalTagCache.loading,
        error,
        refresh,
    };
}
