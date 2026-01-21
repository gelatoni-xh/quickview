import { useNotices } from '../../../hooks/useNotices'
import NoticeItem from '../notice/NoticeItem'

export default function NoticeWidget() {
    const { data, loading, error } = useNotices(1, 10)

    if (loading) return <div>Loading notices...</div>
    if (error) return <div>Error: {error}</div>
    if (data.length === 0) return <div>No notices</div>

    return (
        <div className="p-4 border rounded shadow">
            <h2 className="font-semibold mb-3">公告</h2>

            <div className="space-y-3">
                {data.map((notice, idx) => (
                    <NoticeItem key={idx} notice={notice} />
                ))}
            </div>
        </div>
    )
}
