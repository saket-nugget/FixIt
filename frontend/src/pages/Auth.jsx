import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { syncUserWithBackend } from '../services/api';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { username }
                    }
                });
                if (error) throw error;
                
                // Sync on Signup
                if (data?.user) await syncUserWithBackend(data.user);
                
                alert("Check your email for the confirmation link!");
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                // Sync on Login (ensures record exists)
                if (data?.user) await syncUserWithBackend(data.user);

                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0c0a08] flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#f9a824] rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4a3a21] rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md bg-[#1a1612] border border-[#4a3a21] rounded-3xl p-8 shadow-2xl relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="size-16 bg-gradient-to-br from-[#f9a824] to-[#bfa05d] flex items-center justify-center rounded-2xl text-[#1a150b] shadow-[0_0_30px_rgba(249,168,36,0.2)]">
                        <span className="material-symbols-outlined text-4xl font-bold">construction</span>
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p className="text-[#ccb58e] text-sm uppercase tracking-widest font-bold opacity-70">
                        FixIt Industrial Intelligence
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                        <span className="material-symbols-outlined">error</span>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                    {isSignUp && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#ccb58e] uppercase tracking-wider ml-1">Username</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">person</span>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-[#0c0a08] border border-[#4a3a21] rounded-xl px-12 py-3.5 text-white focus:border-[#f9a824] transition-all outline-none"
                                    placeholder="Technician Name"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[#ccb58e] uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">alternate_email</span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0c0a08] border border-[#4a3a21] rounded-xl px-12 py-3.5 text-white focus:border-[#f9a824] transition-all outline-none"
                                placeholder="operator@facility.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[#ccb58e] uppercase tracking-wider ml-1">Access Token (Password)</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">lock</span>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0c0a08] border border-[#4a3a21] rounded-xl px-12 py-3.5 text-white focus:border-[#f9a824] transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#f9a824] text-[#1a150b] font-black py-4 rounded-xl uppercase tracking-widest hover:bg-[#ffb649] active:scale-[0.98] transition-all shadow-xl shadow-[#f9a824]/10 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="size-5 border-2 border-[#1a150b]/20 border-t-[#1a150b] rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span className="material-symbols-outlined font-bold">login</span>
                                {isSignUp ? "Initialize Account" : "Secure Login"}
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-[#ccb58e] hover:text-[#f9a824] text-sm font-bold transition-colors"
                    >
                        {isSignUp ? "Already registered? Login here" : "Need access? Create an account"}
                    </button>
                </div>

                <div className="mt-10 pt-6 border-t border-[#4a3a21]/50 text-center">
                    <p className="text-[10px] text-[#4a3a21] font-mono tracking-widest uppercase">
                        Encrypted Data Link • FixIt Security Protocols
                    </p>
                </div>
            </div>
        </div>
    );
}
