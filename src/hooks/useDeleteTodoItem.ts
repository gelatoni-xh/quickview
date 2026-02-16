import { useState } from 'react'
import { deleteTodoItem } from '../services/todoApi'
import type { TodoOperationResponse } from '../types/todo'

export function useDeleteTodoItem() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const deleteItem = async (id: number) => {
        try {
            setLoading(true)
            setError(null)

            const result = await deleteTodoItem(id)
            const response = result as unknown as TodoOperationResponse

            if (!response.success) {
                setError(response.message || '删除 TODO 失败')
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

    return { deleteItem, loading, error }
}
