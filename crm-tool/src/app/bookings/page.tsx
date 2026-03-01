"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Plus, CheckCircle2, Clock, XCircle, Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { myFetch } from "@/lib/myFetch";

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        customer_id: "", date: new Date().toISOString().split('T')[0], slot: "10:00", service_type: "", assigned_to: "", amount: 0, status: "PENDING"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchBookings();
        fetchCustomers();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await myFetch(`/api/bookings`);
            const data = await res.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const custRes = await myFetch('/api/customers');
            const custData = await custRes.json();
            setCustomers(Array.isArray(custData) ? custData : []);

            if (custData.length > 0) {
                setFormData(prev => ({ ...prev, customer_id: custData[0].id }));
            }
        } catch (e) { }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await myFetch('/api/bookings', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchBookings();
            } else {
                const err = await res.json();
                alert("Error: " + (err.error || "Failed to create booking"));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusColors: Record<string, string> = {
        CONFIRMED: "bg-[#e8f1f5] text-[#2c5282] border-[#bce0f0]",
        COMPLETED: "bg-[#f1fae8] text-[#345e22] border-[#daf2c2]",
        CANCELLED: "bg-[#fef2f2] text-[#991b1b] border-[#fee2e2]",
        PENDING: "bg-[#fefce8] text-[#854d0e] border-[#fef08a]",
    };

    const statusIcons: Record<string, React.ReactNode> = {
        CONFIRMED: <Clock size={12} strokeWidth={2} className="mr-1.5" />,
        COMPLETED: <CheckCircle2 size={12} strokeWidth={2} className="mr-1.5" />,
        CANCELLED: <XCircle size={12} strokeWidth={2} className="mr-1.5" />,
        PENDING: <Clock size={12} strokeWidth={2} className="mr-1.5" />,
    };

    return (
        <div className="flex h-screen bg-[#fcfcfc] text-[#111111] overflow-hidden font-sans">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-12 bg-white">

                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-[#111]">
                            Booking Schedule
                        </h1>
                        <p className="text-[#666] mt-1 text-sm">Manage turf slots, activity windows and sessions.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-[#eaeaea] text-[#444] hover:bg-[#fafafa] transition-colors shadow-sm font-medium">
                            <Filter strokeWidth={1.5} size={15} /> Filters
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#222222] text-white hover:bg-[#333333] transition-colors shadow-sm font-medium"
                        >
                            <Plus strokeWidth={2} size={16} /> New Booking
                        </button>
                    </div>
                </header>

                {/* Calendar / Grid Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {loading ? (
                        <div className="col-span-full py-20 text-center text-[#999]">Loading slots...</div>
                    ) : bookings.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-[#666] bg-[#fcfcfc] rounded-xl border border-dashed border-[#d5d5d5]">
                            <CalendarIcon size={36} strokeWidth={1.5} className="mx-auto mb-3 opacity-40" />
                            <p className="font-medium text-[15px] text-[#333]">No bookings recorded yet.</p>
                            <p className="text-sm mt-1">Create a new booking to see it here.</p>
                        </div>
                    ) : (
                        bookings.map((b) => (
                            <div key={b.id} className="bg-white rounded-xl p-5 border border-[#eaeaea] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow group flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wide border ${statusColors[b.status] || "bg-[#f5f5f5] text-[#333] border-[#eaeaea]"}`}>
                                            {statusIcons[b.status]}
                                            {b.status}
                                        </span>
                                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-[#f9f9f9] border border-[#f0f0f0] rounded text-[#666]">
                                            {b.service_type || "General"}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold tracking-tight mb-1 text-[#111]">{b.customers?.name || "Walk-In"}</h3>
                                    <p className="text-sm text-[#777] flex items-center mb-6 font-medium">
                                        ₹{b.amount || 0} {b.assigned_to ? `• ${b.assigned_to}` : ""}
                                    </p>
                                </div>

                                <div className="mt-auto space-y-2">
                                    <div className="flex justify-between items-center text-[13px] py-2 px-3 rounded-lg bg-[#fcfcfc] border border-[#f5f5f5]">
                                        <div className="text-[#777] font-medium">Date</div>
                                        <div className="font-semibold text-[#111]">{b.date ? new Date(b.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}</div>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px] py-2 px-3 rounded-lg bg-[#fcfcfc] border border-[#f5f5f5]">
                                        <div className="text-[#777] font-medium">Time Slot</div>
                                        <div className="font-semibold text-[#475b63]">
                                            {b.slot || "—"}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Add Booking Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
                    <div className="bg-white rounded-xl shadow-xl border border-[#eaeaea] w-[460px] p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="font-semibold text-lg text-[#111]">Create New Booking</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#999] hover:text-[#222]">
                                <X size={18} strokeWidth={1.5} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-[#555] mb-1.5">Customer</label>
                                    <select required value={formData.customer_id} onChange={e => setFormData({ ...formData, customer_id: e.target.value })} className="w-full bg-[#fcfcfc] border border-[#e0e0e0] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all">
                                        <option value="">Select Customer</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#555] mb-1.5">Service Type</label>
                                    <input type="text" placeholder="e.g. Cricket Net" value={formData.service_type} onChange={e => setFormData({ ...formData, service_type: e.target.value })} className="w-full bg-[#fcfcfc] border border-[#e0e0e0] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#555] mb-1.5">Date</label>
                                <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-[#fcfcfc] border border-[#e0e0e0] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-[#555] mb-1.5">Time Slot</label>
                                    <input required type="time" value={formData.slot} onChange={e => setFormData({ ...formData, slot: e.target.value })} className="w-full bg-[#fcfcfc] border border-[#e0e0e0] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#555] mb-1.5">Assigned To</label>
                                    <input type="text" placeholder="Staff name" value={formData.assigned_to} onChange={e => setFormData({ ...formData, assigned_to: e.target.value })} className="w-full bg-[#fcfcfc] border border-[#e0e0e0] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-[#555] mb-1.5">Amount (₹)</label>
                                    <input required type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} className="w-full bg-[#fcfcfc] border border-[#e0e0e0] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#555] mb-1.5">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-[#fcfcfc] border border-[#e0e0e0] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all">
                                        <option value="PENDING">Pending</option>
                                        <option value="CONFIRMED">Confirmed</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-3 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-[#555] font-medium border border-[#eaeaea] rounded-lg hover:bg-[#f5f5f5]">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-[#222222] text-white font-medium rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors">
                                    {isSubmitting ? "Creating..." : "Confirm Slot"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
