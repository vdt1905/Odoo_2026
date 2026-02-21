import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { LayoutDashboard, Truck, ClipboardList, PenTool, Receipt, Shield, Activity, LogOut } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuthStore();

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
        <aside className="w-64 flex-shrink-0 bg-[#0b1120] border-r border-white/10 flex flex-col h-full overflow-y-auto">
            {/* Brand */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h1 className="text-2xl font-black bg-gradient-to-r from-[#00ced1] to-[#005c5c] bg-clip-text text-transparent tracking-tighter">
                    FLEETFLOW
                </h1>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-white/10 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00ced1] to-[#005c5c] mx-auto mb-3 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                    {user?.name?.charAt(0) || 'U'}
                </div>
                <h3 className="text-white font-semibold text-sm">{user?.name || 'User'}</h3>
                <p className="text-xs text-[#00ced1] mt-0.5 tracking-wider font-medium">{user?.role || 'Role'}</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-1.5">
                {navItems.filter(item => item.roles.includes(user?.role)).map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive && item.name === 'Command Center'
                                ? 'bg-[#00ced1]/15 text-[#00ced1] shadow-[inset_0_0_12px_rgba(0,206,209,0.15)] shadow-[0_4px_12px_rgba(0,206,209,0.1)] border border-[#00ced1]/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <item.icon
                            size={18}
                            className={`transition-transform duration-300 group-hover:scale-110`}
                        />
                        <span className="font-medium text-sm tracking-wide">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors font-medium text-sm"
                >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
