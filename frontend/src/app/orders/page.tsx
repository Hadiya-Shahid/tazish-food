"use client";
import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, CheckCircle2, Clock, Loader2 } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      console.log("Fetching from:", apiUrl);
      const res = await fetch(`${apiUrl}/api/orders/`);
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        const errText = await res.text();
        setError(`API responded with ${res.status}: ${errText} (URL: ${apiUrl})`);
      }
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
      setError(`Failed to connect to backend: ${error.message} (Is your NEXT_PUBLIC_API_URL correct?)`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return "N/A";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-US', { 
        month: 'short', day: 'numeric', 
        hour: 'numeric', minute: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Order History</h1>
          <p className="text-gray-400 mt-1">Manage and view all your recorded orders.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input type="text" placeholder="Search orders..." className="bg-[#141414] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500 w-64" />
          </div>
          <button onClick={fetchOrders} className="bg-[#141414] border border-gray-800 hover:bg-gray-800 text-white p-2.5 rounded-xl transition-colors" title="Refresh">
            <Filter size={18} />
          </button>
        </div>
      </header>

      <div className="bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 border-b border-gray-800 text-gray-400 text-sm">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date &amp; Time</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
                <th className="px-6 py-4 font-medium text-right">Balance</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 size={32} className="mb-3 animate-spin opacity-50 text-orange-500" />
                      <p>Loading orders from Google Sheets...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-400">
                    <div className="flex flex-col items-center justify-center bg-red-500/10 p-6 rounded-xl border border-red-500/20 max-w-lg mx-auto">
                      <p className="font-bold mb-2">Connection Issue Detected!</p>
                      <p className="text-sm font-mono text-left break-all">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Clock size={40} className="mb-3 opacity-20" />
                      <p>No orders recorded yet.</p>
                      <p className="text-sm mt-1">Your new orders will show up here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      {String(order.id).substring(0, 8)}{String(order.id).length > 8 ? '...' : ''}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {order.customer_name} 
                      {order.items && order.items.length > 0 && <span className="text-xs text-gray-600 block">{order.items.length} items</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-right font-medium text-white">Rs. {order.total_amount}</td>
                    <td className="px-6 py-4 text-right text-orange-400">Rs. {order.balance}</td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        {order.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        <span className="capitalize">{order.status || 'pending'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-gray-500 hover:text-white transition-colors p-1">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

