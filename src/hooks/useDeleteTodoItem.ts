/**
 * 删除 TODO 项 Hook
 */
import { useState } from 'react'
import type { TodoOperationResponse } from '../types/todo'

export function useDeleteTodoItem() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const deleteItem = async (id: number) => {
        try {
            setLoading(true)
            setError(null)

            const token = localStorage.getItem('token')
            if (!token) {
                setError('未登录，请先登录')
                return false
            }

            const res = await fetch(`/api/todo/item/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (res.status === 401) {
                setError('没有权限，请先登录')
                return false
            }

            const result: TodoOperationResponse = await res.json()

            if (!res.ok || !result.success) {
                setError(result.message || '删除 TODO 失败')
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
