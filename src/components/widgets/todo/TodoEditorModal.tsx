/**
 * TODO 编辑弹窗组件
 *
 * 用于创建新的 TODO 项或编辑已有的 TODO 项。
 */
import { X } from 'lucide-react'
import { useState } from 'react'
import { useCreateTodoItem } from '../../../hooks/useCreateTodoItem'
import { useUpdateTodoItem } from '../../../hooks/useUpdateTodoItem'
import type { TodoItem, TodoTag } from '../../../types/todo'

interface Props {
    /** 要编辑的 TODO 项，为 null 时表示新建 */
    todo?: TodoItem | null
    /** 可选的标签列表 */
    tags: TodoTag[]
    /** 默认选中的标签 ID */
    defaultTagId?: number | null
    onClose: () => void
    onSuccess?: () => void
}

export function TodoEditorModal({todo, tags, defaultTagId, onClose, onSuccess}: Props) {
    const [content, setContent] = useState(todo?.content || '')
    const [tagId, setTagId] = useState<number | null>(todo?.tagId ?? defaultTagId ?? null)
    const [completed, setCompleted] = useState(todo?.completed || false)

    const {createItem, loading: createLoading, error: createError} = useCreateTodoItem()
    const {updateItem, loading: updateLoading, error: updateError} = useUpdateTodoItem()

    const isEdit = !!todo
    const loading = createLoading || updateLoading
    const error = createError || updateError

    // 移除了原来的useEffect，因为props变化时组件会重新渲染，state会自动使用新的props值

    const handleSubmit = async () => {
        if (!content.trim()) {
            alert('TODO 内容不能为空')
            return
        }

        let ok: boolean
        if (isEdit && todo) {
            ok = await updateItem({
                id: todo.id,
                content,
                tagId,
                completed,
            })
        } else {
            ok = await createItem({content, tagId})
        }

        if (ok) {
            onSuccess?.()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg bg-white rounded shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{isEdit ? '编辑 TODO' : '新增 TODO'}</h3>
                    <button onClick={onClose} aria-label="关闭">
                        <X size={18}/>
                    </button>
                </div>

                {/* 内容输入框 */}
                <textarea
                    className="w-full h-24 border rounded px-3 py-2 mb-3 text-sm"
                    placeholder="TODO 内容"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />

                {/* 标签选择 */}
                <div className="mb-3">
                    <label className="block text-sm text-gray-600 mb-1">标签（可选）</label>
                    <select
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={tagId ?? ''}
                        onChange={(e) => setTagId(e.target.value ? Number(e.target.value) : null)}
                    >
                        <option value="">无标签</option>
                        {tags.map((tag) => (
                            <option key={tag.id} value={tag.id}>
                                {tag.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 完成状态（仅编辑时显示） */}
                {isEdit && (
                    <div className="mb-3">
                        <label className="flex items-center text-sm">
                            <input
                                type="checkbox"
                                className="mr-2"
                                checked={completed}
                                onChange={(e) => setCompleted(e.target.checked)}
                            />
                            已完成
                        </label>
                    </div>
                )}

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
                        {loading ? '保存中...' : '保存'}
                    </button>
                </div>
            </div>
        </div>
    )
}
