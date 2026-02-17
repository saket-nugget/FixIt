import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalScans: 0,
        lastScan: 'Never',
        status: 'Online'
    });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('fixit_history') || '[]');

        setStats({
            totalScans: history.length,
            lastScan: history.length > 0 ? new Date(history[history.length - 1].timestamp).toLocaleDateString() : 'Never',
            status: 'Online'
        });

        // Get last 3 items, reversed
        setRecentActivity(history.slice(-3).reverse());
    }, []);

    const handleManuals = () => {
        alert("Manuals database is currently being updated. Please check back later.");
    };

    const viewDiagnosis = (item) => {
        localStorage.setItem('fixit_diagnosis', JSON.stringify(item));
        navigate('/results');
    };

    return (
        <div className="bg-[#f8f7f5] dark:bg-[#121212] font-sans min-h-screen text-[#111418] dark:text-white flex flex-col w-full overflow-x-hidden">
            <Navbar />

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#333333] shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold uppercase text-[#637588] dark:text-[#9ca3af] tracking-wider">System Status</span>
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                        </div>
                        <div className="text-3xl font-bold text-[#111418] dark:text-white mb-1">{stats.status}</div>
                        <div className="text-sm text-[#637588] dark:text-[#9ca3af]">All services operational</div>
                    </div>

                    <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#333333] shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold uppercase text-[#637588] dark:text-[#9ca3af] tracking-wider">Total Scans</span>
                            <span className="material-symbols-outlined text-[#f9a824]">history</span>
                        </div>
                        <div className="text-3xl font-bold text-[#111418] dark:text-white mb-1">{stats.totalScans}</div>
                        <div className="text-sm text-[#637588] dark:text-[#9ca3af]">Lifetime diagnoses</div>
                    </div>

                    <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#333333] shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold uppercase text-[#637588] dark:text-[#9ca3af] tracking-wider">Last Activity</span>
                            <span className="material-symbols-outlined text-blue-500">calendar_today</span>
                        </div>
                        <div className="text-3xl font-bold text-[#111418] dark:text-white mb-1">{stats.lastScan}</div>
                        <div className="text-sm text-[#637588] dark:text-[#9ca3af]">Most recent scan date</div>
                    </div>
                </div>

                {/* Main Action Area */}
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Ready to Diagnose</h1>
                    <p className="text-[#637588] dark:text-[#9ca3af] mb-12 max-w-md">
                        Use the camera to scan machinery or upload a video for instant AI diagnosis.
                    </p>

                    <div className="relative group">
                        <div className="absolute inset-0 bg-[#f9a824] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <Link
                            to="/scan"
                            className="relative flex flex-col items-center justify-center size-48 rounded-full bg-[#f9a824] hover:bg-[#ffb649] text-[#1a150b] transition-transform hover:scale-105 shadow-2xl"
                        >
                            <span className="material-symbols-outlined text-6xl mb-2">shutter_speed</span>
                            <span className="font-black uppercase tracking-widest text-sm">Scan Machine</span>
                        </Link>
                    </div>
                </div>

                {/* Bottom Section: Recent Activity & Tools */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activity */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold uppercase tracking-wide">Recent Activity</h3>
                            <Link to="/history" className="text-xs font-bold text-[#f9a824] hover:underline uppercase">View All</Link>
                        </div>

                        <div className="space-y-3">
                            {recentActivity.length === 0 ? (
                                <div className="p-6 rounded-xl border border-dashed border-[#e5e7eb] dark:border-[#333333] text-center">
                                    <p className="text-[#637588] dark:text-[#9ca3af] text-sm">No recent activity. Start a scan to see history here.</p>
                                </div>
                            ) : (
                                recentActivity.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => viewDiagnosis(item)}
                                        className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl border border-[#e5e7eb] dark:border-[#333333] hover:border-[#f9a824] cursor-pointer transition-colors flex items-center gap-4"
                                    >
                                        <div className="size-10 rounded-lg bg-[#f9a824]/10 flex items-center justify-center text-[#f9a824]">
                                            <span className="material-symbols-outlined text-sm">build</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm truncate">{item.diagnosis}</h4>
                                            <p className="text-xs text-[#637588] dark:text-[#9ca3af] truncate">{new Date(item.timestamp).toLocaleDateString()}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-[#637588] dark:text-[#9ca3af] text-sm">chevron_right</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Tools */}
                    <div>
                        <h3 className="font-bold uppercase tracking-wide mb-4">Quick Tools</h3>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <div className="relative group">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f9a824] text-[#1a150b] text-[10px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    Scan History
                                </div>
                                <Link to="/history" className="flex flex-col items-center justify-center size-16 rounded-2xl bg-[#1E1E1E] border border-[#333333] hover:border-[#f9a824] hover:text-[#f9a824] transition-colors shadow-lg">
                                    <span className="material-symbols-outlined">history</span>
                                    <span className="text-[10px] font-bold mt-1 uppercase">History</span>
                                </Link>
                            </div>

                            <div className="relative group">
                                <Link to="/manuals" className="flex flex-col items-center justify-center size-16 rounded-2xl bg-[#1E1E1E] border border-[#333333] hover:border-[#f9a824] hover:text-[#f9a824] transition-colors shadow-lg">
                                    <span className="material-symbols-outlined">menu_book</span>
                                    <span className="text-[10px] font-bold mt-1 uppercase">Manuals</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}