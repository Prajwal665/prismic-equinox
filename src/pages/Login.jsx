import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = ({ onLogin, onNavigateToRegister }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        badgeNumber: '',
        password: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate login
        onLogin();
    };

    return (
        <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* High-tech Background Decoration */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:40px_40px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-navy-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden">
                    {/* Top Bar Decoration */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30">
                            <ShieldCheck className="w-10 h-10 text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">itms.gov.in</h1>
                        <p className="text-blue-200/60 text-sm font-medium">Digital Connectivity Portal</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-widest text-blue-300 ml-1">ID / Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-blue-400 text-white/30 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your ID"
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    value={formData.badgeNumber}
                                    onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-widest text-blue-300 ml-1">Secure Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-blue-400 text-white/30 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <label className="flex items-center gap-2 cursor-pointer group text-blue-300/80 hover:text-blue-300 transition-colors">
                                <input type="checkbox" className="rounded border-white/10 bg-navy-950 text-blue-500 focus:ring-0" />
                                <span>Remember Terminal</span>
                            </label>
                            <a href="#" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Forgot Credentials?</a>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                        >
                            AUTHENTICATE
                            <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <p className="text-blue-200/40 text-sm">
                            New to itms.gov.in?{' '}
                            <button
                                onClick={onNavigateToRegister}
                                className="text-white hover:text-blue-400 font-bold underline decoration-blue-500/30 underline-offset-4 transition-colors"
                            >
                                Register Now
                            </button>
                        </p>
                    </div>
                </div>

                {/* System Info */}
                <div className="mt-6 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold px-2">
                    <span>Sys.v2.4.0</span>
                    <span>Encrypted Session</span>
                    <span>Status: Online</span>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
