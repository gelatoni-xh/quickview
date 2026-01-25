/**
 * TODO 项数据获取 Hook
 *
 * 获取 TODO 列表，支持按标签筛选。
 *
 * @param tagId - 标签 ID，为 null 时获取所有 TODO
 */
import { useCallback, useEffect, useState } from 'react'
import type { TodoItem, TodoItemListResponse } from '../types/todo'

export function useTodoItems(tagId: number | null) {
    const [data, setData] = useState<TodoItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // 根据是否有 tagId 决定调用哪个接口
            const url = tagId !== null
                ? `/api/todo/item/listByTag?tagId=${tagId}`
                : '/api/todo/item/list'

            const token = localStorage.getItem('token')
            const headers: HeadersInit = {}
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }
            const res = await fetch(url, { headers })
            const result: TodoItemListResponse = await res.json()

            setData(Array.isArray(result.data) ? result.data : [])
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }, [tagId])

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
