/**
 * 公告详情弹窗组件
 *
 * 以模态框形式展示公告的完整内容。
 * 公告内容支持 Markdown 格式，使用 react-markdown 渲染。
 *
 * 特性：
 * - 半透明遮罩层
 * - 内容超长时可滚动
 * - 支持 Markdown 渲染
 */
import type {Notice} from '../../../types/notices.ts'
import ReactMarkdown from 'react-markdown'

/** NoticeModal 组件的 Props 类型 */
interface Props {
    /** 公告数据 */
    notice: Notice
    /** 关闭弹窗的回调函数 */
    onClose: () => void
}

export default function NoticeModal({ notice, onClose }: Props) {
    return (
        // 遮罩层 - 点击不关闭，需要点击关闭按钮
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            {/* 弹窗内容容器 */}
            <div className="bg-white p-6 rounded max-w-lg w-full max-h-[80vh] overflow-auto">
                {/* 公告标题 */}
                <h3 className="font-semibold mb-4">{notice.title}</h3>

                {/* 公告内容 - 使用 react-markdown 渲染 Markdown */}
                <div className="prose max-w-none">
                    <ReactMarkdown>{notice.content}</ReactMarkdown>
                </div>

                {/* 关闭按钮 */}
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
