import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const containerRef = useRef(null);
    const sectionsRef = useRef([]);

    useEffect(() => {
        // Background stays static via CSS (fixed positioning).
        // Sections will zoom in as they enter the viewport.

        sectionsRef.current.forEach((section, index) => {
            // Zoom in animation: from scale 0.5 and opacity 0 to scale 1 and opacity 1.
            gsap.fromTo(section,
                {
                    scale: 0.5,
                    opacity: 0,
                    y: 100
                },
                {
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "back.out(1.2)",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 80%", // Start animation when top of section hits 80% of viewport height
                        end: "top 30%",   // End animation when it hits 30%
                        scrub: 1,         // Smooth scrubbing effect tied to scrollbar
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        return () => {
            // Cleanup scroll triggers on unmount
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    const addToRefs = (el) => {
        if (el && !sectionsRef.current.includes(el)) {
            sectionsRef.current.push(el);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full bg-[var(--color-dark-bg)] text-slate-100 overflow-x-hidden font-sans">

            {/* Fixed Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[120px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mask-image:linear-gradient(to_bottom,white,transparent)"></div>
            </div>

            {/* Content wrapper with z-index to stay above fixed background */}
            <div className="relative z-10">

                {/* Hero Section */}
                <section className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative">
                    <div className="max-w-4xl pt-20">
                        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6">
                            Welcome to <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)' }}>Circle</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                            Experience the next generation of seamless networking. Scroll down to discover more, or jump right into action.
                        </p>
                        <div className="flex items-center justify-center gap-6">
                            <Link to="/signup" className="px-8 py-4 rounded-full text-white font-bold text-lg hover:scale-105 transition-transform" style={{ background: 'linear-gradient(to right, #2563eb, #1e40af)', boxShadow: '0 0 30px rgba(37, 99, 235, 0.4)' }}>
                                Get Started Now
                            </Link>
                            <Link to="/login" className="px-8 py-4 rounded-full border text-lg hover:bg-blue-900/40 transition-all font-bold" style={{ borderColor: 'rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}>
                                Sign In
                            </Link>
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 animate-bounce flex flex-col items-center">
                        <span className="text-sm font-medium mb-2 uppercase tracking-widest">Scroll Down</span>
                        <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex justify-center p-1">
                            <div className="w-1.5 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </section>

                {/* Zooming Section 1 */}
                <section className="min-h-screen flex items-center justify-center p-6">
                    <div ref={addToRefs} className="max-w-5xl w-full bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-12 md:p-20 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mb-6 border border-teal-500/30 text-2xl font-bold">1</div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">Expand Your Reach</h2>
                            <p className="text-lg text-slate-400 leading-relaxed font-light">
                                Connect with thousands of professionals worldwide using our cutting-edge network infrastructure. Built with speed and reliability in mind.
                            </p>
                        </div>
                        <div className="flex-1 w-full aspect-square md:aspect-auto md:h-80 rounded-3xl border border-slate-600/30 flex items-center justify-center overflow-hidden relative shadow-inner" style={{ background: 'linear-gradient(to top right, rgba(30, 58, 138, 0.5), rgba(15, 23, 42, 0.5))' }}>
                            <div className="absolute inset-0 opacity-20 blur-2xl" style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)' }}></div>
                            <div className="w-32 h-32 rounded-full border-[8px] border-white/10 flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full border-[8px] border-white/20 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full" style={{ backgroundColor: '#60a5fa', boxShadow: '0 0 40px rgba(96, 165, 250, 0.6)' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Zooming Section 2 */}
                <section className="min-h-screen flex items-center justify-center p-6">
                    <div ref={addToRefs} className="max-w-5xl w-full bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-12 md:p-20 rounded-[3rem] shadow-2xl flex flex-col md:flex-row-reverse items-center gap-12">
                        <div className="flex-1">
                            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 text-2xl font-bold">2</div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">Secure & Private</h2>
                            <p className="text-lg text-slate-400 leading-relaxed font-light">
                                Your data is encrypted using military-grade standards. We prioritize your privacy above all else, ensuring that your connections remain yours alone.
                            </p>
                        </div>
                        <div className="flex-1 w-full aspect-video md:aspect-auto md:h-80 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-slate-600/30 flex flex-col items-center justify-center p-8 gap-4 shadow-inner relative overflow-hidden">
                            <div className="w-full h-8 bg-slate-800/80 rounded-lg flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                            </div>
                            <div className="w-full flex-1 bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                                <div className="w-3/4 h-4 bg-slate-700 rounded mb-3"></div>
                                <div className="w-1/2 h-4 bg-slate-700 rounded mb-3"></div>
                                <div className="w-full h-4 bg-slate-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Zooming Final Section */}
                <section className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-t from-slate-900 to-transparent">
                    <div ref={addToRefs} className="text-center max-w-3xl">
                        <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white tracking-tighter">Ready to Begin?</h2>
                        <p className="text-xl text-slate-400 mb-12 font-light">
                            Join thousands of others on Circle today. Registration takes less than a minute.
                        </p>
                        <Link to="/signup" className="inline-block px-12 py-5 rounded-full text-white font-bold text-xl hover:scale-110 transition-transform" style={{ background: 'linear-gradient(to right, #2563eb, #1e40af)', boxShadow: '0 0 50px rgba(37, 99, 235, 0.4)' }}>
                            Create Free Account
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Home;
