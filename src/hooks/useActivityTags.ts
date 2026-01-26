/**
 * 活动标签数据获取 Hook
 *
 * 获取当前用户的活动标签列表。
 */
import { useCallback, useEffect, useState } from 'react'
import type { ActivityListResponse, ActivityTag } from '../types/activity'

// 全局缓存，确保所有实例共享同一个数据
const globalTagCache = {
    data: [] as ActivityTag[],
    loading: false,
    error: null as string | null,
    promise: null as Promise<ActivityTag[]> | null,
    listeners: [] as ((data: ActivityTag[]) => void)[],
};

const API_URL = '/api/activity/tag/list';

export function useActivityTags() {
    const [data, setData] = useState<ActivityTag[]>(() => globalTagCache.data);
    const [, setLoading] = useState(() => {
        // 如果全局缓存中已有数据，则不处于加载状态
        if (globalTagCache.data.length > 0) {
            return false;
        }
        // 如果已有其他实例在加载，则跟随其加载状态
        return globalTagCache.loading;
    });
    const [error, setError] = useState<string | null>(() => globalTagCache.error);

    const fetchData = useCallback(async () => {
        // 如果已有数据在全局缓存中，直接返回
        if (globalTagCache.data.length > 0 && !globalTagCache.error) {
            return globalTagCache.data;
        }

        // 如果已经有请求正在进行，等待它完成
        if (globalTagCache.promise) {
            return await globalTagCache.promise;
        }

        // 开始新的请求
        globalTagCache.loading = true;
        globalTagCache.error = null;
        
        const promise = (async () => {
            try {
                const token = localStorage.getItem('token');
                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const res = await fetch(API_URL, { headers });
                const result: ActivityListResponse<ActivityTag[]> = await res.json();

                const data = Array.isArray(result.data) ? result.data : [];
                
                // 更新全局缓存
                globalTagCache.data = data;
                globalTagCache.loading = false;
                
                // 通知所有监听者
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

    // 添加监听器以便在数据更新时更新本地状态
    useEffect(() => {
        const listener = (newData: ActivityTag[]) => {
            setData(newData);
            setLoading(false);
            setError(globalTagCache.error);
        };

        // 如果全局缓存中已有数据，立即更新本地状态
        if (globalTagCache.data.length > 0) {
            listener(globalTagCache.data);
        }

        // 添加监听器
        globalTagCache.listeners.push(listener);

        // 初始化数据获取
        if (globalTagCache.data.length === 0 && !globalTagCache.promise) {
            fetchData().catch(err => console.error('Failed to fetch activity tags:', err));
        }

        // 清理函数
        return () => {
            // 移除监听器
            const index = globalTagCache.listeners.indexOf(listener);
            if (index > -1) {
                globalTagCache.listeners.splice(index, 1);
            }
        };
    }, [fetchData]);

    const refresh = useCallback(async () => {
        // 清除缓存并重新获取
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