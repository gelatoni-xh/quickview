import { X } from 'lucide-react'
import { useState } from 'react'
import { useCreateNotice } from '../../../hooks/useCreateNotice'

interface Props {
    onClose: () => void
    onSuccess?: () => void
}

export default function NoticeEditorModal({ onClose, onSuccess }: Props) {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')

    const { createNotice, loading, error } = useCreateNotice()

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            alert('标题和内容不能为空')
            return
        }

        const ok = await createNotice({ title, content })
        if (ok) {
            onSuccess?.()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-2xl bg-white rounded shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">新增公告</h3>
                    <button onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <input
                    className="w-full border rounded px-3 py-2 mb-3 text-sm"
                    placeholder="公告标题"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    className="w-full h-48 border rounded px-3 py-2 text-sm font-mono"
                    placeholder="支持 Markdown"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />

                {error && (
                    <div className="text-sm text-red-500 mt-2">
                        {error}
                    </div>
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
                        {loading ? '发布中...' : '发布'}
                    </button>
                </div>
            </div>
        </div>
    )
}
