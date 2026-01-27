/**
 * TODO 项行组件
 *
 * 展示单个 TODO 项，支持点击切换完成状态和编辑。
 */
import { Check, Edit2 } from 'lucide-react'
import { Trash2 } from 'lucide-react'
import type { TodoItem } from '../../../types/todo'

interface Props {
    item: TodoItem
    onToggleComplete: (item: TodoItem) => void
    onEdit: (item: TodoItem) => void
    canDelete?: boolean
    onDelete?: (item: TodoItem) => void
}

export default function TodoItemRow({ item, onToggleComplete, onEdit, canDelete, onDelete }: Props) {
    return (
        <div className="flex items-center gap-2 py-2 border-b last:border-b-0">
            {/* 完成状态按钮 */}
            <button
                onClick={() => onToggleComplete(item)}
                className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center
                    ${item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-gray-400'}`}
                title={item.completed ? '标记为未完成' : '标记为已完成'}
            >
                {item.completed && <Check size={14} />}
            </button>

            {/* TODO 内容 */}
            <div className="flex-1 min-w-0">
                <div className={`text-sm truncate ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {item.content}
                </div>
                {item.tagName && (
                    <span className="text-xs text-blue-500">{item.tagName}</span>
                )}
            </div>

            {/* 编辑按钮 */}
            <button
                onClick={() => onEdit(item)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
                title="编辑"
            >
                <Edit2 size={14} />
            </button>

            {canDelete && onDelete && (
                <button
                    onClick={() => onDelete(item)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600"
                    title="删除"
                    aria-label="删除"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    )
}
