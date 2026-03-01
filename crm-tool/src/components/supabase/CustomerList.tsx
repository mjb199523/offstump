"use client";
import { useEffect, useState } from 'react';
import { myFetch } from '@/lib/myFetch';

export default function CustomerList() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        myFetch('/api/customers')
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setCustomers(data);
                } else {
                    console.error(data.error);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading customers...</p>;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Customer List</h2>
            {customers.length === 0 ? (
                <p>No customers found.</p>
            ) : (
                <ul className="space-y-2">
                    {customers.map(c => (
                        <li key={c.id} className="p-3 border rounded shadow-sm flex flex-col">
                            <span className="font-bold">{c.name}</span>
                            <span className="text-sm text-gray-400">{c.phone || 'No phone provided'}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
