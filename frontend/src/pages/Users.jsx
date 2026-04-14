import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiFetch } from '../services/api';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await apiFetch('/users/');
                setUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="bg-[#f8f7f5] dark:bg-[#231b0f] font-sans min-h-screen flex flex-col overflow-x-hidden">
            <Navbar />

            <main className="flex-1 flex flex-col items-center w-full px-4 py-8 md:px-10 lg:px-40">
                <div className="w-full max-w-[1024px]">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f9a824]/10 border border-[#f9a824]/20 rounded text-[#f9a824] text-xs font-bold tracking-wider mb-2 uppercase">
                                <span className="material-symbols-outlined !text-sm">group</span>
                                Registry
                            </div>
                            <h1 className="text-white text-4xl font-bold tracking-tight uppercase">User Management</h1>
                            <p className="text-[#ccb58e] mt-2">Database of registered operators and technicians.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="size-12 border-4 border-[#f9a824]/20 border-t-[#f9a824] rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-lg text-center">
                            <span className="material-symbols-outlined !text-4xl mb-2">error</span>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.map(user => (
                                <div key={user.id} className="bg-[#2d2417] border border-[#4a3a21] rounded-lg p-6 shadow-xl hover:border-[#f9a824]/50 transition-all group relative overflow-hidden">
                                     <div className="absolute top-0 left-0 w-1 h-full bg-[#f9a824] opacity-30 group-hover:opacity-100 transition-opacity"></div>
                                     <div className="flex items-center gap-4 mb-4">
                                         <div className="size-12 rounded-full bg-[#f9a824]/10 border border-[#f9a824]/30 flex items-center justify-center text-[#f9a824]">
                                             <span className="material-symbols-outlined">person</span>
                                         </div>
                                         <div>
                                             <h3 className="text-white font-bold uppercase tracking-tight">{user.username}</h3>
                                             <p className="text-[10px] text-[#ccb58e] font-mono uppercase tracking-widest">Technician Verified</p>
                                         </div>
                                     </div>
                                     <div className="space-y-3">
                                         <div className="bg-black/20 p-3 rounded border border-white/5">
                                             <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Email Address</p>
                                             <p className="text-white/80 text-sm truncate">{user.email}</p>
                                         </div>
                                         <button className="w-full py-2 bg-transparent border border-[#f9a824]/30 text-[#f9a824] text-xs font-bold uppercase tracking-widest rounded hover:bg-[#f9a824] hover:text-[#1a150b] transition-all">
                                             View Profile
                                         </button>
                                     </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
