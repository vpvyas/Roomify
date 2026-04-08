import React, { useState, useEffect, useRef } from 'react';
import '../styles/Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('home');
    const [messages, setMessages] = useState([{ type: 'bot', text: "Hi! 👋 How can I help you today?" }]);
    const [dims, setDims] = useState({ w: 370, h: 500 });
    const chatEndRef = useRef(null);

    // ADMIN CONTACT DETAILS
    const adminContact = {
        phone: "+919876543210",
        whatsapp: "919876543210", 
        sms: "+919876543210"
    };

    const qaData = [
        { q: "Where are Roomify PGs located?", r: "We are mostly located near major IT hubs, colleges, and metro stations for easy commuting!" },
        { q: "What are the price ranges?", r: "Our PGs range from ₹5,000 (shared) to ₹18,000 (premium private) per month." },
        { q: "How do I rent a PG?", r: "1. Click 'Reserve'. 2. Fill the form. 3. Owner directly communicates with you. 4. Pay & get your digital receipt!" },
        { q: "Are bills included?", r: "Check the 'Additional Charges' on the PG page; every owner has different rules for electricity." },
        { q: "How do I request repairs?", r: "Use the dashboard to report maintenance issues directly to the owner." },
        { q: "Is it safe for students?", r: "Yes! Most PGs have CCTV and gated entry in safe neighborhoods." },
        { q: "How do I get my receipt?", r: "Once the owner confirms payment, they generate a receipt on your dashboard instantly." }
    ];

    // PAINT-STYLE RESIZE LOGIC
    const handleResize = (mouseDownEvent) => {
        const startX = mouseDownEvent.clientX;
        const startY = mouseDownEvent.clientY;
        const startW = dims.w;
        const startH = dims.h;

        const onMouseMove = (mouseMoveEvent) => {
            const newW = startW + (startX - mouseMoveEvent.clientX);
            const newH = startH + (startY - mouseMoveEvent.clientY);
            setDims({
                w: Math.max(newW, 370), 
                h: Math.max(newH, 500) 
            });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleQuestionClick = (q, r) => {
        setView('chat');
        setMessages([...messages, { type: 'user', text: q }, { type: 'bot', text: r }]);
    };

    const openHelpDesk = () => {
        setView('chat');
        setMessages([...messages, 
            { type: 'user', text: "I need to contact the Help Desk" },
            { type: 'bot', text: "Connecting to Admins... You can reach them via Call, WhatsApp, or SMS below:" }
        ]);
    };

    return (
        <div className="chatbot-root">
            <button className="roomify-chat-trigger" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div 
                    className="roomify-chat-window" 
                    style={{ width: `${dims.w}px`, height: `${dims.h}px` }}
                >
                    {/* RESIZE HANDLE */}
                    <div className="resize-handle" onMouseDown={handleResize}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                    </div>

                    <div className="chat-header-large">
                        <div className="header-logo">🏠 Roomify</div>
                        <h1>Hello there!</h1>
                        <p>Welcome to Roomify Assistant</p>
                    </div>

                    <div className="chat-content-area">
                        {/* VIEW 1: HOME */}
                        {view === 'home' && (
                            <div className="home-view">
                                <div className="menu-card" onClick={() => setView('faq')}>
                                    <h3>Frequently Asked Questions 🔍</h3>
                                    <div className="card-sub">
                                        <div className="avatar-circle orange">F</div>
                                        <p>Find answers to common questions instantly.</p>
                                    </div>
                                </div>
                                <div className="menu-card" onClick={openHelpDesk}>
                                    <h3>Roomify Help Desk 🎧</h3>
                                    <div className="card-sub">
                                        <div className="avatar-circle">A</div>
                                        <p>Contact our Admins for direct support.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VIEW 2: FAQ */}
                        {view === 'faq' && (
                            <div className="faq-view">
                                <div className="sticky-nav">
                                    <button className="back-btn" onClick={() => setView('home')}>← Back</button>
                                </div>
                                <div className="questions-scroll-list">
                                    {qaData.map((item, i) => (
                                        <button key={i} className="faq-item" onClick={() => handleQuestionClick(item.q, item.r)}>
                                            {item.q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* VIEW 3: CHAT */}
                        {view === 'chat' && (
                            <div className="chat-view">
                                <div className="sticky-nav">
                                    <button className="back-btn" onClick={() => setView('home')}>← Back</button>
                                </div>
                                <div className="chat-messages">
                                    {messages.map((m, i) => (
                                        <div key={i} className={`msg ${m.type}`}>
                                            {m.text}
                                            {m.text.includes("Admins") && (
                                                <div className="contact-actions">
                                                    <a href={`tel:${adminContact.phone}`} className="action-btn call">📞 Call Admin</a>
                                                    <a href={`https://wa.me/${adminContact.whatsapp}`} target="_blank" rel="noreferrer" className="action-btn wa">🟢 WhatsApp</a>
                                                    <a href={`sms:${adminContact.sms}`} className="action-btn sms">💬 Send SMS</a>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="chat-footer-brand">Powered by <span>Roomify</span></div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;