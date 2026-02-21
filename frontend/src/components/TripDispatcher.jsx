import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import Sidebar from './Sidebar';
import { Send, MapPin, Truck, User, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import LocationPickerModal from './LocationPickerModal';

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
    const [mapModalType, setMapModalType] = useState(null); // 'origin' | 'destination' | null

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
                <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-[#00ced1]/20 to-indigo-600/20 rounded-full blur-[120px] pointer-events-none opacity-50 mix-blend-screen"></div>
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/20 to-[#00ced1]/20 rounded-full blur-[100px] pointer-events-none opacity-40 mix-blend-screen"></div>

                <div className="p-8 lg:p-10 max-w-7xl mx-auto relative z-10 min-h-full" ref={mainContentRef} style={{ opacity: 0 }}>
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Trip Dispatcher</h1>
                        <p className="text-slate-400 text-sm md:text-base">Assign available assets to active delivery routes and manage flow state.</p>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

                        {/* Dispatch Form (Left Panel) */}
                        <div className="xl:col-span-1 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-[40px] rounded-[2rem] border border-white/[0.08] border-b-black/50 border-r-black/50 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col" ref={formRef}>
                            {/* Accent Glow */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00ced1] to-indigo-500"></div>
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00ced1]/10 rounded-full blur-2xl pointer-events-none"></div>

                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 drop-shadow-sm">
                                <Send size={20} className="text-[#00ced1]" />
                                Create Dispatch
                            </h2>

                            {formError && (
                                <div className="mb-6 p-3 rounded-[1.2rem] bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-pulse shadow-inner">
                                    {formError}
                                </div>
                            )}

                            <form onSubmit={handleFormSubmit} className="space-y-5 relative z-10">
                                <div className="space-y-1.5 group">
                                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-[#00ced1] transition-colors"><Truck size={14} /> Select Vehicle</label>
                                    <select required value={formData.vehicle} onChange={e => setFormData({ ...formData, vehicle: e.target.value })} className="w-full px-4 py-3 rounded-[1.2rem] bg-black/20 backdrop-blur-xl border border-white/10 text-white focus:outline-none focus:border-[#00ced1]/50 focus:bg-black/30 text-sm transition-all appearance-none shadow-inner">
                                        <option value="" disabled className="bg-[#0b1120]">-- Available Fleet --</option>
                                        {availableVehicles.map(v => (
                                            <option key={v._id} value={v._id} className="bg-[#0b1120]">{v.name} ({v.maxLoadCapacity}kg cap)</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5 group">
                                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-[#00ced1] transition-colors">Cargo Weight (kg)</label>
                                    <input type="number" required value={formData.cargoWeight} onChange={e => setFormData({ ...formData, cargoWeight: e.target.value })} className="w-full px-4 py-3 rounded-[1.2rem] bg-black/20 backdrop-blur-xl border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00ced1]/50 focus:bg-black/30 text-sm transition-all font-mono shadow-inner" placeholder="e.g. 4500" />
                                </div>

                                <div className="space-y-1.5 group">
                                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-[#00ced1] transition-colors"><User size={14} /> Assign Driver</label>
                                    <select required value={formData.driver} onChange={e => setFormData({ ...formData, driver: e.target.value })} className="w-full px-4 py-3 rounded-[1.2rem] bg-black/20 backdrop-blur-xl border border-white/10 text-white focus:outline-none focus:border-[#00ced1]/50 focus:bg-black/30 text-sm transition-all appearance-none col-span-2 shadow-inner">
                                        <option value="" disabled className="bg-[#0b1120]">-- Available Drivers --</option>
                                        {availableDrivers.map(d => (
                                            <option key={d._id} value={d._id} className="bg-[#0b1120]">{d.name} (Score: {d.safetyScore})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5 group">
                                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-[#00ced1] transition-colors"><MapPin size={14} /> Origin Address</label>
                                    <div className="flex gap-2">
                                        <input type="text" required value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} className="flex-1 px-4 py-3 rounded-[1.2rem] bg-black/20 backdrop-blur-xl border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00ced1]/50 focus:bg-black/30 text-sm transition-all shadow-inner" placeholder="e.g. Mumbai" />
                                        <button type="button" onClick={() => setMapModalType('origin')} className="px-4 bg-white/5 hover:bg-[#00ced1]/20 text-slate-300 hover:text-[#00ced1] rounded-[1.2rem] border border-white/10 hover:border-[#00ced1]/50 transition-all flex items-center justify-center shrink-0 shadow-sm" title="Pick from Map">
                                            <MapPin size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5 group">
                                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-[#00ced1] transition-colors"><MapPin size={14} /> Destination</label>
                                    <div className="flex gap-2">
                                        <input type="text" required value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} className="flex-1 px-4 py-3 rounded-[1.2rem] bg-black/20 backdrop-blur-xl border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00ced1]/50 focus:bg-black/30 text-sm transition-all shadow-inner" placeholder="e.g. Pune" />
                                        <button type="button" onClick={() => setMapModalType('destination')} className="px-4 bg-white/5 hover:bg-[#00ced1]/20 text-slate-300 hover:text-[#00ced1] rounded-[1.2rem] border border-white/10 hover:border-[#00ced1]/50 transition-all flex items-center justify-center shrink-0 shadow-sm" title="Pick from Map">
                                            <MapPin size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5 group">
                                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-[#00ced1] transition-colors">Estimated Fuel Cost (₹)</label>
                                    <input type="number" required value={formData.estimatedFuelCost} onChange={e => setFormData({ ...formData, estimatedFuelCost: e.target.value })} className="w-full px-4 py-3 rounded-[1.2rem] bg-black/20 backdrop-blur-xl border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00ced1]/50 focus:bg-black/30 text-sm transition-all font-mono shadow-inner" placeholder="e.g. 1500" />
                                </div>

                                <button type="submit" className="w-full py-3.5 mt-6 rounded-[1.2rem] bg-gradient-to-r from-[#00ced1] to-[#018b8b] text-white font-bold shadow-[0_0_20px_rgba(0,206,209,0.4)] hover:shadow-[0_0_30px_rgba(0,206,209,0.6)] transition-all text-sm tracking-wide transform hover:-translate-y-0.5 border border-white/10" disabled={isLoading}>
                                    Confirm & Dispatch
                                </button>
                            </form>
                        </div>

                        {/* Active Dispatch Board (Right Panel) */}
                        <div className="xl:col-span-2 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-[40px] rounded-[2rem] border border-white/[0.08] border-b-black/50 border-r-black/50 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col h-[750px] relative overflow-hidden" ref={boardRef}>
                            {/* Accent Glow */}
                            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-[#00ced1]"></div>
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                            {/* Table Controls */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 pt-2 relative z-10">
                                <div className="relative w-full sm:w-96 group">
                                    <div className="absolute inset-0 bg-[#00ced1]/10 rounded-[1.2rem] blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                                    <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-3 rounded-[1.2rem] bg-black/30 backdrop-blur-xl border border-white/10 border-b-black/50 border-r-black/50 text-white text-sm focus:outline-none focus:border-[#00ced1]/50 focus:bg-black/40 transition-all shadow-inner relative z-10" />
                                    <Search className="absolute left-3.5 top-3.5 text-white/40 relative z-10" size={16} />
                                </div>
                                <div className="flex gap-2 relative z-10">
                                    <button className="px-5 py-3 text-xs font-bold tracking-wide rounded-[1.2rem] bg-white/[0.02] backdrop-blur-xl border border-white/10 border-b-black/50 border-r-black/50 text-white hover:bg-white/[0.06] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)]">Group by</button>
                                    <button className="px-5 py-3 text-xs font-bold tracking-wide rounded-[1.2rem] bg-white/[0.02] backdrop-blur-xl border border-white/10 border-b-black/50 border-r-black/50 text-white hover:bg-white/[0.06] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)]">Filter</button>
                                    <button className="px-5 py-3 text-xs font-bold tracking-wide rounded-[1.2rem] bg-white/[0.02] backdrop-blur-xl border border-white/10 border-b-black/50 border-r-black/50 text-white hover:bg-white/[0.06] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)]">Sort by...</button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="flex-1 overflow-x-auto overflow-y-auto hidden-scrollbar rounded-[1.5rem] border border-white/[0.05] bg-black/20 shadow-inner relative z-10">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-[#050b14]/80 backdrop-blur-md text-[#00ced1] border-b border-white/[0.08] sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80">Trip</th>
                                            <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80">Fleet Type</th>
                                            <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80">Origin</th>
                                            <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80">Destination</th>
                                            <th className="px-6 py-4 font-black tracking-wider text-xs uppercase opacity-80 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.05] bg-transparent">
                                        {trips.filter(t => t.status === 'Draft' || t.status === 'Dispatched').length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-white/50 text-sm font-medium">
                                                    No active trips currently in transit.
                                                </td>
                                            </tr>
                                        ) : (
                                            trips.filter(t => t.status === 'Draft' || t.status === 'Dispatched').map((trip, idx) => (
                                                <tr key={trip._id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-6 py-5">
                                                        <span className="font-mono text-white/50 font-bold relative pl-4">
                                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500/50 group-hover:bg-[#00ced1] transition-colors"></span>
                                                            {idx + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white/[0.02] rounded-xl border border-white/[0.05] group-hover:border-[#00ced1]/30 transition-colors shadow-sm">
                                                                <Truck size={16} className="text-white/60 group-hover:text-[#00ced1] transition-colors drop-shadow-sm" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-200 text-base drop-shadow-sm">{trip.vehicle?.name || 'Unknown'}</span>
                                                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{trip.cargoWeight} kg | Driver: {trip.driver?.name?.split(' ')[0] || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-slate-300 font-bold">
                                                        <div className="truncate w-24 sm:w-32 md:w-48 lg:w-64" title={trip.origin || 'HQ'}>
                                                            {trip.origin || 'HQ'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-slate-300 font-bold">
                                                        <div className="truncate w-24 sm:w-32 md:w-48 lg:w-64" title={trip.destination}>
                                                            {trip.destination}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-4">
                                                            <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border backdrop-blur-md shadow-sm ${trip.status === 'Dispatched' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                }`}>
                                                                {trip.status === 'Dispatched' ? 'On Way' : 'Pending'}
                                                            </span>

                                                            {/* Action Buttons */}
                                                            {trip.status === 'Draft' ? (
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => updateTripStatus(trip._id, 'Dispatched')} className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-transparent backdrop-blur-md border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 hover:scale-110 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.1)]" title="Dispatch"><Send size={14} /></button>
                                                                    <button onClick={() => updateTripStatus(trip._id, 'Cancelled')} className="p-2.5 rounded-xl bg-gradient-to-br from-red-500/20 to-transparent backdrop-blur-md border border-red-500/30 text-red-400 hover:bg-red-500/30 hover:scale-110 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.1)]" title="Cancel"><XCircle size={14} /></button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => updateTripStatus(trip._id, 'Completed')} className="p-2.5 rounded-xl bg-gradient-to-br from-[#00ced1]/20 to-transparent backdrop-blur-md border border-[#00ced1]/30 text-[#00ced1] hover:bg-[#00ced1]/30 hover:scale-110 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.1)]" title="Mark Completed"><CheckCircle size={14} /></button>
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

            <LocationPickerModal
                isOpen={mapModalType !== null}
                onClose={() => setMapModalType(null)}
                title={mapModalType === 'origin' ? "Select Origin Address" : "Select Destination Address"}
                onConfirm={(address) => {
                    setFormData(prev => ({
                        ...prev,
                        [mapModalType]: address
                    }));
                }}
            />
        </div>
    );
};

export default TripDispatcher;
