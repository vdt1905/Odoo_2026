import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import Sidebar from './Sidebar';
import { Send, MapPin, Truck, User, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const TripDispatcher = () => {
    const { isAuthenticated } = useAuthStore();

    // Data State
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        vehicle: '',
        driver: '',
        cargoWeight: '',
        origin: '',
        destination: '',
        estimatedFuelCost: ''
    });
    const [formError, setFormError] = useState('');

    const mainContentRef = useRef(null);
    const formRef = useRef(null);
    const boardRef = useRef(null);

    const fetchData = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const headers = { Authorization: `Bearer ${storedUser?.token}` };

            const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
                axios.get('http://localhost:3000/api/trips', { headers }),
                axios.get('http://localhost:3000/api/vehicles', { headers }),
                axios.get('http://localhost:3000/api/drivers', { headers })
            ]);

            setTrips(tripsRes.data);
            setVehicles(vehiclesRes.data);
            setDrivers(driversRes.data);
        } catch (error) {
            console.error('Error fetching dispatch data:', error);
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
                .fromTo(formRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
                .fromTo(boardRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }, "-=0.4");
        }
    }, [isLoading]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            await axios.post('http://localhost:3000/api/trips', formData, {
                headers: { Authorization: `Bearer ${storedUser?.token}` }
            });
            setFormData({ vehicle: '', driver: '', cargoWeight: '', origin: '', destination: '', estimatedFuelCost: '' });
            fetchData(); // Refresh all data to update availability states
        } catch (error) {
            setFormError(error.response?.data?.message || 'Error creating trip');
        }
    };

    const updateTripStatus = async (tripId, newStatus) => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            await axios.put(`http://localhost:3000/api/trips/${tripId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${storedUser?.token}` }
            });
            fetchData(); // Refresh to update vehicle/driver states globally
        } catch (error) {
            console.error('Error updating trip status:', error);
        }
    };

    // Filter available resources natively via DB Boolean state
    const availableVehicles = vehicles.filter(v => v.status === 'Available');
    const availableDrivers = drivers.filter(d => d.isAvailableForDispatch === true);

    return (
        <div className="flex h-screen bg-[#050b14] overflow-hidden font-sans text-slate-200 selection:bg-[#00ced1]/30">
            <Sidebar />

            <main className="flex-1 overflow-x-hidden overflow-y-auto relative hidden-scrollbar" id="main-scroll">
                {/* Background Details */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <div className="p-8 lg:p-10 max-w-7xl mx-auto relative z-10 min-h-full" ref={mainContentRef} style={{ opacity: 0 }}>
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Trip Dispatcher</h1>
                        <p className="text-slate-400 text-sm md:text-base">Assign available assets to active delivery routes and manage flow state.</p>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

                        {/* Dispatch Form (Left Panel) */}
                        <div className="xl:col-span-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl relative overflow-hidden" ref={formRef}>
                            {/* Accent Glow */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00ced1] to-indigo-500"></div>

                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Send size={20} className="text-[#00ced1]" />
                                Create Dispatch
                            </h2>

                            {formError && (
                                <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-pulse">
                                    {formError}
                                </div>
                            )}

                            <form onSubmit={handleFormSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1 flex items-center gap-2"><Truck size={14} /> Select Vehicle</label>
                                    <select required value={formData.vehicle} onChange={e => setFormData({ ...formData, vehicle: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 text-sm transition-all appearance-none">
                                        <option value="" disabled>-- Available Fleet --</option>
                                        {availableVehicles.map(v => (
                                            <option key={v._id} value={v._id}>{v.name} ({v.maxLoadCapacity}kg cap)</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1 flex items-center gap-2">Cargo Weight (kg)</label>
                                    <input type="number" required value={formData.cargoWeight} onChange={e => setFormData({ ...formData, cargoWeight: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 text-sm transition-all font-mono" placeholder="e.g. 4500" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1 flex items-center gap-2"><User size={14} /> Assign Driver</label>
                                    <select required value={formData.driver} onChange={e => setFormData({ ...formData, driver: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-[#0b1120] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 text-sm transition-all appearance-none col-span-2">
                                        <option value="" disabled>-- Available Drivers --</option>
                                        {availableDrivers.map(d => (
                                            <option key={d._id} value={d._id}>{d.name} (Score: {d.safetyScore})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1 flex items-center gap-2"><MapPin size={14} /> Origin Address</label>
                                    <input type="text" required value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 text-sm transition-all" placeholder="e.g. Mumbai" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1 flex items-center gap-2"><MapPin size={14} /> Destination</label>
                                    <input type="text" required value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 text-sm transition-all" placeholder="e.g. Pune" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1 flex items-center gap-2">Estimated Fuel Cost (₹)</label>
                                    <input type="number" required value={formData.estimatedFuelCost} onChange={e => setFormData({ ...formData, estimatedFuelCost: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 text-sm transition-all font-mono" placeholder="e.g. 1500" />
                                </div>

                                <button type="submit" className="w-full py-3 mt-4 rounded-xl bg-[#00ced1] text-[#050b14] font-bold shadow-[0_0_15px_rgba(0,206,209,0.3)] hover:shadow-[0_0_20px_rgba(0,206,209,0.5)] transition-all text-sm tracking-wide transform hover:-translate-y-0.5" disabled={isLoading}>
                                    Confirm & Dispatch
                                </button>
                            </form>
                        </div>

                        {/* Active Dispatch Board (Right Panel) */}
                        <div className="xl:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl flex flex-col h-[750px] relative overflow-hidden" ref={boardRef}>
                            {/* Accent Glow */}
                            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-[#00ced1]"></div>

                            {/* Table Controls */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 pt-2">
                                <div className="relative w-full sm:w-96">
                                    <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b1120] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00ced1]/50 transition-all shadow-inner" />
                                    <Search className="absolute left-3.5 top-3text-white/40" size={16} />
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-5 py-2.5 text-xs font-bold tracking-wide rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors shadow-sm">Group by</button>
                                    <button className="px-5 py-2.5 text-xs font-bold tracking-wide rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors shadow-sm">Filter</button>
                                    <button className="px-5 py-2.5 text-xs font-bold tracking-wide rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors shadow-sm">Sort by...</button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="flex-1 overflow-x-auto overflow-y-auto hidden-scrollbar rounded-xl border border-white/10 bg-black/20">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-[#0b1120] text-[#00ced1] border-b border-white/10 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80">Trip</th>
                                            <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80">Fleet Type</th>
                                            <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80">Origin</th>
                                            <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80">Destination</th>
                                            <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {trips.filter(t => t.status === 'Draft' || t.status === 'Dispatched').length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500 text-sm italic">
                                                    No active trips available.
                                                </td>
                                            </tr>
                                        ) : (
                                            trips.filter(t => t.status === 'Draft' || t.status === 'Dispatched').map((trip, idx) => (
                                                <tr key={trip._id} className="hover:bg-white/[0.04] transition-colors group">
                                                    <td className="px-6 py-5">
                                                        <span className="font-mono text-white/60 font-medium">{idx + 1}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:border-[#00ced1]/30 transition-colors">
                                                                <Truck size={16} className="text-white/60 group-hover:text-[#00ced1]/80 transition-colors" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-200 text-base">{trip.vehicle?.name || 'Unknown'}</span>
                                                                <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5">{trip.cargoWeight} kg | Driver: {trip.driver?.name?.split(' ')[0] || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-slate-300 font-medium">{trip.origin || 'HQ'}</td>
                                                    <td className="px-6 py-5 text-slate-300 font-medium">{trip.destination}</td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-4">
                                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${trip.status === 'Dispatched' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                }`}>
                                                                {trip.status === 'Dispatched' ? 'On Way' : 'Pending'}
                                                            </span>

                                                            {/* Action Buttons */}
                                                            {trip.status === 'Draft' ? (
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => updateTripStatus(trip._id, 'Dispatched')} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:scale-110 transition-all" title="Dispatch"><Send size={14} /></button>
                                                                    <button onClick={() => updateTripStatus(trip._id, 'Cancelled')} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:scale-110 transition-all" title="Cancel"><XCircle size={14} /></button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => updateTripStatus(trip._id, 'Completed')} className="p-2 rounded-lg bg-[#00ced1]/10 text-[#00ced1] hover:bg-[#00ced1]/20 hover:scale-110 transition-all border border-[#00ced1]/20 shadow-[0_0_10px_rgba(0,206,209,0.1)]" title="Mark Completed"><CheckCircle size={14} /></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TripDispatcher;
