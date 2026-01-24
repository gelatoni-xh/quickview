/**
 * 公告编辑弹窗组件
 *
 * 用于创建新公告的模态框表单。
 *
 * 功能：
 * - 标题输入框
 * - 内容输入框（支持 Markdown 格式）
 * - 表单验证（标题和内容不能为空）
 * - 提交状态管理（加载中、错误提示）
 *
 * 使用的 Hook：
 * - useCreateNotice: 处理公告创建的 API 调用
 */
import { X } from 'lucide-react'
import { useState } from 'react'
import { useCreateNotice } from '../../../hooks/useCreateNotice'

/** NoticeEditorModal 组件的 Props 类型 */
interface Props {
    /** 关闭弹窗的回调函数 */
    onClose: () => void
    /** 创建成功后的回调函数 */
    onSuccess?: () => void
}

export default function NoticeEditorModal({ onClose, onSuccess }: Props) {
    // 表单状态
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')

    // 使用创建公告 Hook
    const { createNotice, loading, error } = useCreateNotice()

    /**
     * 处理表单提交
     */
    const handleSubmit = async () => {
        // 表单验证
        if (!title.trim() || !content.trim()) {
            alert('标题和内容不能为空')
            return
        }

        // 调用创建 API
        const ok = await createNotice({ title, content })
        if (ok) {
            onSuccess?.() // 通知父组件创建成功
        }
    }

    return (
        // 遮罩层
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            {/* 弹窗内容容器 */}
            <div className="w-full max-w-2xl bg-white rounded shadow-lg p-4">
                {/* 弹窗头部：标题和关闭按钮 */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">新增公告</h3>
                    <button onClick={onClose} aria-label="关闭">
                        <X size={18} />
                    </button>
                </div>

                {/* 标题输入框 */}
                <input
                    className="w-full border rounded px-3 py-2 mb-3 text-sm"
                    placeholder="公告标题"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                {/* 内容输入框 - 支持 Markdown */}
                <textarea
                    className="w-full h-48 border rounded px-3 py-2 text-sm font-mono"
                    placeholder="支持 Markdown"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />

                {/* 错误提示 */}
                {error && (
                    <div className="text-sm text-red-500 mt-2">
                        {error}
                    </div>
                )}

                {/* 操作按钮 */}
                <div className="flex justify-end space-x-2 mt-4">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-sm rounded border"
                        disabled={loading}
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-3 py-1 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
                    >
                        {loading ? '发布中...' : '发布'}
                    </button>
                </div>
            </div>
        </div>
    )
}
