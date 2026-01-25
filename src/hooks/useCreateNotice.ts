/**
 * 创建公告 Hook
 *
 * 封装创建公告的 API 调用逻辑，包括：
 * - 认证 Token 处理（从 localStorage 读取）
 * - 401 未授权错误统一处理
 * - 加载状态和错误状态管理
 *
 * @returns Hook 返回值对象
 *
 * @example
 * ```tsx
 * const { createNotice, loading, error } = useCreateNotice()
 *
 * const handleSubmit = async () => {
 *     const success = await createNotice({ title: '标题', content: '内容' })
 *     if (success) {
 *         // 创建成功
 *     }
 * }
 * ```
 */
import { useState } from 'react'

/** 创建公告的请求参数 */
interface CreateNoticeParams {
    /** 公告标题 */
    title: string
    /** 公告内容 */
    content: string
}

/** 创建公告的响应类型 */
interface CreateNoticeResponse {
    /** 是否成功 */
    success: boolean
    /** 响应状态码 */
    statusCode: string
    /** 返回数据（影响的行数） */
    data: number
    /** 消息（错误时返回错误信息） */
    message: string
    /** 链路追踪 ID */
    traceId: string
}

export function useCreateNotice() {
    // 加载状态
    const [loading, setLoading] = useState(false)
    // 错误信息
    const [error, setError] = useState<string | null>(null)

    /**
     * 创建公告
     *
     * @param params - 公告参数（标题和内容）
     * @returns Promise<boolean> - 创建是否成功
     */
    const createNotice = async (params: CreateNoticeParams) => {
        try {
            setLoading(true)
            setError(null)

            // 从 localStorage 获取认证 Token
            const token = localStorage.getItem('token')
            if (!token) {
                setError('未登录，请先登录')
                return false
            }

            const res = await fetch('/api/notice/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(params),
            })

            // 统一处理 401 未授权错误
            if (res.status === 401) {
                setError('没有权限，请先登录')
                return false
            }

            const result: CreateNoticeResponse = await res.json()

            // 检查业务层面的成功状态
            if (!res.ok || !result.success) {
                setError(result.message || '创建公告失败')
                return false
            }

            return true
        } catch (err) {
            // 捕获网络错误等异常
            setError(err instanceof Error ? err.message : String(err))
            return false
        } finally {
            setLoading(false)
        }
    }

    return {
        /** 创建公告方法 */
        createNotice,
        /** 是否正在提交 */
        loading,
        /** 错误信息，无错误时为 null */
        error,
    }
}
