import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function Manuals() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Mock Data
    const [manuals, setManuals] = useState([
        {
            id: 1,
            title: "Industrial Conveyor Belt Maintenance",
            category: "Heavy Machinery",
            date: "2023-11-15",
            size: "2.4 MB",
            icon: "conveyor_belt"
        },
        {
            id: 2,
            title: "Hydraulic Press Safety Guide",
            category: "Hydraulics",
            date: "2024-01-10",
            size: "1.8 MB",
            icon: "precision_manufacturing"
        },
        {
            id: 3,
            title: "AC Motor Troubleshooting 101",
            category: "Electronics",
            date: "2023-09-22",
            size: "3.1 MB",
            icon: "electric_bolt"
        },
        {
            id: 4,
            title: "Pneumatic Valve Repair",
            category: "Pneumatics",
            date: "2024-02-05",
            size: "1.2 MB",
            icon: "air"
        },
        {
            id: 5,
            title: "Forklift Operator Manual",
            category: "Vehicles",
            date: "2023-12-01",
            size: "5.5 MB",
            icon: "forklift"
        },
        {
            id: 6,
            title: "CNC Machine Calibration",
            category: "Heavy Machinery",
            date: "2024-01-20",
            size: "4.2 MB",
            icon: "settings_applications"
        }
    ]);

    useEffect(() => {
        try {
            const key = 'fixit_custom_manuals_v2';
            const stored = localStorage.getItem(key);
            console.log(`[Manuals] Loading from ${key}:`, stored); // DEBUG
            if (stored) {
                const parsed = JSON.parse(stored);
                console.log("[Manuals] Parsed:", parsed); // DEBUG
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // CRITICAL: Validate that items have required properties to prevent crashes
                    const validManuals = parsed.filter(m =>
                        m &&
                        typeof m.title === 'string' &&
                        typeof m.category === 'string'
                    );
                    console.log("[Manuals] Valid manuals:", validManuals); // DEBUG
                    setManuals(prev => [...prev, ...validManuals]);
                }
            }
        } catch (e) {
            console.error("Failed to load custom manuals:", e);
        }
    }, []);

    // Get unique categories
    const categories = ['All', ...new Set(manuals.filter(m => m && m.category).map(m => m.category))];

    // Filter Logic
    const filteredManuals = manuals.filter(manual => {
        if (!manual || !manual.title) return false;
        const matchesSearch = manual.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || manual.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleRead = (item) => {
        if (item.isCustom) {
            const contentWindow = window.open("", "_blank");
            if (contentWindow) {
                contentWindow.document.write(`
                    <html>
                    <head>
                        <title>${item.title}</title>
                        <style>
                            body { font-family: monospace; background: #111; color: #ddd; padding: 20px; max-width: 800px; margin: 0 auto; }
                            h1 { color: #f9a824; border-bottom: 1px solid #333; padding-bottom: 10px; }
                            .meta { font-size: 0.9em; color: #888; margin-bottom: 20px; }
                            .msg { margin-bottom: 15px; padding: 10px; border-radius: 8px; }
                            .user { background: #222; border-left: 3px solid #f9a824; }
                            .model { background: #1a1a1a; border-left: 3px solid #444; }
                            .role { font-weight: bold; font-size: 0.8em; opacity: 0.7; margin-bottom: 5px; display: block; }
                        </style>
                    </head>
                    <body>
                        <h1>${item.title}</h1>
                        <p class="meta">Category: ${item.category} • Created: ${item.date}</p>
                        <hr style="border-color: #333; margin: 20px 0;">
                        ${item.content.map(msg => `
                            <div class="msg ${msg.role}">
                                <span class="role">${msg.role.toUpperCase()}</span>
                                ${msg.content.replace(/\n/g, '<br>')}
                            </div>
                        `).join('')}
                    </body>
                    </html>
                `);
                contentWindow.document.close();
            }
        } else {
            alert(`Opening PDF viewer for: ${item.title}...\n(This is a demo action)`);
        }
    };

    const handleDelete = (e, item) => {
        e.stopPropagation(); // Prevent opening the manual when clicking delete
        if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
            // Update UI State
            setManuals(prev => {
                const updated = prev.filter(m => m.id !== item.id);

                // If it's a custom manual, update localStorage
                if (item.isCustom) {
                    const customManuals = updated.filter(m => m.isCustom);
                    localStorage.setItem('fixit_custom_manuals_v2', JSON.stringify(customManuals));
                }

                return updated;
            });
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
                {filteredManuals.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <span className="material-symbols-outlined text-6xl mb-4">find_in_page</span>
                        <p className="text-xl">No manuals found matching your criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredManuals.map((manual) => (
                            <div key={manual.id} className="group bg-white dark:bg-[#1a1612] rounded-2xl p-5 border border-[#e5e7eb] dark:border-[#333333] hover:border-[#f9a824]/50 hover:shadow-xl transition-all flex flex-col h-full relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#f9a824] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="size-12 rounded-xl bg-[#f8f7f5] dark:bg-[#231b0f] flex items-center justify-center text-[#f9a824] group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">{manual.icon}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-[#f9a824]/10 text-[#f9a824] text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                                            {manual.category}
                                        </span>
                                        {/* Delete Button - Only for custom manuals if we prioritize, but user said 'any'. I'll enable for all but only persist custom. */}
                                        <button
                                            onClick={(e) => handleDelete(e, manual)}
                                            className="size-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                            title="Delete Manual"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-[#f9a824] transition-colors">
                                    {manual.title}
                                </h3>

                                <div className="mt-auto pt-4 border-t border-[#e5e7eb] dark:border-[#333333] flex items-center justify-between">
                                    <div className="text-xs text-[#637588] dark:text-[#9ca3af] font-mono">
                                        {manual.size} • PDF
                                    </div>
                                    <button
                                        onClick={() => handleRead(manual)}
                                        className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-[#f9a824] transition-colors"
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
