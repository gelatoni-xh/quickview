/**
 * 创建 TODO 标签 Hook
 */
import { useState } from 'react'
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

            const token = localStorage.getItem('token')

            const res = await fetch('/api/todo/tag/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(params),
            })

            if (res.status === 401) {
                setError('没有权限，请先登录')
                return false
            }

            const result: TodoOperationResponse = await res.json()

            if (!res.ok || !result.success) {
                setError(result.message || '创建标签失败')
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
