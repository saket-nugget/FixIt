import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Results() {
    const navigate = useNavigate();
    const location = useLocation();
    const fixesRef = useRef(null);
    const [diagnosis, setDiagnosis] = useState(null);
    const videoUrl = location.state?.videoUrl;

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

    if (!diagnosis) {
        return (
            <div className="min-h-screen bg-[#231b0f] flex items-center justify-center text-white">
                <div className="text-center">
                    <p className="mb-4">No diagnosis results found.</p>
                    <Link to="/scan" className="text-[#f9a824] hover:underline">Start a new scan</Link>
                </div>
            </div>
        );
    }

    // Generate a stable ID based on diagnosis length or content
    const diagnosisId = diagnosis.diagnosis ? Math.abs(diagnosis.diagnosis.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)) % 10000 : 8922;

    return (
        <div className="bg-[#f8f7f5] dark:bg-[#231b0f] font-sans min-h-screen flex flex-col overflow-x-hidden">
            <Navbar />

            <main className="flex-1 flex flex-col items-center w-full px-4 py-8 md:px-10 lg:px-40">
                <div className="w-full max-w-[1024px] flex flex-col gap-8">

                    {/* Video Replay Section */}
                    <section className="w-full rounded-lg overflow-hidden border border-[#4a3a21] shadow-xl bg-[#1a150b]">
                        <div className="relative w-full aspect-video bg-neutral-900 group">
                            {videoUrl ? (
                                <video
                                    src={videoUrl}
                                    controls
                                    autoPlay
                                    loop
                                    className="absolute inset-0 w-full h-full object-contain bg-black"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDjTQhaCP5a59zgHwbRjzmY0halQtoBwbN1kvFpoxoXX2QG-m6Kfg0AScAPiJnD1ctZehlI8R2MHhBfJX1UxwfgArtEikACP1A-qATU4oEf0IpnRRBis7t75LjPU2oRmdlvjKwh_EdDWzzWDDlNLMRpPKd4KDWhJlQh0k_sN1xr5pXh0bsim68tQkIvgs0uipsN9LkdyTZcLrRWQc0V5X1KLzEMGLhv-4YPdl9KgpqopicY8oH0jeAR0hiyEztll2PqX-q8J5edkA")' }}></div>
                            )}

                            {/* Overlay Controls (Only show if no video or if we want custom controls overlay, but native controls are better for user video) */}
                            {!videoUrl && (
                                <div className="absolute inset-0 flex flex-col justify-between p-6 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none">
                                    <div className="flex justify-between items-start">
                                        <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded border border-white/10 flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-red-500 animate-pulse"></span>
                                            <span className="text-xs font-mono text-white/80">REC • Analysis_Replay.mp4</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className="flex items-center justify-center rounded-full size-20 bg-[#f9a824]/90 text-[#1a150b] shadow-[0_0_20px_rgba(249,168,36,0.3)]">
                                            <span className="material-symbols-outlined !text-[40px] fill-1">play_arrow</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Diagnostic Card Section */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#2d2417] border border-[#4a3a21] rounded-lg p-6 md:p-8 shadow-2xl relative overflow-hidden">
                        {/* Decorative Industrial Stripe */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f9a824]/50 to-transparent"></div>
                        <div className="absolute top-0 left-8 w-32 h-[2px] bg-[#f9a824]"></div>

                        {/* Left Col: Status & Score */}
                        <div className="lg:col-span-4 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-[#4a3a21] pb-6 lg:pb-0 lg:pr-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f9a824]/10 border border-[#f9a824]/20 rounded text-[#f9a824] text-xs font-bold tracking-wider mb-2">
                                    <span className="material-symbols-outlined !text-sm">analytics</span>
                                    ANALYSIS COMPLETE
                                </div>
                                <p className="text-[#ccb58e] text-sm mt-2 font-mono">ID: #DX-{diagnosisId}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-white/60 text-sm font-medium tracking-widest uppercase">Confidence Score</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-6xl font-bold text-[#f9a824] tracking-tighter">{diagnosis.confidence}</span>
                                    <span className="text-2xl font-bold text-[#f9a824]/80">%</span>
                                </div>
                                <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-[#f9a824] shadow-[0_0_10px_rgba(249,168,36,0.5)]" style={{ width: `${diagnosis.confidence}%` }}></div>
                                </div>
                                <p className="text-[#ccb58e] text-sm flex items-center gap-2 mt-1">
                                    <span className="material-symbols-outlined !text-sm text-green-500">check_circle</span>
                                    High reliability match
                                </p>
                            </div>
                            <div className="mt-auto pt-4">
                                <div className="bg-black/20 p-4 rounded border border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-white/50 uppercase font-semibold">Visual Observations</span>
                                        <span className="material-symbols-outlined !text-sm text-white/30">visibility</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {diagnosis.visualEvidence ? (
                                            diagnosis.visualEvidence.map((item, i) => (
                                                <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-white/80 border border-white/10">
                                                    {item}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-white/40 italic">No specific visual cues noted.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Diagnosis & Action */}
                        <div className="lg:col-span-8 flex flex-col gap-6 pl-0 lg:pl-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-red-500/10 rounded border border-red-500/20 text-red-500 mt-1">
                                    <span className="material-symbols-outlined">warning</span>
                                </div>
                                <div>
                                    <span className="text-red-400 text-sm font-bold tracking-widest uppercase mb-1 block">Root Cause Identified</span>
                                    <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight uppercase tracking-tight">{diagnosis.diagnosis}</h1>
                                    <p className="text-[#ccb58e] mt-2 max-w-xl">
                                        {diagnosis.rootCause}
                                    </p>
                                </div>
                            </div>
                            <div className="h-px w-full bg-[#4a3a21]"></div>
                            <div className="space-y-4" ref={fixesRef}>
                                <h3 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined !text-lg text-[#f9a824]">build</span>
                                    Recommended Fixes
                                </h3>
                                <ul className="space-y-3">
                                    {diagnosis.fixes && diagnosis.fixes.map((fix, index) => (
                                        <li key={index} className="flex items-start gap-3 bg-white/5 p-3 rounded border border-white/5 hover:border-[#f9a824]/30 transition-colors">
                                            <span className="flex items-center justify-center size-6 rounded bg-[#f9a824]/20 text-[#f9a824] text-xs font-bold font-mono">{index + 1}</span>
                                            <span className="text-white text-sm font-medium">{fix}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-4 flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={() => navigate('/chat', { state: { startGuide: true } })}
                                    className="flex-1 bg-[#f9a824] hover:bg-[#f9a824]/90 text-[#1a150b] font-bold py-3 px-6 rounded text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                                >
                                    <span className="material-symbols-outlined">menu_book</span>
                                    Start Repair Guide
                                </button>
                                <Link to="/chat" className="flex-1 bg-transparent border-2 border-[#f9a824] text-[#f9a824] hover:bg-[#f9a824]/10 font-bold py-3 px-6 rounded text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-colors">
                                    <span className="material-symbols-outlined">smart_toy</span>
                                    Ask Mechanic AI
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}