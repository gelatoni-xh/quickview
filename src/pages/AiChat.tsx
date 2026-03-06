import { useState, useRef, useEffect, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { PERMISSIONS } from '../constants/permissions'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import 'github-markdown-css/github-markdown.css'
import 'highlight.js/styles/github.css'
import { sendChat } from '../services/chatApi'
import { getContent } from '../services/blogApi'

type Message = { role: 'user' | 'assistant'; content: string }
type Tab = 'chat' | 'todo'

function ChatTab({ disabled }: { disabled: boolean }) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const sessionId = useMemo(() => crypto.randomUUID(), [])
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    const handleSend = async () => {
        const text = input.trim()
        if (!text || loading || disabled) return
        setInput('')
        setError(null)
        setMessages((prev) => [...prev, { role: 'user', content: text }])
        setLoading(true)
        try {
            const res = await sendChat(text, sessionId)
            if (res.success && res.data?.answer) {
                setMessages((prev) => [...prev, { role: 'assistant', content: res.data.answer }])
            } else {
                setError('请求失败')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-16">发送消息开始对话</div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                            msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-white border shadow-sm text-gray-800 rounded-bl-sm'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border shadow-sm px-4 py-2 rounded-2xl rounded-bl-sm text-sm text-gray-400">
                            思考中...
                        </div>
                    </div>
                )}
                {error && <div className="text-center text-red-500 text-sm">{error}</div>}
                <div ref={bottomRef} />
            </div>
            <div className="px-6 py-4 border-t bg-white">
                <div className="flex gap-2">
                    <input
                        className="flex-1 border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder={disabled ? '暂无权限' : '输入消息...'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        disabled={loading || disabled}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim() || disabled}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl disabled:opacity-50 hover:bg-blue-700"
                    >
                        发送
                    </button>
                </div>
            </div>
        </>
    )
}

function TodoTab() {
    const [content, setContent] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getContent('AI架构', 'AI工作流闭环TODO')
            .then((res) => {
                if (res.success && res.data?.content) setContent(res.data.content)
                else setError('加载失败')
            })
            .catch(() => setError('加载失败'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">加载中...</div>
    if (error) return <div className="flex-1 flex items-center justify-center text-red-500 text-sm">{error}</div>

    return (
        <div className="flex-1 overflow-y-auto px-6 py-4">
            <article className="markdown-body">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
                >
                    {content!}
                </ReactMarkdown>
            </article>
        </div>
    )
}

export default function AiChat() {
    const { hasPermission } = useAuth()
    const [tab, setTab] = useState<Tab>('chat')

    const tabs: { key: Tab; label: string }[] = [
        { key: 'chat', label: 'AI Chat' },
        { key: 'todo', label: 'AI 工作流 TODO' },
    ]

    return (
        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50">
            <div className="px-6 py-4 border-b bg-white">
                <h1 className="text-2xl font-semibold text-gray-900 mb-3">LLM / Agent</h1>
                <div className="flex gap-1">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                                tab === t.key
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>
            {tab === 'chat' ? <ChatTab disabled={!hasPermission(PERMISSIONS.AI_CHAT)} /> : <TodoTab />}
        </main>
    )
}
