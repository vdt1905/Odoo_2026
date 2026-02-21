import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import useAuthStore from '../store/useAuthStore';
import { Facebook, Instagram, Twitter, ArrowLeft } from 'lucide-react';
import PixelBlast from './PixelBlast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isLoading, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const leftSectionRef = useRef(null);
    const rightSectionRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }

        // Entrance animation
        if (leftSectionRef.current && rightSectionRef.current) {
            gsap.fromTo(leftSectionRef.current,
                { x: -50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, ease: "power3.out", clearProps: "all" }
            );
            gsap.fromTo(rightSectionRef.current,
                { x: 50, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2, clearProps: "all" }
            );
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="min-h-screen w-full flex bg-[#0b1120] overflow-hidden font-sans relative">

            {/* PixelBlast Interactive Background Overlay */}
            <div className="absolute inset-0 z-0 pointer-events-auto opacity-70">
                <PixelBlast
                    variant="square"
                    pixelSize={4}
                    color="#008B8B"
                    patternScale={2}
                    patternDensity={1}
                    pixelSizeJitter={0}
                    enableRipples
                    rippleSpeed={0.4}
                    rippleThickness={0.12}
                    rippleIntensityScale={1.5}
                    liquid={false}
                    liquidStrength={0.12}
                    liquidRadius={1.2}
                    liquidWobbleSpeed={5}
                    speed={0.5}
                    edgeFade={0.25}
                    transparent
                />
            </div>

            {/* Main Content Overlay */}
            <div className="w-full min-h-screen flex flex-col lg:flex-row max-w-[1400px] mx-auto relative z-10 pointer-events-none p-6 lg:p-12">

                {/* Left Section - Welcome Text */}
                <div ref={leftSectionRef} className="w-full lg:w-1/2 flex flex-col justify-center py-10 lg:pr-12 pointer-events-auto relative">

                    {/* Back Button */}
                    <div className="absolute top-4 lg:top-8 left-4 lg:left-8 flex items-center z-20">
                        <Link to="/" className="flex items-center gap-2 text-white/70 hover:text-[#00ced1] transition-colors group px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            
                        </Link>
                    </div>

                    <div className="mt-12 lg:mt-0 lg:max-w-xl">
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-md">Welcome!</h1>
                        <div className="w-16 h-1 bg-slate-400 mb-4 rounded-full"></div>

                        <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed font-light">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed in eros tempus, euismod nunc vitae, tempus purus. Suspendisse ornare semper neque, ut iaculis dui auctor in.
                        </p>


                    </div>
                </div>

                {/* Right Section - Form Card */}
                <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end py-6 pointer-events-none mt-6 lg:mt-0">
                    <div ref={rightSectionRef} className="w-full max-w-[440px] bg-white/5 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[2rem] p-6 lg:p-8 pointer-events-auto">
                        <h2 className="text-2xl font-bold text-white text-center mb-4 drop-shadow-sm">Sign In</h2>

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm text-center border border-red-500/20 shadow-sm font-medium">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-slate-100 ml-1 drop-shadow-sm">User Name</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#008b8b]/60 focus:bg-white/10 transition-all font-medium backdrop-blur-sm shadow-inner text-sm"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] font-semibold text-slate-100 ml-1 drop-shadow-sm">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#ff512f]/50 focus:bg-white/10 transition-all font-medium backdrop-blur-sm shadow-inner text-sm"
                                    placeholder="••••••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 mt-4 rounded-full text-white font-bold text-[14px] tracking-wide bg-[linear-gradient(to_right,#00ced1_0%,#008b8b_51%,#00ced1_100%)] bg-[length:200%_auto] hover:bg-[position:right_center] transition-all duration-500 shadow-[0_5px_15px_rgba(0,139,139,0.4)] hover:shadow-[0_0_25px_rgba(0,139,139,0.6)] disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02]"
                            >
                                {isLoading ? 'Processing...' : 'Submit'}
                            </button>
                        </form>

                        <div className="mt-4">




                            <p className="text-center text-[14px] text-slate-200 font-medium">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-[#00ced1] hover:text-[#008b8b] transition-colors ml-1 font-semibold">
                                    Sign Up
                                </Link>
                            </p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
