import AddCustomerForm from "@/components/supabase/AddCustomerForm";
import CustomerList from "@/components/supabase/CustomerList";

export default function TestSupabase() {
    return (
        <div className="p-12 max-w-4xl mx-auto space-y-12">
            <div>
                <h1 className="text-3xl font-bold mb-4">Supabase Integration Test</h1>
                <p className="text-gray-600 mb-8">
                    Use this page to verify that your new database is working correctly!
                    Try adding a customer and see if it appears in the list below.
                </p>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-md mb-8">
                    <AddCustomerForm />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <CustomerList />
            </div>
        </div>
    )
}
