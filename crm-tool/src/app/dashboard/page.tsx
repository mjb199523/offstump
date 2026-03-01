"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Users, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { myFetch } from "@/lib/myFetch";

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const res = await myFetch("/api/analytics/dashboard");
                const json = await res.json();
                setData(json);
            } catch (e) { console.error(e) } finally { setLoading(false); }
        }
        fetchDashboard();
    }, []);

    // Sophisticated minimal palette
    const COLORS = ["#475b63", "#a8c256", "#d98a6c", "#dddcd0"];

    if (loading) {
        return (
            <div className="flex h-screen w-screen bg-[#fcfcfc] items-center justify-center">
                <div className="w-8 h-8 border-[3px] border-[#eaeaea] border-t-[#222222] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data || data.error) {
        return (
            <div className="flex h-screen w-screen bg-[#fcfcfc] flex-col items-center justify-center space-y-4">
                <p className="text-[#991b1b] font-medium">{data?.error || "Failed to load dashboard."}</p>
                <a href="/auth/login" className="px-4 py-2 bg-[#222] text-white rounded-lg hover:bg-[#111]">
                    Return to Login
                </a>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#fcfcfc] text-[#111111] overflow-hidden font-sans">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-12 bg-white selection:bg-[#f5f5f5]">

                <header className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-[#111]">
                            Overview
                        </h1>
                        <p className="text-[#666] mt-1 text-sm">Welcome back. Here is your arena's performance snapshot.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 text-sm rounded-lg bg-white border border-[#eaeaea] text-[#333] hover:bg-[#f9f9f9] transition-colors shadow-sm font-medium">
                            Filter: This Month
                        </button>
                        <div className="w-9 h-9 rounded-full bg-[#f2f2f2] border border-[#e5e5e5] flex items-center justify-center shadow-sm text-sm font-medium text-[#444]">
                            A
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    <StatCard icon={<TrendingUp strokeWidth={1.5} size={18} />} title="Total Revenue" value={`₹ ${data.revenue.total.toLocaleString()}`} trend={data.revenue.trend} />
                    <StatCard icon={<Users strokeWidth={1.5} size={18} />} title="Customers" value={data.customers.total.toLocaleString()} trend={data.customers.trend} />
                    <StatCard icon={<Calendar strokeWidth={1.5} size={18} />} title="Bookings This Mth" value={data.bookings.thisMonth.toLocaleString()} trend="+5.2%" />
                    <StatCard icon={<DollarSign strokeWidth={1.5} size={18} />} title="Avg Booking Value" value={`₹ ${data.bookings.avgValue.toLocaleString()}`} trend={data.bookings.trend} />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-white rounded-xl p-7 border border-[#eaeaea] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                        <h2 className="text-[15px] font-semibold mb-6 text-[#222]">Revenue Analytics</h2>
                        <div className="h-72 w-full text-xs text-[#888]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#475b63" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#475b63" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#cfcfcf" axisLine={false} tickLine={false} dy={10} />
                                    <YAxis stroke="#cfcfcf" axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => `₹${val}`} />
                                    <CartesianGrid vertical={false} stroke="#f0f0f0" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", boxShadow: "0px 4px 12px rgba(0,0,0,0.05)", fontSize: '13px', color: '#111' }}
                                        itemStyle={{ color: "#475b63", fontWeight: '500' }}
                                        cursor={{ stroke: '#eaeaea', strokeWidth: 1 }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#475b63" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-7 border border-[#eaeaea] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                        <h2 className="text-[15px] font-semibold mb-6 text-[#222]">Customers by Source</h2>
                        <div className="h-56 w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.sourceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.sourceData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #eaeaea", borderRadius: "8px", boxShadow: "0px 4px 12px rgba(0,0,0,0.05)", fontSize: '13px' }}
                                        itemStyle={{ color: "#222" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 mt-6">
                            {data.sourceData.map((entry: any, index: number) => (
                                <div key={entry.name} className="flex items-center gap-2 text-xs text-[#555] font-medium">
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Secondary Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-7 border border-[#eaeaea] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                        <h2 className="text-[15px] font-semibold mb-6 text-[#222]">Sales by Service</h2>
                        <div className="h-56 w-full text-xs text-[#888]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.serviceData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#fcfcfc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #eaeaea' }} />
                                    <Bar dataKey="bookings" fill="#a8c256" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-7 border border-[#eaeaea] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                        <h2 className="text-[15px] font-semibold mb-6 text-[#222]">Payment Modes</h2>
                        <div className="h-56 w-full text-xs text-[#888]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.paymentData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#fcfcfc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #eaeaea' }} />
                                    <Bar dataKey="value" fill="#d98a6c" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-7 border border-[#eaeaea] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                        <h2 className="text-[15px] font-semibold mb-6 text-[#222]">Weekly Attendance Trands</h2>
                        <div className="h-56 w-full text-xs text-[#888]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.revenueData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <XAxis dataKey="name" stroke="#cfcfcf" axisLine={false} tickLine={false} dy={10} />
                                    <YAxis stroke="#cfcfcf" axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ stroke: '#eaeaea' }} contentStyle={{ borderRadius: '8px', border: '1px solid #eaeaea' }} />
                                    <Area type="monotone" dataKey="bookings" stroke="#475b63" strokeWidth={2} fillOpacity={0.1} fill="#475b63" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

function StatCard({ icon, title, value, trend }: { icon: React.ReactNode; title: string; value: string; trend: string }) {
    const isPositive = trend.startsWith("+");
    return (
        <div className="bg-white rounded-xl p-6 border border-[#eaeaea] shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-[#f7f7f7] text-[#555] border border-[#f0f0f0]">
                    {icon}
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${isPositive ? "bg-[#f1fae8] text-[#4d7328] border-[#daf2c2]" : "bg-[#fef2f2] text-[#991b1b] border-[#fee2e2]"
                    }`}>
                    {trend}
                </span>
            </div>
            <h3 className="text-[#666] text-[13px] font-medium mb-1">{title}</h3>
            <p className="text-2xl font-semibold tracking-tight text-[#111]">{value}</p>
        </div>
    );
}
