/**
 * 顶部导航栏组件
 *
 * 包含侧边栏开关按钮和用户信息/登录按钮。
 * 在移动端或侧边栏收起时，用户可以通过点击此按钮打开侧边导航栏。
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoginModal from '../auth/LoginModal'

/** Header 组件的 Props 类型 */
type HeaderProps = {
    /** 设置侧边栏打开/关闭状态的函数 */
    setSidebarOpen: (open: boolean) => void
}

export default function Header({ setSidebarOpen }: HeaderProps) {
    const { userInfo, isAuthenticated, logout } = useAuth()
    const [showLoginModal, setShowLoginModal] = useState(false)
    const navigate = useNavigate()

    /**
     * 处理登录成功
     */
    const handleLoginSuccess = () => {
        // 登录成功后刷新页面以更新权限
        window.location.reload()
    }

    /**
     * 处理登出
     */
    const handleLogout = () => {
        logout()
        // 登出后导航回首页（Dashboard）
        navigate('/dashboard')
    }

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                {/* 左侧：侧边栏开关按钮 */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="inline-flex items-center px-3 py-2 text-sm bg-white border rounded shadow-sm hover:bg-gray-50"
                    aria-label="打开侧边栏"
                >
                    ☰
                </button>

                {/* 右侧：用户信息或登录按钮 */}
                <div className="flex items-center gap-3">
                    {isAuthenticated && userInfo?.user ? (
                        <>
                            {/* 显示用户昵称和第一个角色 */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-700">
                                    {userInfo.user.nickname || userInfo.user.username}
                                </span>
                                {userInfo.roleCodes.length > 0 && (
                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                                        {userInfo.roleCodes[0]}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                                登出
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            登录
                        </button>
                    )}
                </div>
            </div>

            {/* 登录弹窗 */}
            {showLoginModal && (
                <LoginModal
                    onClose={() => setShowLoginModal(false)}
                    onSuccess={handleLoginSuccess}
                />
            )}
        </>
    )
}