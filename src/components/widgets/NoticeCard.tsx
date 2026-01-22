import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useNotices } from '../../hooks/useNotices'
import NoticeItem from './notice/NoticeItem'
import NoticeEditorModal from './notice/NoticeEditorModal'

export default function NoticeCard() {
    const { data, loading, error, refresh } = useNotices(1, 5)
    const [open, setOpen] = useState(false)

    return (
        <>
            <div className="p-4 border rounded shadow flex flex-col relative">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold">公告</h2>

                    <button
                        onClick={() => setOpen(true)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-600"
                        title="新增公告"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {loading && <div className="text-sm text-gray-500">Loading...</div>}
                {error && <div className="text-sm text-red-500">{error}</div>}

                {!loading && !error && data.length === 0 && (
                    <div className="text-sm text-gray-400">暂无公告</div>
                )}

                <div className="flex-1 space-y-3">
                    {data.map((notice) => (
                        <NoticeItem
                            key={notice.createTime}
                            notice={notice}
                        />
                    ))}
                </div>

                <div className="mt-3 text-right">
                    <button className="text-sm text-blue-600 hover:underline">
                        查看全部
                    </button>
                </div>
            </div>

            {open && (
                <NoticeEditorModal
                    onClose={() => setOpen(false)}
                    onSuccess={() => {
                        setOpen(false)
                        refresh()
                    }}
                />
            )}
        </>
    )
}
