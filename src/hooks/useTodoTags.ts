/**
 * TODO 标签数据获取 Hook
 *
 * 获取所有标签列表。
 */
import { useCallback, useEffect, useState } from 'react'
import type { TodoTag, TodoTagListResponse } from '../types/todo'

export function useTodoTags() {
    const [data, setData] = useState<TodoTag[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch('/api/todo/tag/list')
            const result: TodoTagListResponse = await res.json()

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
