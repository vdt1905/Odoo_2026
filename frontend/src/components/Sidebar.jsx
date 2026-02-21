import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { LayoutDashboard, Truck, ClipboardList, PenTool, Receipt, Shield, Activity, LogOut, Menu } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuthStore();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
    };

    const navItems = [
        { name: 'Command Center', path: '/dashboard', icon: LayoutDashboard, roles: ['Manager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst'] },
        { name: 'Vehicle Registry', path: '/vehicles', icon: Truck, roles: ['Manager'] },
        { name: 'Trip Dispatcher', path: '/dispatch', icon: ClipboardList, roles: ['Dispatcher'] },
        { name: 'Maintenance', path: '/maintenance', icon: PenTool, roles: ['Manager'] },
        { name: 'Expenses', path: '/expenses', icon: Receipt, roles: ['Manager', 'FinancialAnalyst'] },
        { name: 'Safety Profiles', path: '/safety', icon: Shield, roles: ['SafetyOfficer'] },
        { name: 'Analytics', path: '/analytics', icon: Activity, roles: ['FinancialAnalyst'] },
    ];

    return (
        <aside className={`${isCollapsed ? 'w-[5.5rem]' : 'w-64'} m-4 flex-shrink-0 bg-gradient-to-b from-[#00ced1]/20 via-[#0b1120]/95 to-[#0b1120] backdrop-blur-2xl border border-[#00ced1]/30 rounded-[2rem] flex flex-col h-[calc(100vh-2rem)] overflow-hidden shadow-[0_0_40px_rgba(0,206,209,0.15)] relative z-20 transition-all duration-300 ease-in-out`}>

            {/* Header: Menu Toggle & Brand */}
            <div className={`p-6 pb-2 transition-all duration-300 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>

                {/* Brand text (Hidden when collapsed) */}
                <h1 className={`text-2xl font-black text-[#00ced1] tracking-tighter drop-shadow-[0_0_12px_rgba(0,206,209,0.5)] flex items-center gap-2 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 h-0 overflow-hidden' : 'opacity-100 w-auto h-auto'}`}>
                    FleetFlow
                </h1>

                {/* Collapse Toggle Button (Menu Icon) */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-slate-400 hover:text-[#00ced1] hover:scale-110 transition-all group shrink-0"
                    title="Toggle Sidebar"
                >
                    <Menu size={24} className="drop-shadow-md group-hover:drop-shadow-[0_0_8px_rgba(0,206,209,0.6)]" />
                </button>
            </div>

            {/* Collapsed Window Controls (Only visible when collapsed) */}


            {/* Navigation MENU */}
            <div className={`px-6 py-2 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100'}`}>
                <div className="text-[10px] font-bold text-white/50 tracking-widest mb-4">MENU</div>
            </div>

            {/* Navigation Links */}
            <nav className={`flex-1 overflow-x-hidden overflow-y-auto hidden-scrollbar pb-4 mt-2 transition-all duration-300 ${isCollapsed ? 'px-2 space-y-2 relative left-1 flex flex-col items-center' : 'px-3 space-y-1'}`}>
                {navItems.filter(item => item.roles.includes(user?.role)).map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        title={isCollapsed ? item.name : ""}
                        className={({ isActive }) =>
                            `flex items-center gap-4 py-3 transition-all duration-300 group relative overflow-hidden ${isActive
                                ? 'text-white'
                                : 'text-slate-400 hover:text-white'
                            } ${isCollapsed ? 'justify-center rounded-2xl w-12 h-12' : 'px-4 rounded-xl'}`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {/* Active Indicator Glow Pill */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-md shadow-[0_0_12px_rgba(255,255,255,0.9)] z-10 transition-all"></div>
                                )}

                                {/* Hover background */}
                                <div className="absolute inset-x-0 inset-y-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                {/* Soft gradient on active */}
                                {isActive && <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.08] to-transparent"></div>}

                                <item.icon
                                    size={18}
                                    className={`relative z-10 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] text-white' : 'group-hover:scale-110'}`}
                                />
                                {!isCollapsed && (
                                    <span className={`relative z-10 font-semibold text-sm tracking-wide whitespace-nowrap transition-opacity duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'opacity-100'}`}>
                                        {item.name}
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Info / Bottom Area */}
            <div className={`mt-auto border-t border-white/5 bg-gradient-to-b from-transparent to-black/30 transition-all duration-300 ${isCollapsed ? 'p-3 flex flex-col items-center' : 'p-5'}`}>
                <div className={`flex items-center gap-3 mb-5 ${isCollapsed ? 'justify-center mx-auto mb-3' : ''}`}>
                    <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ced1] to-[#018b8b] flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(0,206,209,0.4)] border border-white/10 relative z-10">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#27c93f] rounded-full border-2 border-[#121826] z-20"></div>
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden transition-all duration-300 opacity-100">
                            <h3 className="text-white font-bold text-sm truncate drop-shadow-sm">{user?.name || 'User'}</h3>
                            <p className="text-[10px] text-[#00ced1] tracking-wider truncate uppercase font-semibold">{user?.role || 'Role'}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    title={isCollapsed ? "Sign Out" : ""}
                    className={`w-full flex items-center px-2 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all group ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                >
                    <span className={`text-xs font-semibold tracking-wide flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                        <LogOut size={16} className={`group-hover:-translate-x-1 transition-transform ${isCollapsed ? 'group-hover:translate-x-0' : ''}`} />
                        {!isCollapsed && "Sign Out"}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0)] group-hover:shadow-[0_0_8px_rgba(248,113,113,0.8)] transition-all"></div>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
