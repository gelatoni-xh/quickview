/**
 * 活动标签数据获取 Hook
 *
 * 获取当前用户的活动标签列表。
 */
import { useCallback, useEffect, useState } from 'react'
import type { ActivityListResponse, ActivityTag } from '../types/activity'

export function useActivityTags() {
    const [data, setData] = useState<ActivityTag[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const token = localStorage.getItem('token')
            const headers: HeadersInit = {}
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }
            const res = await fetch('/api/activity/tag/list', { headers })
            const result: ActivityListResponse<ActivityTag[]> = await res.json()

            setData(Array.isArray(result.data) ? result.data : [])
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return {
        data,
        loading,
        error,
        refresh: fetchData,
    }
}
