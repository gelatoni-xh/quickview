/**
 * 认证 Provider 组件
 *
 * 提供全局的认证状态管理，包括：
 * - 用户信息
 * - 权限列表
 * - Token 管理
 * - 登录/登出功能
 */
import { useState, useEffect, type ReactNode } from 'react'
import type { UserInfo, AuthState } from '../types/auth'
import { AuthContext } from './AuthContextInstance'

export interface AuthContextType extends AuthState {
    login: (userInfo: UserInfo) => void
    logout: () => void
    hasPermission: (permission: string) => boolean
    refreshUserInfo: () => Promise<void>
}

/**
 * 认证 Provider 组件
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    /**
     * 从 localStorage 加载已保存的用户信息
     */
    useEffect(() => {
        const loadSavedAuth = () => {
            try {
                const savedToken = localStorage.getItem('token')
                const savedUserInfo = localStorage.getItem('userInfo')

                if (savedToken && savedUserInfo) {
                    const parsed = JSON.parse(savedUserInfo)
                    setUserInfo({ ...parsed, token: savedToken })
                    return true
                }
            } catch (err) {
                console.error('加载保存的认证信息失败:', err)
                localStorage.removeItem('token')
                localStorage.removeItem('userInfo')
            }
            return false
        }

        // 如果已保存登录信息，直接使用
        if (loadSavedAuth()) {
            setLoading(false)
            return
        }

        // 否则获取匿名用户权限
        fetchAnonymousUserInfo()
    }, [])

    /**
     * 获取匿名用户信息（未登录状态下的权限）
     */
    const fetchAnonymousUserInfo = async () => {
        try {
            setLoading(true)
            setError(null)

            const res = await fetch('/api/auth/anonymous')
            const result = await res.json()

            if (result.success && result.data) {
                setUserInfo(result.data)
            } else {
                setError(result.message || '获取匿名用户信息失败')
                // 设置默认空权限，避免应用无法运行
                setUserInfo({
                    user: null,
                    roleCodes: [],
                    permissionCodes: [],
                })
            }
        } catch (err) {
            console.error('获取匿名用户信息失败:', err)
            setError(err instanceof Error ? err.message : String(err))
            // 设置默认空权限
            setUserInfo({
                user: null,
                roleCodes: [],
                permissionCodes: [],
            })
        } finally {
            setLoading(false)
        }
    }

    /**
     * 登录
     */
    const login = (newUserInfo: UserInfo) => {
        setUserInfo(newUserInfo)
        setError(null)

        // 保存到 localStorage
        if (newUserInfo.token) {
            localStorage.setItem('token', newUserInfo.token)
        }
        localStorage.setItem('userInfo', JSON.stringify({
            user: newUserInfo.user,
            roleCodes: newUserInfo.roleCodes,
            permissionCodes: newUserInfo.permissionCodes,
        }))
    }

    /**
     * 登出
     */
    const logout = () => {
        setUserInfo({
            user: null,
            roleCodes: [],
            permissionCodes: [],
        })
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')

        // 重新获取匿名用户权限
        fetchAnonymousUserInfo()
    }

    /**
     * 检查是否有指定权限
     */
    const hasPermission = (permission: string): boolean => {
        if (!userInfo) return false
        return userInfo.permissionCodes.includes(permission)
    }

    /**
     * 刷新用户信息
     */
    const refreshUserInfo = async () => {
        if (!userInfo?.user) {
            await fetchAnonymousUserInfo()
            return
        }

        // 如果已登录，需要重新获取用户信息（这里可以调用获取当前用户信息的接口）
        // 目前先不做处理，因为登录后权限已经获取
    }

    const value: AuthContextType = {
        userInfo,
        isAuthenticated: userInfo?.user !== null,
        loading,
        error,
        login,
        logout,
        hasPermission,
        refreshUserInfo,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
