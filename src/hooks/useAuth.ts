/**
 * 使用认证 Context 的 Hook
 *
 * 从 AuthContext 中获取认证状态和方法。
 */
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContextInstance'

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
