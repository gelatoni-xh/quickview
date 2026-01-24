/**
 * 标签编辑弹窗组件
 *
 * 用于创建新的 TODO 标签。
 */
import { X } from 'lucide-react'
import { useState } from 'react'
import { useCreateTodoTag } from '../../../hooks/useCreateTodoTag'

interface Props {
    onClose: () => void
    onSuccess?: () => void
}

export default function TagEditorModal({ onClose, onSuccess }: Props) {
    const [name, setName] = useState('')
    const { createTag, loading, error } = useCreateTodoTag()

    const handleSubmit = async () => {
        if (!name.trim()) {
            alert('标签名称不能为空')
            return
        }

        const ok = await createTag({ name })
        if (ok) {
            onSuccess?.()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md bg-white rounded shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">新增标签</h3>
                    <button onClick={onClose} aria-label="关闭">
                        <X size={18} />
                    </button>
                </div>

                <input
                    className="w-full border rounded px-3 py-2 mb-3 text-sm"
                    placeholder="标签名称"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />

                {error && (
                    <div className="text-sm text-red-500 mt-2">{error}</div>
                )}

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
                        {loading ? '创建中...' : '创建'}
                    </button>
                </div>
            </div>
        </div>
    )
}
