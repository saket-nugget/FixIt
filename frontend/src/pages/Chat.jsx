import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { chatWithGemini } from '../services/geminiService';
import Navbar from '../components/Navbar';

export default function Chat() {
    const location = useLocation();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const stored = localStorage.getItem('fixit_diagnosis');
        if (stored) {
            try {
                setDiagnosis(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse diagnosis", e);
            }
        }
    }, []);

    useEffect(() => {
        if (diagnosis && messages.length === 0) {
            if (location.state?.startGuide) {
                setMessages([
                    {
                        role: 'model',
                        content: `**Interactive Repair Guide Mode Activated**\n\nI'm here to guide you through the repair for **${diagnosis.diagnosis}**.\n\nWe will go through the recommended fixes step-by-step.\n\n**Step 1:** ${diagnosis.fixes[0]}\n\nLet me know when you have completed this step or if you need more details.`
                    }
                ]);
            } else {
                setMessages([
                    {
                        role: 'model',
                        content: `FixIt AI Online. I have analyzed the diagnosis: **${diagnosis.diagnosis}**. Root cause: ${diagnosis.rootCause}. How can I assist you with the repair?`
                    }
                ]);
            }
        } else if (!diagnosis && messages.length === 0) {
            setMessages([
                {
                    role: 'model',
                    content: `FixIt AI Online. No active diagnosis found. Please run a scan first or describe the issue.`
                }
            ]);
        }
    }, [diagnosis, location.state]);

    const [isSaving, setIsSaving] = useState(false);
    const [manualTitle, setManualTitle] = useState('');
    const [manualCategory, setManualCategory] = useState('Custom');
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const systemPrompt = `You are FixIt AI. The user has a broken machine with this diagnosis: ${diagnosis ? JSON.stringify(diagnosis) : 'Unknown'}. Help them fix it. Keep responses concise and technical but helpful.`;
            const history = messages;
            const response = await chatWithGemini(history, input, systemPrompt);
            setMessages(prev => [...prev, { role: 'model', content: response }]);
        } catch (error) {
            console.error("Chat error", error);
            setMessages(prev => [...prev, { role: 'model', content: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveManual = () => {
        if (!manualTitle.trim()) return;

        const newManual = {
            id: Date.now(),
            title: manualTitle,
            category: manualCategory,
            date: new Date().toISOString().split('T')[0],
            size: `${(JSON.stringify(messages).length / 1024).toFixed(1)} KB`,
            icon: "menu_book", // Custom icon
            content: messages,
            isCustom: true
        };

        const existingManuals = JSON.parse(localStorage.getItem('fixit_custom_manuals_v2') || '[]');
        localStorage.setItem('fixit_custom_manuals_v2', JSON.stringify([...existingManuals, newManual]));

        setIsSaving(false);
        setManualTitle('');
        alert("Manual saved successfully! You can find it in the Manuals library.");
    };

    const toggleListening = () => {
        if (isListening) {
            setIsListening(false);
            window.speechRecognitionInstance?.stop();
        } else {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Your browser does not support speech recognition. Try using Chrome or Edge.");
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(prev => (prev ? prev + ' ' + transcript : transcript));
            };

            window.speechRecognitionInstance = recognition;
            recognition.start();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setInput(prev => prev + ` [Attached: ${file.name}] `);
        }
    };

    return (
        <div className="bg-[#f8f7f5] dark:bg-[#121212] text-slate-900 dark:text-white font-sans h-screen flex flex-col overflow-hidden">
            <Navbar />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar (Desktop) */}
                <aside className="w-80 bg-[#1a1612] border-r border-[#4a3a21] hidden lg:flex flex-col flex-shrink-0 z-10">
                    <div className="p-5">
                        <h3 className="text-[#ccb58e] text-xs font-bold uppercase tracking-widest mb-4 pl-2">Active Sessions</h3>
                        <div className="flex flex-col gap-2">
                            <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#4a3a21]/50 border border-[#f9a824]/20 text-white shadow-sm hover:bg-[#4a3a21] transition-colors">
                                <span className="material-symbols-outlined text-[#f9a824]">build_circle</span>
                                <div className="flex flex-col items-start min-w-0">
                                    <span className="text-sm font-bold truncate w-40 text-left">{diagnosis ? diagnosis.diagnosis : "New Session"}</span>
                                    <span className="text-xs text-[#ccb58e]">#LOG-8922 • Active</span>
                                </div>
                            </button>
                        </div>

                        <div className="mt-auto pt-6 border-t border-[#4a3a21]/50">
                            <button
                                onClick={() => setIsSaving(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#f9a824] text-[#1a150b] font-bold uppercase tracking-wide hover:bg-[#ffb649] transition-colors"
                            >
                                <span className="material-symbols-outlined">save</span>
                                Save as Manual
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Chat Area */}
                <main className="flex-1 flex flex-col relative min-w-0 bg-[#0c0a08]">
                    {/* Save Modal */}
                    {isSaving && (
                        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-[#1a1612] border border-[#4a3a21] rounded-2xl p-6 w-full max-w-md shadow-2xl">
                                <h2 className="text-xl font-bold text-white mb-1">Save Repair Manual</h2>
                                <p className="text-sm text-[#9ca3af] mb-4">Create a permanent guide from this session.</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-[#ccb58e] uppercase tracking-wider block mb-1">Manual Title</label>
                                        <input
                                            type="text"
                                            value={manualTitle}
                                            onChange={(e) => setManualTitle(e.target.value)}
                                            placeholder="e.g., Conveyor Belt Jam Fix"
                                            className="w-full bg-[#0c0a08] border border-[#4a3a21] rounded-lg px-4 py-3 text-white focus:border-[#f9a824] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[#ccb58e] uppercase tracking-wider block mb-1">Category</label>
                                        <select
                                            value={manualCategory}
                                            onChange={(e) => setManualCategory(e.target.value)}
                                            className="w-full bg-[#0c0a08] border border-[#4a3a21] rounded-lg px-4 py-3 text-white focus:border-[#f9a824] outline-none"
                                        >
                                            <option value="Custom">Custom</option>
                                            <option value="Machinery">Machinery</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Plumbing">Plumbing</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setIsSaving(false)}
                                            className="flex-1 px-4 py-3 rounded-xl border border-[#4a3a21] text-gray-400 hover:text-white hover:bg-[#4a3a21]/50 font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveManual}
                                            disabled={!manualTitle.trim()}
                                            className="flex-1 px-4 py-3 rounded-xl bg-[#f9a824] text-[#1a150b] font-bold hover:bg-[#ffb649] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Save Library
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
                        <div className="flex justify-center">
                            <span className="bg-[#2c241b] text-[#ccb58e] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#4a3a21]">Today</span>
                        </div>

                        {messages.map((msg, index) => (
                            <div key={index} className={`flex gap-4 max-w-4xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className="flex-shrink-0">
                                    {msg.role === 'model' ? (
                                        <div className="size-10 rounded-full bg-gradient-to-br from-[#2c241b] to-black flex items-center justify-center border border-[#4a3a21] shadow-lg">
                                            <span className="material-symbols-outlined text-[#f9a824] text-xl">smart_toy</span>
                                        </div>
                                    ) : (
                                        <div className="size-10 rounded-full bg-gradient-to-br from-[#f9a824] to-[#bfa05d] flex items-center justify-center border border-[#f9a824] shadow-lg text-[#1a150b]">
                                            <span className="material-symbols-outlined text-xl">person</span>
                                        </div>
                                    )}
                                </div>
                                <div className={`flex flex-col gap-1 max-w-[80%] md:max-w-[70%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-white/60 text-xs font-bold uppercase tracking-wider">{msg.role === 'model' ? 'FixIt Core' : 'You'}</span>
                                    </div>
                                    <div className={`${msg.role === 'model' ? 'bg-[#1e1a15] border-l-2 border-[#f9a824] rounded-r-2xl rounded-bl-2xl' : 'bg-[#f9a824] text-[#1a150b] rounded-l-2xl rounded-br-2xl'} p-4 md:p-5 shadow-md`}>
                                        <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                            {msg.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-4 max-w-4xl">
                                <div className="flex-shrink-0">
                                    <div className="size-10 rounded-full bg-gradient-to-br from-[#2c241b] to-black flex items-center justify-center border border-[#4a3a21] shadow-lg">
                                        <span className="material-symbols-outlined text-[#f9a824] text-xl">smart_toy</span>
                                    </div>
                                </div>
                                <div className="bg-[#1e1a15] border-l-2 border-[#f9a824] p-5 rounded-r-2xl rounded-bl-2xl shadow-md">
                                    <div className="flex gap-1">
                                        <span className="size-2 bg-[#f9a824] rounded-full animate-bounce"></span>
                                        <span className="size-2 bg-[#f9a824] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="size-2 bg-[#f9a824] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 md:p-6 z-20">
                        <div className="max-w-4xl mx-auto w-full relative">
                            <div className="flex items-end gap-2 bg-[#1a1612]/90 backdrop-blur-md p-2 pl-4 rounded-[2rem] border border-[#4a3a21] focus-within:border-[#f9a824]/50 focus-within:ring-1 focus-within:ring-[#f9a824]/20 transition-all shadow-2xl">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    onClick={toggleListening}
                                    className={`flex items-center justify-center size-10 rounded-full mr-1 transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-[#2c241b] hover:bg-[#3a2e1e] text-[#f9a824]'}`}
                                    title={isListening ? "Stop Listening" : "Voice Input"}
                                >
                                    <span className="material-symbols-outlined text-xl">{isListening ? 'mic_off' : 'mic'}</span>
                                </button>
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="flex items-center justify-center size-10 rounded-full bg-[#2c241b] hover:bg-[#3a2e1e] text-[#f9a824] transition-colors mb-1"
                                    title="Attach file"
                                >
                                    <span className="material-symbols-outlined text-xl">attach_file</span>
                                </button>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full bg-transparent border-none text-white placeholder-white/30 focus:ring-0 resize-none py-3 max-h-32 min-h-[48px]"
                                    placeholder="Describe the issue or ask for repair steps..."
                                    rows="1"
                                ></textarea>
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading}
                                    className="flex-shrink-0 bg-[#f9a824] hover:bg-[#ffb649] text-[#1a150b] size-10 rounded-full flex items-center justify-center transition-transform active:scale-95 mb-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(249,168,36,0.3)]"
                                    title="Send Message"
                                >
                                    <span className="material-symbols-outlined font-bold">arrow_upward</span>
                                </button>
                            </div>
                            <div className="text-center mt-3">
                                <p className="text-[10px] text-[#4a3a21] font-mono tracking-wider">SECURE CONNECTION • FIXIT CORE v4.2</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}