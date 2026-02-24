import React from 'react';
import { Shield, CheckCircle, Cpu, Cloud, Smartphone, Lock } from 'lucide-react';

const Feature = ({ icon: Icon, title, desc }) => (
    <div className="glass-panel p-6 flex flex-col gap-3">
        <div className="w-12 h-12 rounded-xl bg-emergency/10 flex items-center justify-center text-emergency">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold mt-2">{title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
    </div>
);

const About = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-16 py-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <section className="text-center space-y-6">
                <div className="inline-block p-3 rounded-2xl bg-white/5 border border-white/10 mb-4">
                    <Shield className="w-12 h-12 text-emergency" />
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight">Intelligent Traffic Management System</h1>
                <p className="text-xl text-white/50 max-w-2xl mx-auto">
                    Powering the next generation of urban mobility through AI-driven surveillance and real-time signal optimization.
                </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Feature
                    icon={Cpu}
                    title="Edge AI Analytics"
                    desc="Low-latency vehicle detection and classification running directly on junction-side hardware."
                />
                <Feature
                    icon={Cloud}
                    title="IoT Integration"
                    desc="Mesh-connected signal network ensuring synchronized flow across city corridors."
                />
                <Feature
                    icon={Lock}
                    title="Secure Infrastructure"
                    desc="Military-grade encryption for all command and control communications between departments."
                />
                <Feature
                    icon={Smartphone}
                    title="Citizen Connectivity"
                    desc="Direct API integration with navigation apps to reroute traffic before congestion builds."
                />
            </div>

            <section className="glass-panel p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emergency/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10 space-y-4">
                    <h2 className="text-2xl font-bold">Standard Operating Procedure</h2>
                    <p className="text-white/40 text-sm max-w-lg mx-auto">
                        This system is restricted to authorized Traffic Police personnel. All manual signal overrides are logged and audited in compliance with municipal security protocols.
                    </p>
                    <div className="flex items-center justify-center gap-8 pt-8 grayscale opacity-50">
                        <div className="flex flex-col items-center gap-2">
                            <CheckCircle className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Certified 2026</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Shield className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Gov Secure</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
