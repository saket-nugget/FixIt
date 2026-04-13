import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const navigate = useNavigate();
    const [apiKey, setApiKey] = useState('');
    const [historyCount, setHistoryCount] = useState(0);
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        // Load existing API key from localStorage if available
        const storedKey = localStorage.getItem('fixit_api_key');
        if (storedKey) setApiKey(storedKey);

        // Get history count
        const history = JSON.parse(localStorage.getItem('fixit_history') || '[]');
        setHistoryCount(history.length);
    }, []);

    const handleSaveKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem('fixit_api_key', apiKey.trim());
            setSaveStatus('Saved!');
            setTimeout(() => setSaveStatus(''), 2000);
        } else {
            localStorage.removeItem('fixit_api_key');
            setSaveStatus('Cleared!');
            setTimeout(() => setSaveStatus(''), 2000);
        }
    };

    const handleClearHistory = () => {
        if (window.confirm("Are you sure you want to delete all diagnostic logs? This action cannot be undone.")) {
            localStorage.removeItem('fixit_history');
            localStorage.removeItem('fixit_diagnosis'); // Clear active diagnosis too
            setHistoryCount(0);
            alert("History cleared successfully.");
        }
    };

    return (
        <div className="bg-[#f8f7f5] dark:bg-[#121212] font-sans min-h-screen text-[#111418] dark:text-white w-full overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-8 py-8 space-y-8">
                <div className="flex items-center gap-4 border-b border-[#4a3a21]/20 pb-6">
                    <div className="size-12 rounded-2xl bg-[#f9a824] flex items-center justify-center text-[#1a150b] shadow-lg">
                        <span className="material-symbols-outlined text-3xl">settings</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">Settings</h1>
                        <p className="text-[#637588] dark:text-[#9ca3af]">Manage your preferences and data</p>
                    </div>
                </div>

                {/* API Configuration */}
                <section className="bg-white dark:bg-[#1a1612] rounded-2xl p-6 border border-[#e5e7eb] dark:border-[#333333] shadow-sm">
                    <div className="flex items-start gap-4 mb-6">
                        <span className="material-symbols-outlined text-[#f9a824] text-2xl">key</span>
                        <div>
                            <h2 className="text-xl font-bold">API Configuration</h2>
                            <p className="text-sm text-[#637588] dark:text-[#9ca3af]">Manage your Gemini API key</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#637588] dark:text-[#9ca3af]">Gemini API Key</label>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your Google Gemini API Key"
                                    className="flex-1 bg-[#f8f7f5] dark:bg-[#231b0f] border border-[#e5e7eb] dark:border-[#4a3a21] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#f9a824] transition-colors"
                                />
                                <button
                                    onClick={handleSaveKey}
                                    className="bg-[#1a1612] dark:bg-[#f9a824] text-white dark:text-[#1a150b] px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity min-w-[100px]"
                                >
                                    {saveStatus || 'Save'}
                                </button>
                            </div>
                            <p className="text-xs text-[#637588] dark:text-[#9ca3af]">
                                Your key is stored locally on your device. Never share your API key.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Data Management */}
                <section className="bg-white dark:bg-[#1a1612] rounded-2xl p-6 border border-[#e5e7eb] dark:border-[#333333] shadow-sm">
                    <div className="flex items-start gap-4 mb-6">
                        <span className="material-symbols-outlined text-red-500 text-2xl">database</span>
                        <div>
                            <h2 className="text-xl font-bold">Data Management</h2>
                            <p className="text-sm text-[#637588] dark:text-[#9ca3af]">Control your local diagnostic data</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#f8f7f5] dark:bg-[#231b0f] rounded-xl border border-[#e5e7eb] dark:border-[#4a3a21]">
                        <div>
                            <h3 className="font-bold">Clear Diagnostic History</h3>
                            <p className="text-xs text-[#637588] dark:text-[#9ca3af] mt-1">Currently storing <span className="text-[#f9a824] font-bold">{historyCount}</span> logs</p>
                        </div>
                        <button
                            onClick={handleClearHistory}
                            disabled={historyCount === 0}
                            className="text-red-500 hover:text-red-400 font-bold text-sm uppercase tracking-wider px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Delete All
                        </button>
                    </div>
                </section>

                {/* About */}
                <section className="text-center pt-8">
                    <div className="inline-flex items-center justify-center size-12 rounded-full bg-[#f9a824]/10 mb-4">
                        <span className="material-symbols-outlined text-[#f9a824]">construction</span>
                    </div>
                    <h3 className="font-black text-xl uppercase tracking-widest text-[#1a150b] dark:text-white">FixIt AI</h3>
                    <p className="text-sm text-[#637588] dark:text-[#9ca3af] font-mono mt-1">v1.2.0 • Build 2024.05</p>
                    <div className="mt-4 flex justify-center gap-4 text-xs font-bold uppercase tracking-wider text-[#637588] dark:text-[#9ca3af]">
                        <a href="#" className="hover:text-[#f9a824]">Privacy Policy</a>
                        <span>•</span>
                        <a href="#" className="hover:text-[#f9a824]">Terms of Service</a>
                    </div>
                </section>
            </main>
        </div>
    );
}
