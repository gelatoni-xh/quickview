/**
 * 创建 TODO 项 Hook
 */
import { useState } from 'react'
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

            const token = localStorage.getItem('token')
            if (!token) {
                setError('未登录，请先登录')
                return false
            }

            const res = await fetch('/api/todo/item/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(params),
            })

            if (res.status === 401) {
                setError('没有权限，请先登录')
                return false
            }

            const result: TodoOperationResponse = await res.json()

            if (!res.ok || !result.success) {
                setError(result.message || '创建 TODO 失败')
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
