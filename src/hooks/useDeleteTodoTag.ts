import { useState } from 'react'
import { deleteTodoTag } from '../services/todoApi'
import type { TodoOperationResponse } from '../types/todo'

export function useDeleteTodoTag() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const deleteTag = async (id: number) => {
        try {
            setLoading(true)
            setError(null)

            const result = await deleteTodoTag(id)
            const response = result as unknown as TodoOperationResponse

            if (!response.success) {
                setError(response.message || '删除标签失败')
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

    return { deleteTag, loading, error }
}
