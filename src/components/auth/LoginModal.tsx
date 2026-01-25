/**
 * 登录弹窗组件
 *
 * 提供用户登录功能，包括：
 * - 用户名和密码输入
 * - 登录和取消按钮
 * - 错误提示
 * - 加载状态
 */
import { useState } from 'react'
import { X } from 'lucide-react'
import { useLogin } from '../../hooks/useLogin'

interface Props {
    /** 关闭弹窗的回调函数 */
    onClose: () => void
    /** 登录成功后的回调函数 */
    onSuccess?: () => void
}

export default function LoginModal({ onClose, onSuccess }: Props) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const { login, loading, error } = useLogin()

    /**
     * 处理登录提交
     */
    const handleSubmit = async () => {
        // 表单验证
        if (!username.trim() || !password.trim()) {
            return
        }

        const ok = await login({ username, password })
        if (ok) {
            onSuccess?.()
            onClose()
        }
    }

    /**
     * 处理取消
     */
    const handleCancel = () => {
        setUsername('')
        setPassword('')
        onClose()
    }

    return (
        // 遮罩层
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            {/* 弹窗内容容器 */}
            <div className="w-full max-w-md bg-white rounded shadow-lg p-6">
                {/* 弹窗头部：标题和关闭按钮 */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">登录</h3>
                    <button
                        onClick={handleCancel}
                        className="p-1 rounded hover:bg-gray-100"
                        aria-label="关闭"
                        disabled={loading}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* 用户名输入框 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        用户名
                    </label>
                    <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="请输入用户名"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !loading) {
                                handleSubmit()
                            }
                        }}
                    />
                </div>

                {/* 密码输入框 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        密码
                    </label>
                    <input
                        type="password"
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="请输入密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !loading) {
                                handleSubmit()
                            }
                        }}
                    />
                </div>

                {/* 错误提示 */}
                {error && (
                    <div className="text-sm text-red-500 mb-4">
                        {error}
                    </div>
                )}

                {/* 操作按钮 */}
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
                        disabled={loading}
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !username.trim() || !password.trim()}
                        className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700"
                    >
                        {loading ? '登录中...' : '登录'}
                    </button>
                </div>
            </div>
        </div>
    )
}
