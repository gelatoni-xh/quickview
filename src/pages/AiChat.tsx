import { useState, useRef, useEffect, useMemo } from 'react'
import { sendChat } from '../services/chatApi'

type Message = { role: 'user' | 'assistant'; content: string }

export default function AiChat() {
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
        if (!text || loading) return

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
        <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50">
            <div className="px-6 py-4 border-b bg-white">
                <h1 className="text-2xl font-semibold text-gray-900">AI Chat</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-16">发送消息开始对话</div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                                msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-white border shadow-sm text-gray-800 rounded-bl-sm'
                            }`}
                        >
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
                        className="flex-1 border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="输入消息..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl disabled:opacity-50 hover:bg-blue-700"
                    >
                        发送
                    </button>
                </div>
            </div>
        </main>
    )
}
