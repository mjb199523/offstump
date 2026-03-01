"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Plus, Package, Edit2, Trash2, Power, X } from "lucide-react";
import { myFetch } from "@/lib/myFetch";

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", pricePerHour: 0, description: "", isActive: true });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await myFetch(`/api/services`);
            const data = await res.json();
            setServices(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await myFetch('/api/services', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            setIsModalOpen(false);
            setFormData({ name: "", pricePerHour: 0, description: "", isActive: true });
            fetchServices(); // Refresh list
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#fcfcfc] text-[#111111] overflow-hidden font-sans">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-12 bg-white">

                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-[#111]">
                            Services & Packages
                        </h1>
                        <p className="text-[#666] mt-1 text-sm">Configure turf dimensions, pricing models and sports types.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#222222] text-white hover:bg-[#333333] transition-colors shadow-sm font-medium"
                    >
                        <Plus size={16} strokeWidth={2} /> New Service
                    </button>
                </header>

                {/* Grid Display */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                    {loading ? (
                        <div className="col-span-full py-20 text-center text-[#999]">Loading services...</div>
                    ) : services.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-[#666] bg-[#fcfcfc] rounded-xl border border-dashed border-[#d5d5d5]">
                            <Package size={36} strokeWidth={1.5} className="mx-auto mb-3 opacity-40" />
                            <p className="font-medium text-[15px] text-[#333]">No services defined.</p>
                            <p className="text-sm mt-1">Setup Cricket Turf or Yoga packages to start.</p>
                        </div>
                    ) : (
                        services.map((s) => (
                            <div key={s.id} className={`bg-white rounded-xl p-6 border ${s.isActive ? 'border-[#eaeaea] shadow-[0_2px_8px_rgba(0,0,0,0.02)]' : 'border-[#f0f0f0] bg-[#fdfdfd] text-[#888]'} transition-shadow hover:shadow-md group`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-lg ${s.isActive ? "bg-[#f5f5f5] text-[#444] border border-[#e5e5e5]" : "bg-[#fafafa] text-[#ccc] border border-[#f0f0f0]"}`}>
                                        <Package size={20} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 hover:bg-[#eaeaea] rounded text-[#666] hover:text-[#222] transition-colors">
                                            <Edit2 size={15} strokeWidth={1.5} />
                                        </button>
                                        <button className="p-1.5 hover:bg-[#fee2e2] rounded text-[#666] hover:text-[#991b1b] transition-colors">
                                            <Trash2 size={15} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-2">
                                    <h3 className={`text-lg font-semibold tracking-tight ${s.isActive ? 'text-[#111]' : 'text-[#888]'}`}>
                                        {s.name}
                                    </h3>
                                    {s.isActive ? (
                                        <span className="px-2 py-0.5 rounded-md bg-[#f1fae8] text-[#4d7328] border-[#daf2c2] text-[10px] uppercase font-bold tracking-wide">Active</span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-md bg-[#f5f5f5] text-[#888] border-[#eaeaea] text-[10px] uppercase font-bold tracking-wide">Inactive</span>
                                    )}
                                </div>

                                <p className="text-[#666] text-sm mb-6 leading-relaxed line-clamp-2 min-h-[40px]">
                                    {s.description || "No description provided."}
                                </p>

                                <div className="flex justify-between items-center p-3 rounded-lg bg-[#fcfcfc] border border-[#eaeaea]">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-[#888] uppercase tracking-wider font-semibold mb-0.5">Pricing</span>
                                        <span className="text-base font-semibold text-[#111]">₹{s.pricePerHour}<span className="text-xs font-medium text-[#777]">/hr</span></span>
                                    </div>
                                    <button className={`p-1.5 rounded-md border ${s.isActive ? "border-[#daf2c2] text-[#4d7328] hover:bg-[#f1fae8]" : "border-[#eaeaea] text-[#888] hover:bg-[#f5f5f5]"} transition-colors`} title="Toggle Status">
                                        <Power size={16} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Add Service Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
                    <div className="bg-white rounded-xl shadow-xl border border-[#eaeaea] w-[400px] p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="font-semibold text-lg text-[#111]">Create Service</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#999] hover:text-[#222]">
                                <X size={18} strokeWidth={1.5} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-[#555] mb-1.5">Service Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Cricket Turf Hourly" className="w-full bg-[#fcfcfc] border border-[#e0e0e0] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#555] mb-1.5">Price Per Hour (₹)</label>
                                <input required type="number" value={formData.pricePerHour} onChange={e => setFormData({ ...formData, pricePerHour: Number(e.target.value) })} className="w-full bg-[#fcfcfc] border border-[#e0e0e0] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#555] mb-1.5">Description (Optional)</label>
                                <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#fcfcfc] border border-[#e0e0e0] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all resize-none" />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-[#555] font-medium border border-[#eaeaea] rounded-lg hover:bg-[#f5f5f5]">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-[#222222] text-white font-medium rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors">
                                    {isSubmitting ? "Saving..." : "Save Service"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
