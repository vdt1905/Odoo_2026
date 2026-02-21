import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import Sidebar from './Sidebar';
import { Receipt, DollarSign, Calendar, Truck, Tag, Plus, X, Activity } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Expenses = () => {
    const { isAuthenticated } = useAuthStore();

    // Data State
    const [expenses, setExpenses] = useState([]);
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        trip: '',
        distance: '',
        fuelCost: '',
        miscCost: '',
        status: 'Pending'
    });
    const [formError, setFormError] = useState('');

    const mainContentRef = useRef(null);
    const formRef = useRef(null);
    const tableRef = useRef(null);
    const summaryRef = useRef(null);

    const fetchData = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const headers = { Authorization: `Bearer ${storedUser?.token}` };

            const [expensesRes, tripsRes] = await Promise.all([
                axios.get('http://localhost:3000/api/expenses', { headers }),
                axios.get('http://localhost:3000/api/trips', { headers })
            ]);

            setExpenses(expensesRes.data);
            setTrips(tripsRes.data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isLoading && mainContentRef.current) {
            const tl = gsap.timeline();
            tl.fromTo(mainContentRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
                .fromTo(summaryRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.2")
                .fromTo(tableRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.2");
        }
    }, [isLoading]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            await axios.post('http://localhost:3000/api/expenses', formData, {
                headers: { Authorization: `Bearer ${storedUser?.token}` }
            });
            setFormData({ trip: '', distance: '', fuelCost: '', miscCost: '', status: 'Pending' });
            setIsAddModalOpen(false);
            fetchData();
        } catch (error) {
            setFormError(error.response?.data?.message || 'Error logging expense');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Done': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Approved': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    // Calculate aggregations
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.totalCost, 0);
    const fuelExpenses = expenses.reduce((sum, exp) => sum + exp.fuelCost, 0);
    const miscExpenses = expenses.reduce((sum, exp) => sum + exp.miscCost, 0);

    return (
        <div className="flex h-screen bg-[#050b14] overflow-hidden font-sans text-slate-200 selection:bg-purple-500/30">
            <Sidebar />

            <main className="flex-1 overflow-x-hidden overflow-y-auto relative hidden-scrollbar" id="main-scroll">
                {/* Background Details */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <div className="p-8 lg:p-10 max-w-7xl mx-auto relative z-10 min-h-full" ref={mainContentRef} style={{ opacity: 0 }}>

                    {/* Header & Aggregates */}
                    <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Financial Logs</h1>
                            <p className="text-slate-400 text-sm md:text-base">Track fleet operating costs, fuel logs, and miscellaneous expenses.</p>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-5 py-2.5 rounded-xl bg-purple-500 font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all flex items-center gap-2 text-sm"
                            >
                                <Plus size={16} /> Add an Expense
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm font-medium mb-1 tracking-wide uppercase">All-Time Fleet Total</p>
                                <h3 className="text-2xl font-bold text-white">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <DollarSign size={24} />
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm font-medium mb-1 tracking-wide uppercase">Total Fuel Costs</p>
                                <h3 className="text-2xl font-bold text-sky-400">${fuelExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
                                <Tag size={24} />
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm font-medium mb-1 tracking-wide uppercase">Misc Expenditures</p>
                                <h3 className="text-2xl font-bold text-amber-400">${miscExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                                <Activity size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden" ref={tableRef}>
                        <div className="overflow-x-auto hidden-scrollbar">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#0b1120] text-slate-400 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase opacity-80">Trip ID</th>
                                        <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase opacity-80">Driver</th>
                                        <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase opacity-80">Distance</th>
                                        <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase opacity-80">Fuel Exp</th>
                                        <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase opacity-80">Misc Exp</th>
                                        <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase opacity-80">Total Expense</th>
                                        <th className="px-6 py-4 font-semibold tracking-wider text-xs uppercase opacity-80">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex justify-center"><div className="w-8 h-8 border-t-2 border-purple-500 rounded-full animate-spin"></div></div>
                                            </td>
                                        </tr>
                                    ) : expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-slate-500 italic">No expenses currently logged.</td>
                                        </tr>
                                    ) : (
                                        expenses.map(exp => (
                                            <tr key={exp._id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4 font-mono text-slate-300 font-medium">#{exp.trip?._id.substring(0, 8).toUpperCase()}</td>
                                                <td className="px-6 py-4 font-bold text-white">{exp.driver?.name}</td>
                                                <td className="px-6 py-4 text-slate-400">{exp.distance} km</td>
                                                <td className="px-6 py-4 font-mono text-slate-400">${exp.fuelCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4 font-mono text-slate-400">${exp.miscCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4 font-mono font-bold text-purple-400">${exp.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border inline-flex ${getStatusColor(exp.status)}`}>
                                                        {exp.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Add Expense Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                        <div className="relative bg-[#0b1120] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Receipt size={20} className="text-purple-400" />
                                    New Expense
                                </h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {formError && (
                                <div className="mx-6 mt-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-pulse">
                                    {formError}
                                </div>
                            )}

                            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Trip ID</label>
                                    <select required value={formData.trip} onChange={e => setFormData({ ...formData, trip: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-all appearance-none" style={{ backgroundColor: '#0b1120' }}>
                                        <option value="" disabled>-- Select Trip --</option>
                                        {trips.filter(t => t.status === 'Dispatched' || t.status === 'Completed').map(t => (
                                            <option key={t._id} value={t._id}>
                                                #{t._id.substring(0, 8).toUpperCase()} - {t.origin} to {t.destination} ({t.status})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Driver</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={trips.find(t => t._id === formData.trip)?.driver ? trips.find(t => t._id === formData.trip).driver.name : '-- Auto-filled --'}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm opacity-70 cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Distance (km)</label>
                                    <input type="number" required value={formData.distance} onChange={e => setFormData({ ...formData, distance: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-all font-mono" placeholder="0" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Fuel Cost ($)</label>
                                        <input type="number" step="0.01" required value={formData.fuelCost} onChange={e => setFormData({ ...formData, fuelCost: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-all font-mono" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Misc Exp ($)</label>
                                        <input type="number" step="0.01" required value={formData.miscCost} onChange={e => setFormData({ ...formData, miscCost: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-all font-mono" placeholder="0.00" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Status</label>
                                    <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-all appearance-none" style={{ backgroundColor: '#0b1120' }}>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 transition-colors text-sm">Cancel</button>
                                    <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-500 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all text-sm" disabled={isLoading}>Create Detail</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Expenses;
