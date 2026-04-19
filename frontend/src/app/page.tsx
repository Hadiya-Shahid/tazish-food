"use client";
import { useState, useEffect } from "react";
import { CircleDollarSign, TrendingUp, Package, Clock, Loader2 } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Home() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/orders/`)
      .then(async res => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API responded with ${res.status}: ${errText} (URL: ${apiUrl})`);
        }
        return res.json();
      })
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch((e: any) => {
        console.error("Dashboard fetch error:", e);
        setError(`Connection Error: ${e.message} (Is NEXT_PUBLIC_API_URL correct?)`);
      })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todaysOrders = orders.filter(o => o.created_at?.startsWith(today));
  
  const todaysSales = todaysOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  
  // Dynamic Chart Building (Simulated over recent points)
  const chartData = [
    orders.slice(15, 20).reduce((s,o)=>s+(o.total_amount||0),0),
    orders.slice(10, 15).reduce((s,o)=>s+(o.total_amount||0),0),
    orders.slice(5, 10).reduce((s,o)=>s+(o.total_amount||0),0),
    orders.slice(0, 5).reduce((s,o)=>s+(o.total_amount||0),0)
  ];

  const cards = [
    { title: "Today's Sales", value: `Rs. ${todaysSales.toLocaleString()}`, icon: CircleDollarSign, change: "Live", positive: true },
    { title: "Pending Orders", value: orders.filter(o => o.status === 'pending').length.toString(), icon: Clock, change: "Live", positive: true },
    { title: "Items Sold", value: orders.length.toString(), icon: Package, change: "Total", positive: true },
    { title: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, icon: TrendingUp, change: "All Time", positive: true },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-400 mt-1">Welcome back. Here's what's happening at Tazish Food today.</p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((kpi, idx) => (
          <div key={idx} className="bg-[#141414] p-6 rounded-2xl border border-gray-800 transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-black/20 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <kpi.icon size={100} />
            </div>
            <div className="flex justify-between items-start">
              <div className="p-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700/50 text-orange-400">
                <kpi.icon size={24} />
              </div>
              <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${kpi.positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {kpi.change}
              </span>
            </div>
            <div className="mt-6">
              <h3 className="text-gray-400 font-medium">{kpi.title}</h3>
              <p className="text-3xl font-bold mt-2 text-white">{loading ? <Loader2 className="animate-spin inline" size={24}/> : kpi.value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#141414] rounded-2xl border border-gray-800 p-6 min-h-[400px] flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-500/5 pointer-events-none"></div>
          <h3 className="text-lg font-semibold mb-4 text-white relative z-10">Sales Overview</h3>
          <div className="flex-1 w-full min-h-[300px] relative z-10 flex items-center justify-center">
            {loading ? <Loader2 className="animate-spin text-orange-500" size={32}/> :
            <Line 
              data={{
                labels: ["Older", "Past", "Recent", "Latest"],
                datasets: [
                  {
                    label: "Revenue Trend",
                    data: chartData,
                    borderColor: "#f97316",
                    backgroundColor: "rgba(249, 115, 22, 0.1)",
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.05)" } },
                  x: { grid: { color: "rgba(255,255,255,0.05)" } }
                }
              }}
            />}
          </div>
        </div>
        
        <div className="bg-[#141414] rounded-2xl border border-gray-800 p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-white">Recent Orders</h3>
          <div className="flex-1 flex flex-col gap-4 text-gray-500 h-full overflow-y-auto">
            {loading ? (
              <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-red-400 text-sm text-center">
                <p className="font-bold mb-1">Server Error</p>
                <p className="break-all">{error}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                 <Package size={48} className="opacity-20 mb-2" />
                 <p>No recent orders</p>
              </div>
            ) : (
              orders.slice(0, 5).map(order => (
                <div key={order.id} className="p-3 bg-[#1a1a1a] rounded-lg border border-gray-800 flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-orange-400 font-bold">Rs. {order.total_amount}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

