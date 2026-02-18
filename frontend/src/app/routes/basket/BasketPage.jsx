import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './BasketPage.css'

const API_BASE = 'http://localhost:8000/api/v1'

export default function BasketPage() {
    const navigate = useNavigate()
    const [items, setItems] = useState([])
    const [chatOpen, setChatOpen] = useState(true)
    const [message, setMessage] = useState('')
    const [chatMessages, setChatMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [suggestions, setSuggestions] = useState([
        '계란 30구 추가해줘',
        '김치찌개 재료 추천해줘',
        '도움말'
    ])

    // Developer Debug Toggle
    const [showDebug, setShowDebug] = useState(false)

    const chatEndRef = useRef(null)

    useEffect(() => {
        fetchBasket()
        fetchGreeting()
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [chatMessages, chatOpen])

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    async function fetchBasket() {
        try {
            const res = await fetch(`${API_BASE}/basket`)
            const data = await res.json()
            setItems(data.items || [])
        } catch (e) {
            console.error('Basket Load Failed:', e)
        }
    }

    async function fetchGreeting() {
        try {
            const res = await fetch(`${API_BASE}/chat/greeting`)
            const data = await res.json()
            setChatMessages([{
                role: 'assistant',
                content: data.content,
                diff: data.diff
            }])
            if (data.suggestions) setSuggestions(data.suggestions)
        } catch (e) {
            setChatMessages([{
                role: 'assistant',
                content: '안녕하세요! 👋 저는 똑장 AI 비서예요.\n장바구니 구성을 도와드릴까요?',
            }])
        }
    }

    async function sendMessage(text) {
        const msg = text || message
        if (!msg.trim()) return

        setChatMessages(prev => [...prev, { role: 'user', content: msg }])
        setMessage('')
        setIsLoading(true)

        // Scroll immediately to show user message
        setTimeout(scrollToBottom, 50)

        try {
            const res = await fetch(`${API_BASE}/chat/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg }),
            })
            const data = await res.json()

            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: data.content,
                diff: data.diff,
            }])

            if (data.suggestions) setSuggestions(data.suggestions)
            await fetchBasket()
        } catch (e) {
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ 오류가 발생했어요. 다시 시도해주세요.',
            }])
        } finally {
            setIsLoading(false)
        }
    }

    async function applyDiff(diff) {
        // Optimistic UI update or just wait for fetch
        for (const d of diff) {
            try {
                if (d.action === 'add') {
                    await fetch(`${API_BASE}/basket`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(d.item),
                    })
                } else if (d.action === 'remove') {
                    await fetch(`${API_BASE}/basket/${encodeURIComponent(d.item.item_name)}`, {
                        method: 'DELETE',
                    })
                }
            } catch (e) {
                console.error('Apply Failed:', e)
            }
        }
        await fetchBasket()

        // Add completion message
        setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: '✅ 장바구니에 적용했습니다!'
        }])
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    // --- Render Helpers ---

    const renderDiffCard = (diff) => {
        if (!diff || diff.length === 0) return null

        return (
            <div className="proposal-card animate-slide-up">
                <div className="proposal-header">
                    <span className="proposal-icon">📋</span>
                    <span className="proposal-title">변경 제안</span>
                </div>
                <div className="proposal-list">
                    {diff.map((d, i) => (
                        <div key={i} className={`proposal-item ${d.action}`}>
                            <div className="proposal-left">
                                <span className={`action-badge ${d.action}`}>
                                    {d.action === 'add' ? '+' : d.action === 'remove' ? '−' : '⇄'}
                                </span>
                                <div className="item-details">
                                    <div className="item-main">
                                        {d.item.brand && <span className="brand-tag">{d.item.brand}</span>}
                                        <span className="item-name">{d.item.item_name}</span>
                                    </div>
                                    <div className="item-sub">
                                        {d.item.size} · {d.item.quantity}개
                                    </div>
                                </div>
                            </div>
                            {d.reason && (
                                <div className="proposal-reason">
                                    {d.reason.includes('선호') ? '❤️ ' + d.reason : d.reason}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="proposal-actions">
                    <button className="btn-action primary" onClick={() => applyDiff(diff)}>
                        적용하기
                    </button>
                    <button className="btn-action secondary">
                        취소
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="page basket-page">
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate('/')}>←</button>
                <h1>장바구니</h1>
                <div className="header-actions">
                    <button className="btn-icon" onClick={() => setShowDebug(!showDebug)}>🐞</button>
                </div>
            </header>

            <main className="basket-content">
                {items.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-visual">🛒</div>
                        <p>장바구니가 비어있어요.</p>
                        <span className="empty-sub">하단 채팅으로 상품을 추가해보세요!</span>
                    </div>
                ) : (
                    <div className="basket-list">
                        {items.map((item, i) => (
                            <div key={i} className="basket-item-card animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                <input type="checkbox" defaultChecked className="item-check" />
                                <div className="item-info">
                                    <div className="item-badges">
                                        {item.mode === 'recommend' && <span className="badge ai">✨ AI 추천</span>}
                                        {item.mode === 'fixed' && <span className="badge fixed">🔒 브랜드 고정</span>}
                                    </div>
                                    <div className="item-row-main">
                                        {item.brand && <span className="item-brand">{item.brand}</span>}
                                        <span className="item-title">{item.item_name}</span>
                                    </div>
                                    <div className="item-row-sub">
                                        {item.size} · {item.quantity}개
                                    </div>
                                </div>
                                <button className="btn-remove">×</button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Chat Interface Layer */}
            <div className={`chat-layer ${chatOpen ? 'open' : 'minimized'}`}>
                {/* Minimized Header */}
                {!chatOpen && (
                    <div className="chat-minimized-bar" onClick={() => setChatOpen(true)}>
                        <span className="ai-avt">🤖</span>
                        <span className="minimized-text">AI 비서에게 장보기 부탁하기</span>
                        <span className="chevron">↑</span>
                    </div>
                )}

                {/* Expanded Chat */}
                {chatOpen && (
                    <div className="chat-interface">
                        <div className="chat-header-bar" onClick={() => setChatOpen(false)}>
                            <div className="drag-handle"></div>
                            <span className="header-title">AI Shopping Assistant</span>
                        </div>

                        <div className="chat-scroll-area">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`message-row ${msg.role}`}>
                                    {msg.role === 'assistant' && <div className="ai-avatar">🤖</div>}
                                    <div className="message-bubble">
                                        <div className="msg-text">
                                            {msg.content}
                                            {showDebug && <pre className="debug-pre">{JSON.stringify(msg, null, 2)}</pre>}
                                        </div>
                                        {/* Render Diff Card Here */}
                                        {renderDiffCard(msg.diff)}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="message-row assistant">
                                    <div className="ai-avatar">🤖</div>
                                    <div className="message-bubble loading">
                                        <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Suggestions Chips */}
                        <div className="suggestions-area">
                            {suggestions.map((s, i) => (
                                <button key={i} className="chip-btn" onClick={() => sendMessage(s)}>
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="input-area">
                            <input
                                type="text"
                                className="chat-input"
                                placeholder="무엇을 담을까요?"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                className="btn-send"
                                onClick={() => sendMessage()}
                                disabled={!message.trim()}
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Action Button (Analysis) */}
            <div className={`fab-container ${items.length > 0 ? 'visible' : ''}`}>
                <button className="btn-analyze" onClick={() => navigate('/analysis')}>
                    ⚡ 최저가 분석하기 ({items.length})
                </button>
            </div>
        </div>
    )
}
