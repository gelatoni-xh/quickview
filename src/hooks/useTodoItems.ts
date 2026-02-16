import { useCallback, useEffect, useState } from 'react'
import { getTodoItems } from '../services/todoApi'
import type { TodoItem } from '../types/todo'

export function useTodoItems(tagId: number | null) {
    const [data, setData] = useState<TodoItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const result = await getTodoItems(tagId)
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
