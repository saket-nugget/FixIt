import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function History() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const storedHistory = localStorage.getItem('fixit_history');
        if (storedHistory) {
            try {
                setHistory(JSON.parse(storedHistory).reverse()); // Newest first
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const handleClearHistory = () => {
        if (window.confirm("Are you sure you want to clear all history?")) {
            localStorage.removeItem('fixit_history');
            setHistory([]);
        }
    };

    const viewDiagnosis = (item) => {
        localStorage.setItem('fixit_diagnosis', JSON.stringify(item));
        navigate('/results');
    };

    return (
        <div className="bg-[#f8f7f5] dark:bg-[#121212] font-sans min-h-screen text-[#111418] dark:text-white w-full overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#f9a824] text-3xl">history</span>
                        Diagnostic Logs
                    </h1>
                    {history.length > 0 && (
                        <button
                            onClick={handleClearHistory}
                            className="text-red-500 hover:text-red-600 text-xs font-bold uppercase tracking-wider flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            Clear Log
                        </button>
                    )}
                </div>

                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center opacity-50 border-2 border-dashed border-[#4a3a21] rounded-3xl bg-[#1a1612]/50">
                        <span className="material-symbols-outlined text-6xl mb-4 text-[#4a3a21]">history_toggle_off</span>
                        <p className="text-xl font-medium text-white/50">No scan history found</p>
                        <Link to="/scan" className="mt-6 px-6 py-2 bg-[#f9a824] text-[#1a150b] rounded-full font-bold uppercase text-sm hover:scale-105 transition-transform">
                            Start New Scan
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {history.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => viewDiagnosis(item)}
                                className="group bg-[#1a1612] hover:bg-[#231b0f] p-5 rounded-2xl border border-[#333333] hover:border-[#f9a824]/50 cursor-pointer transition-all shadow-lg hover:shadow-[0_4px_20px_rgba(249,168,36,0.1)] flex flex-col gap-4 relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="size-12 rounded-xl bg-gradient-to-br from-[#f9a824]/20 to-[#f9a824]/5 flex items-center justify-center text-[#f9a824] group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined">build</span>
                                    </div>
                                    <span className="text-xs font-mono text-[#637588] dark:text-[#9ca3af] bg-[#2c241b] px-2 py-1 rounded-md border border-[#4a3a21]">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-white truncate mb-1 group-hover:text-[#f9a824] transition-colors">{item.diagnosis}</h3>
                                    <p className="text-sm text-[#9ca3af] line-clamp-2 leading-relaxed">{item.rootCause}</p>
                                </div>

                                <div className="pt-4 border-t border-[#333333] group-hover:border-[#4a3a21] transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-16 bg-[#333333] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#f9a824]" style={{ width: `${item.confidence}%` }}></div>
                                        </div>
                                        <span className="text-xs font-bold text-[#f9a824]">{item.confidence}%</span>
                                    </div>
                                    <span className="material-symbols-outlined text-[#637588] group-hover:text-white group-hover:translate-x-1 transition-all text-sm">arrow_forward</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
