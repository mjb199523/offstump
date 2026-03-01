"use client";
import { useState } from 'react';
import { myFetch } from '@/lib/myFetch';

export default function AddCustomerForm() {
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await myFetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                alert("Error: " + data.error);
            } else {
                alert("Customer created with ID: " + data.id);
                setFormData({ name: '', phone: '' }); // Reset form
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
            <h2 className="text-xl font-bold">Add New Customer</h2>
            <input
                type="text" required placeholder="Customer Name"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="border p-2 rounded text-black"
            />
            <input
                type="text" placeholder="Phone"
                value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="border p-2 rounded text-black"
            />
            <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
                {loading ? 'Saving...' : 'Add Customer'}
            </button>
        </form>
    );
}
