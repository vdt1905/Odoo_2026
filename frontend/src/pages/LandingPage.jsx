import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Monitor, Grid, LayoutTemplate, Image as ImageIcon, Sun, Layout } from 'lucide-react';
import ColorBends from '../components/ColorBends';
import PixelCard from '../components/PixelCard';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
    const heroRef = useRef(null);
    const servicesRef = useRef(null);
    const aboutRef = useRef(null);

    // Elements to animate
    const heroTextRef = useRef(null);
    const heroImageRef = useRef(null);
    const servicesTextRef = useRef(null);
    const servicesCardsRef = useRef(null);
    const aboutImageRef = useRef(null);
    const aboutTextRef = useRef(null);

    useEffect(() => {
        // Hero Animation
        gsap.fromTo(heroTextRef.current.children,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out", delay: 0.2 }
        );
        gsap.fromTo(heroImageRef.current,
            { x: 50, opacity: 0 },
            { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.6 }
        );

        // Services Animation
        gsap.fromTo(servicesTextRef.current.children,
            { x: -50, opacity: 0 },
            {
                x: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out",
                scrollTrigger: {
                    trigger: servicesRef.current,
                    start: "top 70%",
                    toggleActions: "play reverse play reverse"
                }
            }
        );

        gsap.fromTo(servicesCardsRef.current.children,
            { y: 50, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out",
                scrollTrigger: {
                    trigger: servicesRef.current,
                    start: "top 60%",
                    toggleActions: "play reverse play reverse"
                }
            }
        );

        // About Animation
        gsap.fromTo(aboutImageRef.current,
            { x: -50, opacity: 0 },
            {
                x: 0, opacity: 1, duration: 1, ease: "power3.out",
                scrollTrigger: {
                    trigger: aboutRef.current,
                    start: "top 70%",
                    toggleActions: "play reverse play reverse"
                }
            }
        );

        gsap.fromTo(aboutTextRef.current.children,
            { x: 50, opacity: 0 },
            {
                x: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out",
                scrollTrigger: {
                    trigger: aboutRef.current,
                    start: "top 60%",
                    toggleActions: "play reverse play reverse"
                }
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <div className="bg-[#0f1115] min-h-screen text-white font-sans overflow-x-hidden selection:bg-teal-500/30">
            {/* Background Animation */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
                <ColorBends
                    colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
                    rotation={0}
                    speed={0.2}
                    scale={1}
                    frequency={1}
                    warpStrength={1}
                    mouseInfluence={1}
                    parallax={0.5}
                    noise={0.1}
                    transparent
                    autoRotate={0}
                />
            </div>

            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-[#0f1115]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="text-teal-400 font-black text-2xl tracking-wider uppercase">
                        FLEETFLOW
                        <div className="text-[10px] text-teal-400/60 -mt-1 tracking-widest font-normal">logistics & management</div>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-gray-400">
                        <a href="#home" className="text-teal-400 transition-colors">HOME</a>
                        <a href="#features" className="hover:text-white transition-colors">FEATURES</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">HOW IT WORKS</a>


                        <div className="flex items-center gap-4 ml-6 pl-6 border-l border-white/10">
                            <Link to="/login" className="hover:text-white transition-colors">SignIn</Link>
                            <Link to="/signup" className="px-5 py-2 rounded-full bg-[#008b8b] text-white hover:bg-[#00ced1] transition-colors shadow-[0_0_15px_rgba(0,139,139,0.3)] hover:shadow-[0_0_20px_rgba(0,139,139,0.5)]">SignUp</Link>
                        </div>

                        <button className="text-gray-400 hover:text-white ml-2">
                            <Search size={18} />
                        </button>
                    </nav>
                </div>
            </header>

            <main className="pt-20">
                {/* Hero Section */}
                <section id="home" ref={heroRef} className="relative min-h-screen flex items-center pt-10 pb-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vh] font-bold text-white/[0.02] select-none pointer-events-none z-0 tracking-tighter">
                        H
                    </div>

                    <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center gap-12 z-10 relative">
                        <div ref={heroTextRef} className="flex-1 space-y-6">
                            <div className="text-teal-400 text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                                FLEET MANAGEMENT SYSTEM
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold leading-tight uppercase relative">
                                OPTIMIZE <span className="text-teal-400">EVERY</span><br />
                                DISPATCH
                            </h1>
                            <p className="text-gray-400 max-w-lg text-sm md:text-base leading-relaxed">
                                FleetFlow empowers your entire logistics operation. From real-time route assignment to deep operational analytics, seamlessly connect Dispatchers, Managers, Safety Officers, and Financial Analysts into one synchronized platform.
                            </p>
                            <div className="pt-4 flex gap-4">
                                <Link to="/signup" className="bg-teal-400 hover:bg-teal-300 text-gray-900 font-bold px-8 py-3 rounded-full text-sm transition-colors tracking-widest shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:shadow-[0_0_20px_rgba(45,212,191,0.5)]">
                                    GET STARTED
                                </Link>
                                <a href="#how-it-works" className="border border-white/20 hover:bg-white/5 text-white font-bold px-8 py-3 rounded-full text-sm transition-colors tracking-widest">
                                    SEE HOW IT WORKS
                                </a>
                            </div>
                        </div>

                        <div ref={heroImageRef} className="flex-1 w-full flex justify-center md:justify-end">
                            <div className="relative w-full max-w-lg h-auto aspect-square flex items-center justify-center">
                                {/* The 3D Truck Image */}
                                <img
                                    src="/delivery-truck.png"
                                    alt="3D Delivery Truck"
                                    className="w-[120%] h-auto object-contain relative z-10 drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
                                />
                                {/* Glow Effects */}
                                <div className="absolute inset-0 bg-teal-500/10 mix-blend-overlay rounded-full blur-[100px] z-0"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px] z-0"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/10 rounded-full z-0 animate-[spin_10s_linear_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" ref={servicesRef} className="relative min-h-screen flex items-center py-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[50vh] font-bold text-white/[0.02] select-none pointer-events-none z-0 tracking-tighter">
                        CORE
                    </div>

                    <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center gap-16 z-10 relative">
                        <div ref={servicesTextRef} className="flex-1 space-y-6">
                            <div className="text-teal-400 text-sm font-bold tracking-widest uppercase">
                                KEY FEATURES
                            </div>
                            <h2 className="text-5xl md:text-6xl font-bold uppercase">
                                SILOED <span className="text-teal-400">DOMAINS</span>
                            </h2>
                            <p className="text-gray-400 max-w-lg text-sm leading-relaxed mb-6">
                                The platform automatically scopes access control via rigid RBAC mappings—ensuring users naturally only interact with their explicitly assigned domain.
                            </p>

                            <a href="#how-it-works" className="mt-6 inline-block bg-teal-400 hover:bg-teal-300 text-gray-900 font-bold px-8 py-3 rounded text-sm transition-colors tracking-widest">
                                HOW IT WORKS
                            </a>
                        </div>

                        <div ref={servicesCardsRef} className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <PixelCard variant="blue" className="w-full h-auto !aspect-auto bg-[#1a1d24]/50 backdrop-blur-sm border-white/5 rounded-xl hover:bg-[#1a1d24] transition-all group">
                                <div className="p-8 flex flex-col items-center text-center">
                                    <div className="text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                                        <Monitor size={40} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Dispatcher Hub</h3>
                                    <p className="text-gray-500 text-xs relative z-10">Real-time trip instantiation binding idle drivers and registered vehicles together.</p>
                                </div>
                            </PixelCard>
                            <PixelCard variant="blue" className="w-full h-auto !aspect-auto bg-[#1a1d24]/50 backdrop-blur-sm border-white/5 rounded-xl hover:bg-[#1a1d24] transition-all group">
                                <div className="p-8 flex flex-col items-center text-center">
                                    <div className="text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                                        <Grid size={40} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Fleet Management</h3>
                                    <p className="text-gray-500 text-xs relative z-10">Odometer tracking and active preventative maintenance shop logs for physical assets.</p>
                                </div>
                            </PixelCard>
                            <PixelCard variant="blue" className="w-full h-auto !aspect-auto bg-[#1a1d24]/50 backdrop-blur-sm border-white/5 rounded-xl hover:bg-[#1a1d24] transition-all group">
                                <div className="p-8 flex flex-col items-center text-center">
                                    <div className="text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                                        <LayoutTemplate size={40} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Financial Accounting</h3>
                                    <p className="text-gray-500 text-xs relative z-10">Automatically log toll, maintenance, and fuel expenditures against specific trip IDs.</p>
                                </div>
                            </PixelCard>
                            <PixelCard variant="default" className="w-full h-auto !aspect-auto bg-[#1a1d24]/50 backdrop-blur-sm border-white/5 rounded-xl hover:bg-[#1a1d24] transition-all group">
                                <div className="p-8 flex flex-col items-center text-center">
                                    <div className="text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                                        <ImageIcon size={40} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Safety Profiles</h3>
                                    <p className="text-gray-500 text-xs relative z-10">Hard-lock users from duty if compliance records dictate suspended states.</p>
                                </div>
                            </PixelCard>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" ref={aboutRef} className="relative min-h-screen flex items-center py-20 bg-[#0c0e12]">
                    <div className="absolute top-1/2 right-1/4 -translate-y-1/2 text-[40vh] font-bold text-white/[0.02] select-none pointer-events-none z-0 tracking-tighter">
                        W
                    </div>

                    <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row-reverse items-center gap-16 z-10 relative">
                        <div ref={aboutImageRef} className="flex-1 w-full flex justify-center md:justify-end">
                            {/* Reusing the same asset or a subtle graphic context */}
                            <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(45,212,191,0.1)] flex items-center justify-center p-8 bg-gradient-to-br from-[#1a1d24] to-[#0f1115] border border-white/5">
                                <img
                                    src="/delivery-truck.png"
                                    alt="How It Works - Delivery Engine"
                                    className="w-full h-full object-contain drop-shadow-2xl animate-[float_4s_ease-in-out_infinite_reverse]"
                                />
                            </div>
                        </div>

                        <div ref={aboutTextRef} className="flex-1 space-y-8">
                            <div>
                                <div className="text-teal-400 text-sm font-bold tracking-widest uppercase mb-2">
                                    HOW IT WORKS
                                </div>
                                <h2 className="text-5xl md:text-5xl font-bold uppercase">
                                    THE LOGISTICS <span className="text-teal-400">ENGINE</span>
                                </h2>
                            </div>

                            <div className="space-y-6">
                                {/* Step 1 */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 shrink-0 rounded-full bg-teal-400/10 border border-teal-400/30 flex items-center justify-center text-teal-400 font-bold text-lg">
                                        1
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-xl mb-2">Register Assets & Capital</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Safety Officers and Fleet Managers upload Drivers and Physical Vehicles into the ecosystem databases to track capacities, odometer stats, and safety clearances.
                                        </p>
                                    </div>
                                </div>
                                {/* Step 2 */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 shrink-0 rounded-full bg-teal-400/10 border border-teal-400/30 flex items-center justify-center text-teal-400 font-bold text-lg">
                                        2
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-xl mb-2">Dispatch & Monitoring</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            The Dispatcher role binds a Vehicle, Driver, and Cargo Payload into an active Trip.
                                            The Command Center dashboard visualizes this real-time transition across the fleet.
                                        </p>
                                    </div>
                                </div>
                                {/* Step 3 */}
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 shrink-0 rounded-full bg-teal-400/10 border border-teal-400/30 flex items-center justify-center text-teal-400 font-bold text-lg">
                                        3
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-xl mb-2">Financial Accounting</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            Upon completion, Financial Analysts log expenditures (fuel, maintenance, tolls) against the localized trip ID, automatically computing Fleet ROI and Net Revenue visualizations.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Stats Section just to match bottom of the image slightly */}
                <section className="py-20 border-t border-white/5 relative z-10 hidden md:block">
                    <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-8 text-center bg-[#1a1d24]/30 py-8 rounded-2xl backdrop-blur-sm">
                        <div>
                            <div className="text-teal-400 font-bold flex justify-center mb-2"><Grid size={32} /></div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">PLEASURE</div>
                            <div className="text-3xl font-bold text-white">99%</div>
                        </div>
                        <div>
                            <div className="text-teal-400 font-bold flex justify-center mb-2"><LayoutTemplate size={32} /></div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">CUSTOMER</div>
                            <div className="text-3xl font-bold text-white">5,060</div>
                        </div>
                        <div>
                            <div className="text-teal-400 font-bold flex justify-center mb-2"><Monitor size={32} /></div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">TEAM MEMBERS</div>
                            <div className="text-3xl font-bold text-white">25</div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default LandingPage;
