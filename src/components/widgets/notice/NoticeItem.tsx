import { useState } from 'react'
import type {Notice} from '../../../types/notices.ts'
import NoticeModal from './NoticeModal'

interface Props {
    notice: Notice
}

export default function NoticeItem({ notice }: Props) {
    const [open, setOpen] = useState(false)

    return (
        <div className="border-b pb-2">
            <p className="text-xs text-gray-400">
                {new Date(notice.createTime).toLocaleString()}
            </p>

            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                {notice.title}
            </div>

            <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                {notice.content}
            </div>


            <button
                className="text-blue-600 text-xs mt-1"
                onClick={() => setOpen(true)}
            >
                查看详情
            </button>

            {open && (
                <NoticeModal notice={notice} onClose={() => setOpen(false)} />
            )}
        </div>
    )
}
