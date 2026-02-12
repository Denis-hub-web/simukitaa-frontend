import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faBrain, faComment, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function AIBusinessIntelligence() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const getBaseUrl = () => {
        if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
        const hostname = window.location.hostname;
        return (hostname === 'localhost' || hostname === '127.0.0.1')
            ? 'http://localhost:5000/api'
            : `http://${hostname}:5000/api`;
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${getBaseUrl()}/ai/chat`,
                { message: input },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setMessages(prev => [...prev, { role: "assistant", content: response.data.message }]);
            } else {
                setMessages(prev => [...prev, { role: "assistant", content: "Samahani, sijaweza kupata jibu." }]);
            }
        } catch (error) {
            console.error("AI Error:", error);
            const errorMsg = error.response?.data?.message || error.message || "Hitilafu imetokea. Tafadhali jaribu tena.";
            setMessages(prev => [...prev, {
                role: "assistant",
                content: error.code === 'ERR_NETWORK'
                    ? "❌ Hakuna muunganisho na server."
                    : errorMsg
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const suggestedQuestions = [
        "Is iPhone 15 in stock?",
        "Nani ana loyalty points nyingi?",
        "Vipi biashara leo?",
        "How many repairs are pending?"
    ];

    return (
        <div style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            flexDirection: 'column',
            padding: '0'
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FontAwesomeIcon icon={faBrain} style={{ color: 'white', fontSize: '18px' }} />
                </div>
                <div>
                    <h1 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        margin: '0',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        SimuKitaa AI
                    </h1>
                    <p style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        margin: '0',
                        fontWeight: '500'
                    }}>
                        Your Intelligent Business Assistant
                    </p>
                </div>
            </div>

            {/* Chat Container */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '2rem 1rem',
                maxWidth: '900px',
                width: '100%',
                margin: '0 auto'
            }}>
                {messages.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: 'white',
                        padding: '3rem 1rem'
                    }}>
                        <FontAwesomeIcon icon={faBrain} style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.9 }} />
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Karibu! How can I help you today?
                        </h2>
                        <p style={{ fontSize: '0.95rem', opacity: 0.8, marginBottom: '2rem' }}>
                            Ask me anything about your business—stock, sales, repairs, customers, loyalty, and more.
                        </p>

                        {/* Suggested Questions */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '0.75rem',
                            maxWidth: '700px',
                            margin: '0 auto'
                        }}>
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(q)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        color: 'white',
                                        fontSize: '0.85rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <FontAwesomeIcon icon={faComment} style={{ opacity: 0.7 }} />
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            style={{
                                marginBottom: '1.5rem',
                                animation: 'fadeIn 0.3s ease-in',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}
                        >
                            {msg.role === 'user' ? (
                                <div style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    padding: '0.875rem 1.25rem',
                                    borderRadius: '18px',
                                    maxWidth: '80%',
                                    fontSize: '0.95rem',
                                    fontWeight: '500',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                }}>
                                    {msg.content}
                                </div>
                            ) : (
                                <div style={{
                                    background: 'white',
                                    borderRadius: '18px',
                                    padding: '1.25rem',
                                    maxWidth: '85%',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        fontSize: '0.95rem',
                                        lineHeight: '1.7',
                                        color: '#1e293b'
                                    }}>
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(msg.content, idx)}
                                        style={{
                                            position: 'absolute',
                                            top: '0.75rem',
                                            right: '0.75rem',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#64748b',
                                            fontSize: '0.85rem',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    >
                                        <FontAwesomeIcon icon={copiedIndex === idx ? faCheck : faCopy} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}

                {isTyping && (
                    <div style={{
                        background: 'white',
                        borderRadius: '18px',
                        padding: '1.25rem',
                        maxWidth: '85%',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        animation: 'fadeIn 0.3s ease-in'
                    }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div className="typing-dot" style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#667eea',
                                animation: 'typing 1.4s infinite'
                            }}></div>
                            <div className="typing-dot" style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#667eea',
                                animation: 'typing 1.4s infinite 0.2s'
                            }}></div>
                            <div className="typing-dot" style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#667eea',
                                animation: 'typing 1.4s infinite 0.4s'
                            }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(0,0,0,0.1)',
                padding: '1.5rem',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
            }}>
                <div style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'center'
                }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask anything about your business..."
                        style={{
                            flex: 1,
                            padding: '1rem 1.25rem',
                            fontSize: '0.95rem',
                            border: '2px solid #e2e8f0',
                            borderRadius: '14px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        style={{
                            background: input.trim() && !isTyping ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e2e8f0',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            padding: '1rem 1.5rem',
                            fontSize: '1rem',
                            cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s',
                            boxShadow: input.trim() && !isTyping ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                        }}
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes typing {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
                    30% { transform: translateY(-10px); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
