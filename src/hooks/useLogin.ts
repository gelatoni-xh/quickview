/**
 * 登录 Hook
 *
 * 提供登录功能，包括：
 * - 调用登录 API
 * - 错误处理
 * - 登录成功后更新认证状态
 */
import { useState } from 'react'
import { useAuth } from './useAuth'
import type { LoginRequest, UserInfoResponse } from '../types/auth'

export function useLogin() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { login } = useAuth()

    /**
     * 执行登录
     */
    const doLogin = async (params: LoginRequest): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            })

            const result: UserInfoResponse = await res.json()

            if (!res.ok || !result.success) {
                setError(result.message || '登录失败')
                return false
            }

            // 登录成功，更新认证状态
            if (result.data) {
                login(result.data)
                return true
            }

            setError('登录响应数据格式错误')
            return false
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
            return false
        } finally {
            setLoading(false)
        }
    }

    return {
        login: doLogin,
        loading,
        error,
    }
}
