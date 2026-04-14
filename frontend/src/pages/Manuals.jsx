import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';

export default function Manuals() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [manuals, setManuals] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchManuals = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('search', searchTerm);
            if (selectedCategory !== 'All') queryParams.append('category', selectedCategory);
            
            const data = await apiFetch(`/manuals/?${queryParams.toString()}`);
            setManuals(data);
        } catch (err) {
            console.error("Failed to load manuals:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchManuals();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedCategory]);

    const categories = ['All', 'Machinery', 'Electronics', 'Hydraulics', 'Pneumatics', 'Vehicles', 'Custom'];

    const filteredManuals = manuals;

    const handleRead = (item) => {
        let content;
        try {
            content = JSON.parse(item.content);
        } catch (e) {
            content = [{ role: 'model', content: item.content }];
        }

        const contentWindow = window.open("", "_blank");
        if (contentWindow) {
            contentWindow.document.write(`
                <html>
                <head>
                    <title>${item.title}</title>
                    <style>
                        body { font-family: sans-serif; background: #0c0a08; color: #ddd; padding: 40px; max-width: 900px; margin: 0 auto; line-height: 1.6; }
                        h1 { color: #f9a824; border-bottom: 1px solid #4a3a21; padding-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; }
                        .meta { font-size: 0.8em; color: #ccb58e; margin-bottom: 40px; font-weight: bold; text-transform: uppercase; }
                        .msg { margin-bottom: 20px; padding: 25px; border-radius: 15px; border: 1px solid #4a3a21; }
                        .user { background: #1a1612; border-left: 4px solid #f9a824; }
                        .model { background: #14110e; border-left: 4px solid #637588; }
                        .role { font-weight: bold; font-size: 0.7em; color: #f9a824; margin-bottom: 10px; display: block; letter-spacing: 1px; }
                    </style>
                </head>
                <body>
                    <h1>${item.title}</h1>
                    <p class="meta">Category: ${item.category} • Ref: LOG-${item.id}</p>
                    ${content.map(msg => `
                        <div class="msg ${msg.role}">
                            <span class="role">${msg.role.toUpperCase()}</span>
                            <div style="white-space: pre-wrap;">${msg.content.replace(/\n/g, '<br>')}</div>
                        </div>
                    `).join('')}
                </body>
                </html>
            `);
            contentWindow.document.close();
        }
    };

    const handleDelete = async (e, item) => {
        e.stopPropagation();
        if (item.is_default) return alert("System manuals cannot be deleted.");
        
        if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
            try {
                // Future: Add DELETE endpoint. For now, we'll just remove from UI.
                setManuals(prev => prev.filter(m => m.id !== item.id));
                alert("Manual record removed (UI Only - Delete API pending).");
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };

    return (
        <div className="bg-[#f8f7f5] dark:bg-[#121212] font-sans min-h-screen text-[#111418] dark:text-white w-full overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#f9a824] text-4xl">menu_book</span>
                            Repair Manuals
                        </h1>
                        <p className="text-[#637588] dark:text-[#9ca3af] mt-1">Access technical documentation and safety guides</p>
                    </div>
                    <button
                        onClick={() => alert("To create a manual, start a chat session and click 'Save as Manual' in the sidebar.")}
                        className="flex items-center gap-2 bg-[#f9a824] text-[#1a150b] px-5 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-[#ffb649] transition-colors shadow-lg shadow-[#f9a824]/20"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Create Manual
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Search manuals..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-[#1a1612] border border-[#e5e7eb] dark:border-[#333333] focus:border-[#f9a824] focus:ring-1 focus:ring-[#f9a824] transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors border ${selectedCategory === cat
                                    ? 'bg-[#f9a824] text-[#1a150b] border-[#f9a824]'
                                    : 'bg-white dark:bg-[#1a1612] text-[#637588] dark:text-[#9ca3af] border-[#e5e7eb] dark:border-[#333333] hover:border-[#f9a824]/50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Manuals Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 rounded-2xl bg-[#1a1612] animate-pulse border border-[#4a3a21]"></div>
                        ))}
                    </div>
                ) : filteredManuals.length === 0 ? (
                    <div className="text-center py-20 opacity-50 border-2 border-dashed border-[#4a3a21] rounded-3xl">
                        <span className="material-symbols-outlined text-6xl mb-4 text-[#4a3a21]">find_in_page</span>
                        <p className="text-xl font-bold uppercase tracking-widest text-[#4a3a21]">No manuals found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredManuals.map((manual) => (
                            <div key={manual.id} className="group bg-white dark:bg-[#1a1612] rounded-2xl p-5 border border-[#e5e7eb] dark:border-[#4a3a21] hover:border-[#f9a824]/50 hover:shadow-2xl transition-all flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#f9a824] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="size-12 rounded-xl bg-[#f8f7f5] dark:bg-[#231b0f] flex items-center justify-center text-[#f9a824] group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">
                                            {manual.is_default ? 'library_books' : 'history_edu'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-[#f9a824]/10 text-[#f9a824] text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-[#f9a824]/20">
                                            {manual.category}
                                        </span>
                                        {!manual.is_default && (
                                            <button
                                                onClick={(e) => handleDelete(e, manual)}
                                                className="size-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-[#f9a824] transition-colors uppercase tracking-tight">
                                    {manual.title}
                                </h3>

                                <div className="mt-auto pt-4 border-t border-[#e5e7eb] dark:border-[#4a3a21] flex items-center justify-between">
                                    <div className="text-[10px] text-[#637588] dark:text-[#ccb58e] font-mono font-bold uppercase">
                                        {manual.is_default ? 'System Library' : 'Saved Guide'}
                                    </div>
                                    <button
                                        onClick={() => handleRead(manual)}
                                        className="text-xs font-black uppercase tracking-widest flex items-center gap-1 text-[#f9a824] hover:scale-110 transition-transform"
                                    >
                                        READ
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
