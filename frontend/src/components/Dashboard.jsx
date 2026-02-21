import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import useAuthStore from '../store/useAuthStore';
import { LogOut, Home, Settings, User } from 'lucide-react';
import ProfileCard from './ProfileCard';

const Dashboard = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();

    const headerRef = useRef(null);
    const cardsRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Enter animation
        const tl = gsap.timeline();

        tl.fromTo(headerRef.current,
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        )
            .fromTo(cardsRef.current.children,
                { opacity: 0, scale: 0.9, y: 30 },
                { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "back.out(1.2)" },
                "-=0.4"
            );
    }, [isAuthenticated, navigate]);

    const handleLogout = () => {
        // Exit animation before logout
        gsap.to([headerRef.current, cardsRef.current], {
            opacity: 0,
            y: 20,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                logout();
                navigate('/login');
            }
        });
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[var(--color-dark-bg)] text-[var(--color-text-primary)] p-6 md:p-12 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-96 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(30, 58, 138, 0.2), transparent)' }}></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <header ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full p-[2px]" style={{ background: 'linear-gradient(to top right, #2563eb, #1e3a8a)' }}>
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xl font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                Hello, <span style={{ color: '#60a5fa' }}>{user.name}</span>!
                            </h1>
                            <p className="text-[var(--color-text-secondary)] mt-1">Welcome back to your dashboard.</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all hover:border-red-500/50 hover:text-red-400 group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Sign Out</span>
                    </button>
                </header>

                <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 flex justify-center h-[540px]">
                        <ProfileCard
                            name={user.name}
                            title="Member"
                            handle={user.email?.split('@')[0] || "member"}
                            status="Online"
                            contactText="Contact"
                            avatarUrl={user.avatarUrl || "https://www.google.com/imgres?q=coder%20avatar%20photo&imgurl=https%3A%2F%2Fimg.freepik.com%2Ffree-vector%2Fhacker-operating-laptop-cartoon-icon-illustration-technology-icon-concept-isolated-flat-cartoon-style_138676-2387.jpg%3Fsemt%3Dais_user_personalization%26w%3D740%26q%3D80&imgrefurl=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fprogrammer-avatar&docid=6Q-zh3GfPVwXSM&tbnid=VRDL8qZDC3Qy1M&vet=12ahUKEwie-JzI6eiSAxUYcPUHHXGrKuIQnPAOegQIGBAB..i&w=740&h=740&hcb=2&ved=2ahUKEwie-JzI6eiSAxUYcPUHHXGrKuIQnPAOegQIGBABdata:image/png;base64,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"}
                            className="w-full"
                        />
                    </div>

                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-start">
                        {/* Stats Card 1 */}
                       
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
