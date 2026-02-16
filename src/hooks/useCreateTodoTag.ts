import { useState } from 'react'
import { createTodoTag } from '../services/todoApi'
import type { TodoOperationResponse } from '../types/todo'

interface CreateTagParams {
    name: string
}

export function useCreateTodoTag() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createTag = async (params: CreateTagParams) => {
        try {
            setLoading(true)
            setError(null)

            const result = await createTodoTag(params)
            const response = result as unknown as TodoOperationResponse

            if (!response.success) {
                setError(response.message || '创建标签失败')
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

    return { createTag, loading, error }
}
