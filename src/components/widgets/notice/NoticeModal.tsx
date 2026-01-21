import type {Notice} from '../../../types/notices.ts'
import ReactMarkdown from 'react-markdown'

interface Props {
    notice: Notice
    onClose: () => void
}

export default function NoticeModal({ notice, onClose }: Props) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded max-w-lg w-full max-h-[80vh] overflow-auto">
                <h3 className="font-semibold mb-4">{notice.title}</h3>

                <div className="prose text-sm">
                    <ReactMarkdown>{notice.content}</ReactMarkdown>
                </div>

                <button
                    className="mt-4 text-blue-600"
                    onClick={onClose}
                >
                    关闭
                </button>
            </div>
        </div>
    )
}
