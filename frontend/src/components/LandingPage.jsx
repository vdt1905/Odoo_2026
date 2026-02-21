import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Monitor, Grid, LayoutTemplate, Image as ImageIcon, Sun, Layout } from 'lucide-react';
import ColorBends from './ColorBends';
import PixelCard from './PixelCard';

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
                        HYKROX
                        <div className="text-[10px] text-teal-400/60 -mt-1 tracking-widest font-normal">unique designs</div>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-gray-400">
                        <a href="#home" className="text-teal-400 transition-colors">HOME</a>

                        <a href="#services" className="hover:text-white transition-colors">SERVICES</a>
                        <a href="#about" className="hover:text-white transition-colors">ABOUT US</a>


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
                            <div className="text-teal-400 text-sm font-bold tracking-widest uppercase">
                                CREATIVE DESIGNER
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold leading-tight uppercase relative">
                                WE ARE <span className="text-teal-400">CREATIVE</span><br />
                                DESIGNERS
                            </h1>
                            <p className="text-gray-400 max-w-lg text-sm md:text-base leading-relaxed">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                            </p>
                        </div>

                        <div ref={heroImageRef} className="flex-1 w-full flex justify-center md:justify-end">
                            <div className="relative w-72 h-[450px] md:w-80 md:h-[500px] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(45,212,191,0.2)]">
                                <img
                                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                                    alt="Creative Portrait"
                                    className="w-full h-full object-cover object-center"
                                />
                                <div className="absolute inset-0 bg-teal-500/10 mix-blend-overlay"></div>
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-400/30 rounded-full blur-[80px]"></div>
                                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px]"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section id="services" ref={servicesRef} className="relative min-h-screen flex items-center py-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[50vh] font-bold text-white/[0.02] select-none pointer-events-none z-0 tracking-tighter">
                        Y
                    </div>

                    <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center gap-16 z-10 relative">
                        <div ref={servicesTextRef} className="flex-1 space-y-6">
                            <div className="text-teal-400 text-sm font-bold tracking-widest uppercase">
                                OUR SERVICES
                            </div>
                            <h2 className="text-5xl md:text-6xl font-bold uppercase">
                                WHAT WE <span className="text-teal-400">DO?</span>
                            </h2>
                            <p className="text-gray-400 max-w-lg text-sm leading-relaxed">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                            </p>
                            <p className="text-gray-400 max-w-lg text-sm leading-relaxed pb-4">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                            </p>
                            <button className="bg-teal-400 hover:bg-teal-300 text-gray-900 font-bold px-8 py-3 rounded text-sm transition-colors tracking-widest">
                                VIEW ALL
                            </button>
                        </div>

                        <div ref={servicesCardsRef} className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Card 1 */}
                            <PixelCard variant="blue" className="w-full h-auto !aspect-auto bg-[#1a1d24]/50 backdrop-blur-sm border-white/5 rounded-xl hover:bg-[#1a1d24] transition-all group">
                                <div className="p-8 flex flex-col items-center text-center">
                                    <div className="text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                                        <Monitor size={40} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Website Design</h3>
                                    <p className="text-gray-500 text-xs relative z-10">We can design for you a website and we can upload them.</p>
                                </div>
                            </PixelCard>
                            {/* Card 2 */}
                            <PixelCard variant="blue" className="w-full h-auto !aspect-auto bg-[#1a1d24]/50 backdrop-blur-sm border-white/5 rounded-xl hover:bg-[#1a1d24] transition-all group">
                                <div className="p-8 flex flex-col items-center text-center">
                                    <div className="text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                                        <Grid size={40} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Mobile & Desktop App</h3>
                                    <p className="text-gray-500 text-xs relative z-10">We can create for you mobile and desktop app.</p>
                                </div>
                            </PixelCard>
                            {/* Card 3 */}
                            <PixelCard variant="blue" className="w-full h-auto !aspect-auto bg-[#1a1d24]/50 backdrop-blur-sm border-white/5 rounded-xl hover:bg-[#1a1d24] transition-all group">
                                <div className="p-8 flex flex-col items-center text-center">
                                    <div className="text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                                        <LayoutTemplate size={40} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">UI & UX Design</h3>
                                    <p className="text-gray-500 text-xs relative z-10">We can create for you mobile and desktop app.</p>
                                </div>
                            </PixelCard>
                            {/* Card 4 */}
                            <PixelCard variant="default" className="w-full h-auto !aspect-auto bg-[#1a1d24]/50 backdrop-blur-sm border-white/5 rounded-xl hover:bg-[#1a1d24] transition-all group">
                                <div className="p-8 flex flex-col items-center text-center">
                                    <div className="text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                                        <ImageIcon size={40} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Editing Photo</h3>
                                    <p className="text-gray-500 text-xs relative z-10">We can design for you a website and we can upload them.</p>
                                </div>
                            </PixelCard>
                        </div>
                    </div>
                </section>

                {/* About Us Section */}
                <section id="about" ref={aboutRef} className="relative min-h-screen flex items-center py-20">
                    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 text-[40vh] font-bold text-white/[0.02] select-none pointer-events-none z-0 tracking-tighter">
                        O
                    </div>

                    <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center gap-16 z-10 relative">
                        <div ref={aboutImageRef} className="flex-1 w-full flex justify-center md:justify-start">
                            <div className="relative w-80 h-[500px] rounded-full overflow-hidden shrink-0 grayscale hover:grayscale-0 transition-all duration-700">
                                <img
                                    src="https://images.unsplash.com/photo-1516280440502-6101ce6d55ea?q=80&w=2670&auto=format&fit=crop"
                                    alt="About Us"
                                    className="w-full h-full object-cover object-center"
                                />
                                <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
                            </div>
                        </div>

                        <div ref={aboutTextRef} className="flex-1 space-y-6">
                            <div className="text-teal-400 text-sm font-bold tracking-widest uppercase">
                                ABOUT US
                            </div>
                            <h2 className="text-5xl md:text-6xl font-bold uppercase">
                                WHO ARE <span className="text-teal-400">WE?</span>
                            </h2>
                            <p className="text-gray-400 max-w-lg text-sm leading-relaxed mb-6">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type.
                            </p>

                            <div className="grid grid-cols-2 gap-8 pt-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-white">
                                        <Sun className="text-teal-400" size={24} />
                                        <h4 className="font-bold text-sm">Clean Code</h4>
                                    </div>
                                    <p className="text-gray-500 text-xs leading-relaxed">
                                        Lorem Ipsum is simply dummy text of the printing.
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-3 text-white">
                                        <Layout className="text-teal-400" size={24} />
                                        <h4 className="font-bold text-sm">Modern Design</h4>
                                    </div>
                                    <p className="text-gray-500 text-xs leading-relaxed">
                                        Lorem Ipsum is simply dummy text of the printing.
                                    </p>
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
