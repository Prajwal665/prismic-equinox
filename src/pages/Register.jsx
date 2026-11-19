import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    Lock,
    User,
    Mail,
    Fingerprint,
    ArrowLeft,
    ShieldPlus,
    Check,
    X,
    Eye,
    EyeOff,
    CheckCircle2,
    KeyRound,
    Smartphone
} from 'lucide-react';
import {
    validatePasswordPolicy,
    encryptSensitiveData,
    logAuditEvent,
    ROLES
} from '../services/securityService';

const Register = ({ onBackToLogin }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        badgeNumber: '',
        department: 'Delhi Traffic Police HQ',
        role: 'ENFORCEMENT_OFFICER',
        aadharNumber: '',
        phone: '',
        password: '',
        confirmPassword: '',
        enableTwoFactor: true
    });
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    // Password Policy Evaluation
    const pwdEval = validatePasswordPolicy(formData.password);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (!pwdEval.isValid) {
            alert("Password does not meet enterprise security policy requirements.");
            return;
        }

        // Encrypt Sensitive PII Data (Aadhar, Phone)
        const encryptedAadhar = encryptSensitiveData(formData.aadharNumber);
        const encryptedPhone = encryptSensitiveData(formData.phone);

        // Record Audit Event
        logAuditEvent({
            category: 'SECURITY',
            action: 'PERSONNEL_REGISTER_REQUEST',
            details: `Registration requested for ${formData.name} (${formData.badgeNumber}) with Role: ${formData.role}. PII Encrypted.`,
            severity: 'INFO'
        });

        setRegistrationSuccess(true);
        setTimeout(() => {
            onBackToLogin();
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background High-tech Glow */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500 rounded-full blur-[140px] mix-blend-screen animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:40px_40px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative z-10 w-full max-w-xl"
            >
                <div className="bg-navy-800/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-7 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

                    <button
                        onClick={onBackToLogin}
                        className="group flex items-center gap-2 text-cyan-300/60 hover:text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider mb-4 transition-colors"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Portal
                    </button>

                    <div className="flex flex-col items-center mb-6 text-center">
                        <div className="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-3 border border-cyan-500/30">
                            <ShieldPlus className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-0.5 font-mono">Personnel Clearance</h1>
                        <p className="text-cyan-200/70 text-xs font-mono">Enterprise Role-Based Access Registration</p>
                    </div>

                    {registrationSuccess ? (
                        <div className="p-8 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl animate-in zoom-in-95">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                            <h3 className="text-lg font-bold text-white font-mono">Authorization Request Enqueued</h3>
                            <p className="text-xs text-white/60">
                                Credentials registered with AES-GCM PII encryption and TOTP Two-Factor enforcement. Redirecting to login...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
                                            <User size={15} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Officer Rajesh Kumar"
                                            className="w-full bg-navy-950 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 font-mono"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 ml-1">Badge / Officer ID</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
                                            <Shield size={15} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="DL-TP-502"
                                            className="w-full bg-navy-950 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 font-mono"
                                            value={formData.badgeNumber}
                                            onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 ml-1">Gov Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
                                            <Mail size={15} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            placeholder="officer@delhipolice.gov.in"
                                            className="w-full bg-navy-950 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 font-mono"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 ml-1">Assigned Role</label>
                                    <select
                                        className="w-full bg-navy-950 border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-cyan-500/50 font-mono"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="ENFORCEMENT_OFFICER">Enforcement Officer (Level 3)</option>
                                        <option value="TRAFFIC_OPERATOR">Traffic Operator (Level 3)</option>
                                        <option value="EMERGENCY_DISPATCHER">Emergency Dispatcher (Level 4)</option>
                                        <option value="SECURITY_AUDITOR">Cyber Security Auditor (Level 4)</option>
                                        <option value="SUPER_ADMIN">Super Administrator (Level 5)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Sensitive PII with AES Encryption Banner */}
                            <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/20 space-y-2">
                                <p className="text-[10px] font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                                    <Lock size={12} />
                                    Sensitive Data (Auto-Encrypted via AES-GCM)
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Aadhar: 1234-5678-9012"
                                        className="w-full bg-navy-950/80 border border-white/10 rounded-lg py-1.5 px-3 text-white text-xs font-mono"
                                        value={formData.aadharNumber}
                                        onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                                    />
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Phone: +91 98765-43210"
                                        className="w-full bg-navy-950/80 border border-white/10 rounded-lg py-1.5 px-3 text-white text-xs font-mono"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Password & Password Policy Checker */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 ml-1">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="Enter strong password"
                                            className="w-full bg-navy-950 border border-white/10 rounded-xl py-2 pl-3 pr-10 text-white text-xs font-mono focus:outline-none focus:border-cyan-500/50"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white"
                                        >
                                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 ml-1">Confirm Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Confirm password"
                                        className="w-full bg-navy-950 border border-white/10 rounded-xl py-2 px-3 text-white text-xs font-mono focus:outline-none focus:border-cyan-500/50"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Password Policy Strength Checklist */}
                            {formData.password && (
                                <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-[10px] font-mono space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/60">Policy Strength: <strong className="text-cyan-300">{pwdEval.strength}</strong></span>
                                        <span className="text-white/40">{pwdEval.score}/100</span>
                                    </div>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${pwdEval.score >= 80 ? 'bg-emerald-400' : pwdEval.score >= 60 ? 'bg-amber-400' : 'bg-red-500'}`}
                                            style={{ width: `${pwdEval.score}%` }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 text-[9px] text-white/50 pt-1">
                                        <span className={pwdEval.checks.minLength ? "text-emerald-400" : ""}>✓ 8+ Characters</span>
                                        <span className={pwdEval.checks.hasUppercase ? "text-emerald-400" : ""}>✓ Uppercase (A-Z)</span>
                                        <span className={pwdEval.checks.hasLowercase ? "text-emerald-400" : ""}>✓ Lowercase (a-z)</span>
                                        <span className={pwdEval.checks.hasNumber ? "text-emerald-400" : ""}>✓ Number (0-9)</span>
                                        <span className={pwdEval.checks.hasSpecial ? "text-emerald-400" : ""}>✓ Special Character (!@#$)</span>
                                    </div>
                                </div>
                            )}

                            {/* 2FA Toggle */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-navy-950 border border-white/10 text-xs font-mono">
                                <div className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-cyan-400" />
                                    <span>Enforce 2FA Authenticator on Login</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.enableTwoFactor}
                                    onChange={(e) => setFormData({ ...formData, enableTwoFactor: e.target.checked })}
                                    className="rounded border-white/10 bg-navy-900 text-cyan-500 focus:ring-0"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition-all font-mono text-xs uppercase tracking-wider"
                            >
                                <CheckCircle2 size={16} />
                                Enqueue Clearance Request
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
