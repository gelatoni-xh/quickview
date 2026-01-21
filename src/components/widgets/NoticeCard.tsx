import { useNotices } from '../../hooks/useNotices'
import NoticeItem from './notice/NoticeItem.tsx'

export default function NoticeCard() {
    const { data, loading, error } = useNotices(1, 5)

    return (
        <div className="p-4 border rounded shadow flex flex-col">
            <h2 className="font-semibold mb-3">公告</h2>

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
    )
}
