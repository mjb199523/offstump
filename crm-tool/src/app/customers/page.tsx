"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Search, Plus, Edit2, Trash2, X } from "lucide-react";
import { myFetch } from "@/lib/myFetch";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await myFetch(`/api/customers`);
            const data = await res.json();
            setCustomers(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (c.name || "").toLowerCase().includes(q) || (c.phone || "").includes(q);
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await myFetch('/api/customers', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setFormData({ name: "", phone: "", email: "", address: "", notes: "" });
                fetchCustomers();
            } else {
                const err = await res.json();
                alert("Error: " + (err.error || "Failed to add customer"));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this customer?")) return;
        try {
            await myFetch(`/api/customers/${id}`, { method: "DELETE" });
            fetchCustomers();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex h-screen bg-[#fcfcfc] text-[#111111] overflow-hidden font-sans">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-12 bg-white">

                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-[#111]">
                            Customer Directory
                        </h1>
                        <p className="text-[#666] mt-1 text-sm">Manage customers, lifetime tracking and behavior.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#222222] text-white hover:bg-[#333333] transition-colors shadow-sm font-medium"
                    >
                        <Plus size={16} strokeWidth={2} />
                        Add Customer
                    </button>
                </header>

                {/* Filters/Search */}
                <div className="mb-6 flex gap-4">
                    <div className="relative flex-1 max-w-[320px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" size={15} strokeWidth={2} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or phone..."
                            className="w-full bg-white border border-[#eaeaea] rounded-lg py-2 pl-10 pr-3 text-[14px] text-[#222] placeholder-[#aaa] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Table View */}
                <div className="bg-white rounded-xl border border-[#eaeaea] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-[#eaeaea] bg-[#fdfdfd] text-[#666]">
                                <th className="px-5 py-3 font-medium text-[13px]">Customer Name</th>
                                <th className="px-5 py-3 font-medium text-[13px]">Phone</th>
                                <th className="px-5 py-3 font-medium text-[13px]">Email</th>
                                <th className="px-5 py-3 font-medium text-[13px]">Address</th>
                                <th className="px-5 py-3 font-medium text-[13px]">Notes</th>
                                <th className="px-5 py-3 font-medium text-[13px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eaeaea]">
                            {loading ? (
                                <tr><td colSpan={6} className="px-5 py-10 text-center text-[#999]">Loading customer data...</td></tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr><td colSpan={6} className="px-5 py-10 text-center text-[#999]">No customers found.</td></tr>
                            ) : (
                                filteredCustomers.map((c) => (
                                    <tr key={c.id} className="hover:bg-[#fcfcfc] transition-colors group">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#f2f2f2] border border-[#e5e5e5] flex items-center justify-center font-medium text-[#444] text-[13px]">
                                                    {(c.name || "?").charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-[#222]">{c.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-[#555]">{c.phone || "—"}</td>
                                        <td className="px-5 py-3.5 text-[#555]">{c.email || "—"}</td>
                                        <td className="px-5 py-3.5 text-[#555] max-w-[150px] truncate">{c.address || "—"}</td>
                                        <td className="px-5 py-3.5 text-[#555] max-w-[150px] truncate">{c.notes || "—"}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 hover:bg-[#eaeaea] rounded text-[#666] hover:text-[#222] transition-colors">
                                                    <Edit2 size={15} strokeWidth={1.5} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.id)}
                                                    className="p-1.5 hover:bg-[#fee2e2] rounded text-[#666] hover:text-[#991b1b] transition-colors"
                                                >
                                                    <Trash2 size={15} strokeWidth={1.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Add Customer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
                    <div className="bg-white rounded-xl shadow-xl border border-[#eaeaea] w-[400px] p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="font-semibold text-lg text-[#111]">New Customer</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#999] hover:text-[#222]">
                                <X size={18} strokeWidth={1.5} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-[#555] mb-1.5">Full Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#fcfcfc] border border-[#e0e0e0] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#555] mb-1.5">Phone Number</label>
                                <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-[#fcfcfc] border border-[#e0e0e0] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#555] mb-1.5">Email (Optional)</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-[#fcfcfc] border border-[#e0e0e0] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#555] mb-1.5">Address (Optional)</label>
                                <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-[#fcfcfc] border border-[#e0e0e0] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#555] mb-1.5">Notes (Optional)</label>
                                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={2} className="w-full bg-[#fcfcfc] border border-[#e0e0e0] rounded-lg px-3 py-2 text-sm text-[#111] focus:outline-none focus:border-[#475b63] focus:ring-1 focus:ring-[#475b63] transition-all resize-none" />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-[#555] font-medium border border-[#eaeaea] rounded-lg hover:bg-[#f5f5f5]">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-[#222222] text-white font-medium rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors">
                                    {isSubmitting ? "Saving..." : "Save Customer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
