"use client";
import { useState, useEffect } from "react";
import { LineChart, BarChart3, TrendingUp, AlertCircle, BrainCircuit, Loader2 } from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function Analytics() {
  const [orders, setOrders] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/api/orders/").then(r => r.json()),
      fetch("http://localhost:8000/api/expenses/").then(r => r.json())
    ]).then(([ordersData, expensesData]) => {
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const totalRev = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const totalExp = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">AI Insights & Analytics</h1>
        <p className="text-gray-400 mt-1">Data-driven decisions for Tazish Food growth.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-[#141414] border border-gray-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-orange-500" />
              Revenue vs Expenses
            </h3>
          </div>
          <div className="h-[300px] flex items-center justify-center relative p-4">
            {loading ? <Loader2 className="animate-spin text-orange-500" /> : (
            <Bar 
              data={{
                labels: ["Overall Total"],
                datasets: [
                  {
                    label: "Revenue",
                    data: [totalRev],
                    backgroundColor: "rgba(249, 115, 22, 0.8)",
                  },
                  {
                    label: "Expenses",
                    data: [totalExp],
                    backgroundColor: "rgba(220, 38, 38, 0.8)",
                  }
                ]
              }}
              options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }}
            />
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a1310] to-[#140e0a] border border-orange-500/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BrainCircuit size={120} />
          </div>
          <h3 className="font-semibold text-orange-400 flex items-center gap-2 mb-6 relative z-10">
            <BrainCircuit size={18} />
            AI Business Insights
          </h3>
          <div className="space-y-4 relative z-10 flex flex-col items-center justify-center text-center h-[200px] px-2">
            {loading ? <Loader2 className="animate-spin text-orange-500" /> : 
             totalRev > totalExp ? (
              <p className="text-green-400 font-medium">You are running a profitable margin! Net positive of Rs. {(totalRev - totalExp).toLocaleString()}. Maintain low operational costs for steady growth.</p>
             ) : (
              <p className="text-red-400 font-medium">Expenses currently exceed revenue by Rs. {(totalExp - totalRev).toLocaleString()}. Consider reviewing supply costs or increasing market reach to turn a profit.</p>
             )
            }
          </div>
        </div>
      </section>
    </div>
  );
}
