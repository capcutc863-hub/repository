'use client';
import React, { useState, useEffect, useRef } from 'react';
import type { User, ChatMessage } from '@/lib/types';
import { MessageSquare, X, Send } from 'lucide-react';

interface ChatWindowProps {
    currentUser: User;
    users: User[];
    onClose: () => void;
}

export function ChatWindow({ currentUser, users, onClose }: ChatWindowProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !currentUser) return;
        
        const msg: ChatMessage = {
            id: `msg_${Date.now()}`,
            senderId: currentUser.id,
            senderName: currentUser.nickname || currentUser.name,
            text: newMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, msg]);
        setNewMessage('');
    };

    const formatTimestamp = (ts: Date) => {
        if (!ts) return '';
        return ts.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div className="fixed bottom-10 left-10 w-96 h-[550px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col z-[500] animate-in slide-in-from-bottom overflow-hidden no-print">
            <div className="bg-emerald-900 p-6 text-white flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3"><MessageSquare className="w-5 h-5 text-emerald-400"/><h4 className="font-black">مجموعة الفريق</h4></div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-5 h-5"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/50">
                {messages.map(m => {
                    const sender = users.find(u => u.id === m.senderId);
                    const isCurrentUser = m.senderId === currentUser.id;

                    return (
                        <div key={m.id} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex-shrink-0 overflow-hidden shadow-sm">
                                {sender?.avatar ? <img src={sender.avatar} className="w-full h-full object-cover" alt="Sender Avatar" /> : <div className="w-full h-full flex items-center justify-center font-black text-emerald-800">{m.senderName[0]}</div>}
                            </div>
                            <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                <span className="text-[8px] font-black text-gray-400 mb-1 px-1 uppercase">{m.senderName} • {formatTimestamp(m.timestamp)}</span>
                                <div className={`p-4 rounded-2xl max-w-[200px] text-sm font-bold shadow-sm ${isCurrentUser ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white text-gray-700 rounded-bl-none border border-gray-100'}`}>{m.text}</div>
                            </div>
                        </div>
                    );
                })}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="اكتب رسالتك..." className="flex-1 p-4 bg-gray-50 rounded-2xl outline-none font-bold text-sm shadow-sm border focus:border-emerald-500 transition-all"/>
                <button onClick={handleSendMessage} className="bg-emerald-600 text-white p-4 rounded-2xl hover:bg-emerald-700 shadow-xl transition-all"><Send className="w-5 h-5"/></button>
            </div>
        </div>
    );
}
