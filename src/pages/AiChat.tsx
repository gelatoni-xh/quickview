import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { PERMISSIONS } from '../constants/permissions'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'
import 'github-markdown-css/github-markdown.css'
import 'highlight.js/styles/github.css'
import { sendChat, getSessions, getMessages } from '../services/chatApi'
import { getContent } from '../services/blogApi'

type Message = { role: 'user' | 'assistant'; content: string }
type Tab = 'chat' | 'todo'
type Session = { id: string; sessionUuid: string; name: string; messages: Message[] }

function ChatTab({ disabled, session, onUpdateSession }: { disabled: boolean; session: Session; onUpdateSession: (messages: Message[]) => void }) {
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [session.messages, loading])

    const handleSend = async () => {
        const text = input.trim()
        if (!text || loading || disabled) return
        setInput('')
        setError(null)
        const newMessages = [...session.messages, { role: 'user' as const, content: text }]
        onUpdateSession(newMessages)
        setLoading(true)
        try {
            const res = await sendChat(text, session.sessionUuid)
            if (res.success && res.data?.answer) {
                onUpdateSession([...newMessages, { role: 'assistant' as const, content: res.data.answer }])
            } else {
                setError(res.message || '请求失败')
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
                {session.messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-16">发送消息开始对话</div>
                )}
                {session.messages.map((msg, i) => (
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
                <div className="flex flex-col gap-2">
                    <input
                        className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder={disabled ? '暂无权限' : '输入消息...'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        disabled={loading || disabled}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim() || disabled}
                        className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-xl disabled:opacity-50 hover:bg-blue-700"
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
    const [sessions, setSessions] = useState<Session[]>([])
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
    const [loadingDb, setLoadingDb] = useState(true)

    useEffect(() => {
        loadSessionsFromDb()
    }, [])

    const loadSessionsFromDb = async () => {
        try {
            const res = await getSessions(1, 100)
            if (res.success && res.data?.records) {
                const dbSessions: Session[] = res.data.records.map((s: any) => ({
                    id: s.sessionUuid,
                    sessionUuid: s.sessionUuid,
                    name: s.title || `会话 ${s.sessionUuid.substring(0, 8)}`,
                    messages: []
                }))
                setSessions(dbSessions)
                if (dbSessions.length > 0) {
                    setCurrentSessionId(dbSessions[0].id)
                    loadMessagesForSession(dbSessions[0].sessionUuid)
                }
            } else {
                createSession()
            }
        } catch {
            createSession()
        } finally {
            setLoadingDb(false)
        }
    }

    const loadMessagesForSession = async (sessionUuid: string) => {
        try {
            const res = await getMessages(sessionUuid)
            if (res.success && res.data) {
                const messages: Message[] = []
                for (const msg of res.data) {
                    messages.push({ role: 'user', content: msg.message })
                    messages.push({ role: 'assistant', content: msg.answer })
                }
                setSessions(s => s.map(sess => sess.sessionUuid === sessionUuid ? { ...sess, messages } : sess))
            }
        } catch {
            // 加载失败，保持空消息列表
        }
    }

    const createSession = () => {
        const newSession: Session = {
            id: crypto.randomUUID(),
            sessionUuid: crypto.randomUUID(),
            name: `会话 ${sessions.length + 1}`,
            messages: [],
        }
        setSessions([...sessions, newSession])
        setCurrentSessionId(newSession.id)
    }

    const currentSession = sessions.find((s) => s.id === currentSessionId)

    const handleUpdateSession = (messages: Message[]) => {
        setSessions(sessions.map((s) => (s.id === currentSessionId ? { ...s, messages } : s)))
    }

    const handleDeleteSession = (id: string) => {
        const newSessions = sessions.filter((s) => s.id !== id)
        setSessions(newSessions)
        if (currentSessionId === id) {
            setCurrentSessionId(newSessions.length > 0 ? newSessions[0].id : null)
        }
    }

    const handleSelectSession = (id: string) => {
        setCurrentSessionId(id)
        const session = sessions.find(s => s.id === id)
        if (session && session.messages.length === 0) {
            loadMessagesForSession(session.sessionUuid)
        }
    }

    const tabs: { key: Tab; label: string }[] = [
        { key: 'chat', label: 'AI Chat' },
        { key: 'todo', label: 'AI 工作流 TODO' },
    ]

    if (loadingDb) {
        return <div className="flex-1 flex items-center justify-center text-gray-400">加载会话中...</div>
    }

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

            <div className="flex-1 flex overflow-hidden">
                {tab === 'chat' && (
                    <>
                        {/* 会话列表 Sidebar */}
                        <div className="w-56 border-r bg-gray-50 flex flex-col">
                            <div className="p-4 border-b">
                                <button
                                    onClick={createSession}
                                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    + 新建会话
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={`px-4 py-3 border-b cursor-pointer transition-colors group ${
                                            currentSessionId === session.id
                                                ? 'bg-blue-100 text-blue-900'
                                                : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                        onClick={() => handleSelectSession(session.id)}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm truncate flex-1">{session.name}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteSession(session.id)
                                                }}
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-lg leading-none transition-all"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {session.messages.length} 条消息
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 聊天区域 */}
                        {currentSession && (
                            <ChatTab
                                disabled={!hasPermission(PERMISSIONS.AI_CHAT)}
                                session={currentSession}
                                onUpdateSession={handleUpdateSession}
                            />
                        )}
                    </>
                )}

                {tab === 'todo' && <TodoTab />}
            </div>
        </main>
    )
}
