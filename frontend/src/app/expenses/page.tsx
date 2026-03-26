"use client";
import { useState, useEffect } from "react";
import { Plus, Receipt, Search, Loader2 } from "lucide-react";

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [category, setCategory] = useState("Supplies");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/expenses/`)
      .then(res => res.json())
      .then(data => setExpenses(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const currentMonth = new Date().getMonth();
  const monthlyExpenses = expenses.filter(e => {
      try { return new Date(e.created_at).getMonth() === currentMonth; } catch { return false; }
  });
  const totalMonthly = monthlyExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setAdding(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/expenses/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, amount: Number(amount), description })
      });
      if (res.ok) {
        setShowModal(false);
        setAmount("");
        setDescription("");
        fetchExpenses();
      }
    } catch(err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add New Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full mt-1 bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-500">
                  <option>Supplies</option>
                  <option>Utility</option>
                  <option>Salary</option>
                  <option>Marketing</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Amount (Rs.)</label>
                <input required value={amount} onChange={e => setAmount(e.target.value)} type="number" className="w-full mt-1 bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="text-sm text-gray-400">Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)} type="text" className="w-full mt-1 bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-500" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-xl border border-gray-800 text-white hover:bg-gray-800">Cancel</button>
                <button type="submit" disabled={adding} className="flex-1 py-2 rounded-xl bg-orange-500 text-white font-medium disabled:opacity-50">
                  {adding ? "Saving..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Expenses</h1>
          <p className="text-gray-400 mt-1">Track business costs, investments, and overheads.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-medium py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 w-fit">
          <Plus size={18} />
          Add Expense
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-gray-400 font-medium text-sm">Total Expenses (This Month)</h3>
          <p className="text-3xl font-bold text-white mt-2">Rs. {totalMonthly.toLocaleString()}</p>
        </div>
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-gray-400 font-medium text-sm">Top Record</h3>
          <p className="text-xl font-bold text-white mt-2">
            {expenses.length > 0 ? expenses.sort((a,b)=>b.amount-a.amount)[0].category : "-"}
          </p>
          <p className="text-sm text-gray-500 mt-1">Highest distinct expense</p>
        </div>
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-gray-400 font-medium text-sm">Count</h3>
          <p className="text-xl font-bold text-white mt-2">{expenses.length} Records</p>
          <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>
      </div>

      <div className="bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h3 className="font-semibold text-white">Recent Transactions</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input type="text" placeholder="Search expenses..." className="bg-[#0a0a0a] border border-gray-800 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500" />
          </div>
        </div>
        <div className="divide-y divide-gray-800/50">
          {loading ? (
             <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
          ) : expenses.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-center">
              <Receipt size={40} className="mb-3 opacity-20 text-gray-400" />
              <p className="text-gray-400 font-medium">No expenses found</p>
              <p className="text-sm text-gray-500 mt-1">Add your first expense to track business costs.</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-gray-800/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{expense.category}</p>
                    <p className="text-sm text-gray-500">{expense.description || "No description"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-400">- Rs. {expense.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    {expense.created_at.length > 10 ? new Date(expense.created_at).toLocaleDateString() : expense.created_at}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

