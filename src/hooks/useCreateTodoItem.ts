import { useState } from 'react'
import { createTodoItem } from '../services/todoApi'
import type { TodoOperationResponse } from '../types/todo'

interface CreateItemParams {
    content: string
    tagId?: number | null
}

export function useCreateTodoItem() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createItem = async (params: CreateItemParams) => {
        try {
            setLoading(true)
            setError(null)

            const result = await createTodoItem(params)
            const response = result as unknown as TodoOperationResponse

            if (!response.success) {
                setError(response.message || '创建 TODO 失败')
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

    return { createItem, loading, error }
}
