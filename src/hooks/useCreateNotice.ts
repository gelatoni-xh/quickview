import { useState } from 'react'
import { createNotice } from '../services/noticeApi'

interface CreateNoticeParams {
    title: string
    content: string
}

export function useCreateNotice() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createNoticeAction = async (params: CreateNoticeParams) => {
        try {
            setLoading(true)
            setError(null)

            const result = await createNotice(params)
            const response = result as any

            if (!response.success) {
                setError(response.message || '创建公告失败')
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

    return { createNotice: createNoticeAction, loading, error }
}
