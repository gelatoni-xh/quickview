import { useState } from 'react'
import { updateTodoItem } from '../services/todoApi'
import type { TodoOperationResponse } from '../types/todo'

interface UpdateItemParams {
    id: number
    content?: string
    completed?: boolean
    tagId?: number | null
}

export function useUpdateTodoItem() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const updateItem = async (params: UpdateItemParams) => {
        try {
            setLoading(true)
            setError(null)

            const result = await updateTodoItem(params)
            const response = result as unknown as TodoOperationResponse

            if (!response.success) {
                setError(response.message || '更新 TODO 失败')
                return false
            }

            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
            return false
        } finally {
            setLoading(false)
        }
    }

    return { updateItem, loading, error }
}
