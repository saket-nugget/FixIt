import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', label: 'Dashboard', icon: 'dashboard' },
        { path: '/scan', label: 'Scanner', icon: 'videocam' },
        { path: '/results', label: 'Results', icon: 'analytics' },
        { path: '/history', label: 'History', icon: 'history' },
        { path: '/chat', label: 'Mechanic AI', icon: 'smart_toy' },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-[#231b0f]/80 backdrop-blur-md border-b border-[#4a3a21] text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo & Brand */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="size-10 bg-gradient-to-br from-[#f9a824] to-[#bfa05d] flex items-center justify-center rounded-xl text-[#1a150b] shadow-[0_0_15px_rgba(249,168,36,0.5)] group-hover:scale-105 transition-transform duration-300">
                            <span className="material-symbols-outlined text-2xl font-bold">construction</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-wide uppercase leading-none text-white group-hover:text-[#f9a824] transition-colors">FixIt</span>
                            <span className="text-[10px] text-[#ccb58e] tracking-[0.2em] uppercase leading-none">Industrial AI</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1 bg-black/20 p-1 rounded-full border border-white/5">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${isActive(item.path)
                                    ? 'bg-[#f9a824] text-[#1a150b] shadow-[0_0_10px_rgba(249,168,36,0.3)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-lg ${isActive(item.path) ? 'fill-1' : ''}`}>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side / Mobile Toggle */}
                    <div className="flex items-center gap-4">
                        {/* Settings Link (Desktop) */}
                        <Link
                            to="/settings"
                            className="hidden md:flex p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">settings</span>
                        </Link>

                        {/* User Profile (Desktop) */}
                        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
                            <div className="text-right">
                                <p className="text-xs font-bold text-white leading-none">Technician</p>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <p className="text-[10px] text-[#ccb58e] leading-none uppercase tracking-wider">Online</p>
                                </div>
                            </div>
                            <div className="size-9 rounded-full bg-gradient-to-br from-[#3a2e1e] to-[#231b0f] flex items-center justify-center border border-[#4a3a21] shadow-inner">
                                <span className="material-symbols-outlined text-[#f9a824] text-sm">person</span>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-lg text-gray-400 hover:text-[#f9a824] hover:bg-white/5 transition-colors"
                            >
                                <span className="material-symbols-outlined text-2xl">{isMenuOpen ? 'close' : 'menu'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-16 left-0 w-full bg-[#1a1612]/95 backdrop-blur-xl border-b border-[#4a3a21] transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pt-2 pb-6 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-colors ${isActive(item.path)
                                ? 'bg-[#f9a824] text-[#1a150b]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className={`material-symbols-outlined ${isActive(item.path) ? 'fill-1' : ''}`}>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}

                    <Link
                        to="/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <span className="material-symbols-outlined">settings</span>
                        Settings
                    </Link>

                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center gap-3 px-2">
                        <div className="size-10 rounded-full bg-[#3a2e1e] flex items-center justify-center border border-[#4a3a21]">
                            <span className="material-symbols-outlined text-[#f9a824]">person</span>
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Guest Technician</p>
                            <p className="text-xs text-[#ccb58e]">ID: #GUEST-8922</p>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
