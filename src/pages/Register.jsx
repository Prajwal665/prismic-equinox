import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, User, Mail, Fingerprint, ArrowLeft, ShieldPlus } from 'lucide-react';

const Register = ({ onBackToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        badgeNumber: '',
        department: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate registration
        alert("Authorization Request Sent to Admin");
        onBackToLogin();
    };

    return (
        <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* High-tech Background Decoration */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:40px_40px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative z-10 w-full max-w-lg"
            >
                <div className="bg-navy-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden">
                    {/* Top Bar Decoration */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

                    <button
                        onClick={onBackToLogin}
                        className="group flex items-center gap-2 text-blue-300/60 hover:text-blue-300 text-xs font-bold uppercase tracking-widest mb-6 transition-colors"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Portal
                    </button>

                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30">
                            <ShieldPlus className="w-10 h-10 text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">itms.gov.in</h1>
                        <p className="text-blue-200/60 text-sm font-medium">Join the Digital Network</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-blue-300/80 ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-blue-400 text-white/30 transition-colors">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        className="w-full bg-navy-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-blue-300/80 ml-1">Aadhar / ID Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-blue-400 text-white/30 transition-colors">
                                        <Fingerprint size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="XXXX-XXXX-XXXX"
                                        className="w-full bg-navy-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 transition-all"
                                        value={formData.badgeNumber}
                                        onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-300/80 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-blue-400 text-white/30 transition-colors">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="yourname@domain.com"
                                    className="w-full bg-navy-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-300/80 ml-1">City / Region</label>
                            <select
                                className="w-full bg-navy-950 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50 appearance-none"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            >
                                <option value="">Select Region</option>
                                <option value="delhi">Delhi NCR</option>
                                <option value="mumbai">Mumbai</option>
                                <option value="bangalore">Bangalore</option>
                                <option value="chennai">Chennai</option>
                                <option value="kolkata">Kolkata</option>
                                <option value="other">Other State/UT</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-blue-300/80 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-blue-400 text-white/30 transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-navy-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 transition-all"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-blue-300/80 ml-1">Confirm</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-blue-400 text-white/30 transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-navy-950 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 transition-all"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl mt-4">
                            <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                            <p className="text-[11px] text-blue-200/60 leading-relaxed">
                                I certify that I am a citizen of India and agree to the Terms of Service and Privacy Policy of the itms.gov.in Portal.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/40 mt-4 transition-all transform active:scale-[0.98]"
                        >
                            CREATE CITIZEN ACCOUNT
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
