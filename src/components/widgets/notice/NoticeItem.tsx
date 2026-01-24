/**
 * 公告列表项组件
 *
 * 在公告列表中展示单条公告的摘要信息。
 * 点击"查看详情"按钮可打开详情弹窗查看完整内容。
 *
 * 特性：
 * - 标题和内容超长时自动截断（使用 line-clamp）
 * - 点击查看详情打开模态框
 */
import { useState } from 'react'
import type {Notice} from '../../../types/notices.ts'
import NoticeModal from './NoticeModal'

/** NoticeItem 组件的 Props 类型 */
interface Props {
    /** 公告数据 */
    notice: Notice
}

export default function NoticeItem({ notice }: Props) {
    // 控制详情弹窗的显示状态
    const [open, setOpen] = useState(false)

    return (
        <div className="border-b pb-2">
            {/* 创建时间 */}
            <p className="text-xs text-gray-400">
                {new Date(notice.createTime).toLocaleString()}
            </p>

            {/* 公告标题 - 单行显示，超长截断 */}
            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                {notice.title}
            </div>

            {/* 公告内容摘要 - 最多显示 2 行 */}
            <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                {notice.content}
            </div>

            {/* 查看详情按钮 */}
            <button
                className="text-blue-600 text-xs mt-1"
                onClick={() => setOpen(true)}
            >
                查看详情
            </button>

            {/* 公告详情弹窗 */}
            {open && (
                <NoticeModal notice={notice} onClose={() => setOpen(false)} />
            )}
        </div>
    )
}
