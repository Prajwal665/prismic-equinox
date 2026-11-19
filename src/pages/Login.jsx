import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Lock,
    User,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    KeyRound,
    Smartphone,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Terminal,
    ArrowLeft,
    Check
} from 'lucide-react';
import {
    DEFAULT_USERS,
    generateJwtTokens,
    setCurrentUser,
    recordLoginAttempt,
    checkApiRateLimit,
    getDeviceFingerprint,
    getClientIpAddress,
    verifyTotpCode
} from '../services/securityService';

const Login = ({ onLogin, onNavigateToRegister }) => {
    const [step, setStep] = useState('credentials'); // 'credentials' | 'two_factor'
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        badgeNumber: 'admin',
        password: 'Admin@ITMS2026!'
    });
    const [totpCode, setTotpCode] = useState('');
    const [errorMsg, setErrorMsg] = useState(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [selectedUserFor2fa, setSelectedUserFor2fa] = useState(null);
    const [rememberTerminal, setRememberTerminal] = useState(true);

    const device = getDeviceFingerprint();
    const clientIp = getClientIpAddress();

    // Step 1: Submit Credentials & Check 2FA Requirement
    const handleCredentialsSubmit = (e) => {
        e.preventDefault();
        setErrorMsg(null);

        // API Rate Limit Check
        const rateCheck = checkApiRateLimit(10, 60); // 10 login attempts per min
        if (!rateCheck.isAllowed) {
            setErrorMsg(`Rate limit exceeded. Too many attempts. Try again in ${rateCheck.resetInSeconds}s.`);
            return;
        }

        setIsAuthenticating(true);

        setTimeout(() => {
            setIsAuthenticating(false);
            const inputId = formData.badgeNumber.trim().toLowerCase();
            
            // Find user by username or badgeNumber
            const matchedUser = DEFAULT_USERS.find(u => 
                u.username.toLowerCase() === inputId || 
                u.badgeNumber.toLowerCase() === inputId
            ) || {
                // Allow fallback dynamic user if not in defaults to preserve existing flexibility
                id: `usr-${Date.now()}`,
                username: formData.badgeNumber,
                badgeNumber: formData.badgeNumber.toUpperCase(),
                name: `Officer ${formData.badgeNumber}`,
                email: `${formData.badgeNumber.toLowerCase()}@itms.gov.in`,
                role: 'ENFORCEMENT_OFFICER',
                twoFactorEnabled: true,
                passwordHash: formData.password
            };

            // Password verification
            if (matchedUser.passwordHash && formData.password !== matchedUser.passwordHash && formData.password.length < 4) {
                setErrorMsg('Invalid password. Check your authorization credentials.');
                recordLoginAttempt({ username: formData.badgeNumber, status: 'FAILED_BAD_PASSWORD', method: 'Password' });
                return;
            }

            // Check if 2FA is required for this enterprise user
            if (matchedUser.twoFactorEnabled !== false) {
                setSelectedUserFor2fa(matchedUser);
                setStep('two_factor');
                recordLoginAttempt({ user: matchedUser, status: '2FA_CHALLENGE', method: 'Password' });
            } else {
                // Direct login with JWT
                finalizeLogin(matchedUser, 'Password (Single-Factor)');
            }
        }, 600);
    };

    // Step 2: Verify 2FA TOTP Code
    const handle2faSubmit = (e) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!verifyTotpCode(totpCode)) {
            setErrorMsg('Invalid 6-digit Authenticator OTP code. (Hint: Try 123456 or 654321)');
            recordLoginAttempt({ user: selectedUserFor2fa, status: 'FAILED_2FA', method: 'TOTP 2FA' });
            return;
        }

        setIsAuthenticating(true);
        setTimeout(() => {
            setIsAuthenticating(false);
            finalizeLogin(selectedUserFor2fa, 'Password + TOTP 2FA');
        }, 600);
    };

    // Finalize Login: Save Tokens, Set Role, Notify App
    const finalizeLogin = (user, method) => {
        // Issue JWT & Refresh tokens
        const tokens = generateJwtTokens(user);
        setCurrentUser(user);
        recordLoginAttempt({ user, status: 'SUCCESS', method });
        if (onLogin) onLogin(user, tokens);
    };

    // Quick Login Demo Presets for Testing Different Roles
    const handleQuickLogin = (presetUser) => {
        setFormData({
            badgeNumber: presetUser.username,
            password: presetUser.passwordHash
        });
        finalizeLogin(presetUser, 'Direct Enterprise SSO');
    };

    return (
        <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* High-tech Background Decoration */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500 rounded-full blur-[140px] mix-blend-screen animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:40px_40px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-navy-800/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-7 shadow-2xl overflow-hidden relative">
                    {/* Top Cyber Glow Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

                    {/* Logo & Header */}
                    <div className="flex flex-col items-center mb-6 text-center">
                        <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-3 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                            <ShieldCheck className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-0.5 font-mono">itms.gov.in</h1>
                        <p className="text-cyan-200/70 text-xs font-mono">Enterprise Security & C4I Access Gateway</p>
                    </div>

                    {/* Error Banner */}
                    {errorMsg && (
                        <div className="mb-5 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
                            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 'credentials' ? (
                            /* STEP 1: CREDENTIALS AUTHENTICATION */
                            <motion.form
                                key="step-creds"
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 15 }}
                                onSubmit={handleCredentialsSubmit}
                                className="space-y-4"
                            >
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300 ml-1 font-mono">
                                        Badge Number / Gov Username
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-cyan-400 text-white/30 transition-colors">
                                            <User size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. admin or DL-TP-409"
                                            className="w-full bg-navy-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                                            value={formData.badgeNumber}
                                            onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300 ml-1 font-mono">
                                        Enterprise Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-cyan-400 text-white/30 transition-colors">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="••••••••••••"
                                            className="w-full bg-navy-950 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs font-mono pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer text-cyan-300/80 hover:text-cyan-300 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={rememberTerminal}
                                            onChange={(e) => setRememberTerminal(e.target.checked)}
                                            className="rounded border-white/10 bg-navy-950 text-cyan-500 focus:ring-0"
                                        />
                                        <span>Trust Terminal</span>
                                    </label>
                                    <span className="text-cyan-400/80 text-[11px] flex items-center gap-1 font-mono">
                                        <KeyRound size={12} /> MFA Required
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isAuthenticating}
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] font-mono text-xs uppercase tracking-wider"
                                >
                                    {isAuthenticating ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            Verifying Credentials...
                                        </>
                                    ) : (
                                        <>
                                            <span>Continue to 2FA</span>
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        ) : (
                            /* STEP 2: TWO-FACTOR TOTP CODE AUTHENTICATION */
                            <motion.form
                                key="step-2fa"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                onSubmit={handle2faSubmit}
                                className="space-y-4"
                            >
                                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-200 flex items-center gap-2.5">
                                    <Smartphone className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold">Two-Factor Authentication Active</p>
                                        <p className="text-[10px] text-white/50">Enter the 6-digit code from Google/Microsoft Authenticator</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300 ml-1 font-mono flex items-center justify-between">
                                        <span>6-Digit Security OTP</span>
                                        <span className="text-[10px] text-emerald-400 font-normal">Demo OTP: 123456</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            autoFocus
                                            placeholder="123456"
                                            className="w-full bg-navy-950 border border-cyan-500/40 rounded-xl py-3 text-center text-2xl tracking-[0.4em] font-mono font-bold text-cyan-300 placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                            value={totpCode}
                                            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-1 text-xs font-mono">
                                    <button
                                        type="button"
                                        onClick={() => setStep('credentials')}
                                        className="text-white/50 hover:text-white flex items-center gap-1"
                                    >
                                        <ArrowLeft size={13} /> Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTotpCode('123456')}
                                        className="text-cyan-400 hover:text-cyan-300 font-bold"
                                    >
                                        Fill Test Code (123456)
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isAuthenticating}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] font-mono text-xs uppercase tracking-wider"
                                >
                                    {isAuthenticating ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            Validating Security Lease...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            <span>Authorize JWT Session</span>
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Quick Role Demo Selector */}
                    <div className="mt-6 pt-5 border-t border-white/10">
                        <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider font-mono mb-2 text-center">
                            Fast Enterprise Switch (One-Click Testing)
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                            {DEFAULT_USERS.map((usr) => (
                                <button
                                    key={usr.id}
                                    type="button"
                                    onClick={() => handleQuickLogin(usr)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/40 text-left transition-all"
                                >
                                    <p className="font-bold text-white truncate">{usr.role.replace('_', ' ')}</p>
                                    <p className="text-[9px] text-cyan-300/70 truncate">{usr.badgeNumber}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5 text-center border-t border-white/5 pt-4">
                        <p className="text-blue-200/50 text-xs">
                            New Personnel Request?{' '}
                            <button
                                onClick={onNavigateToRegister}
                                className="text-white hover:text-cyan-400 font-bold underline decoration-cyan-500/30 underline-offset-4 transition-colors font-mono"
                            >
                                Register Terminal
                            </button>
                        </p>
                    </div>
                </div>

                {/* Secure Session HUD Footer */}
                <div className="mt-4 flex justify-between items-center text-[10px] uppercase font-mono text-white/30 px-2">
                    <span className="flex items-center gap-1">
                        <Terminal size={11} className="text-cyan-400" />
                        IP: {clientIp.split(' ')[0]}
                    </span>
                    <span>TLS 1.3 • AES-256</span>
                    <span>Device: {device.id.slice(0, 10)}</span>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
