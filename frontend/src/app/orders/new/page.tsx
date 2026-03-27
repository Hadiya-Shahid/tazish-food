"use client";
import { useState, useRef } from "react";
import { Mic, Image as ImageIcon, Keyboard, Send, Plus, Trash2, Loader2, StopCircle } from "lucide-react";

export default function CreateOrder() {
  const [method, setMethod] = useState("manual");
  
  const [customerName, setCustomerName] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [items, setItems] = useState([{ name: "", quantity: 1, price: "" as number | string }]);
  const [status, setStatus] = useState("idle");

  // AI States
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: 1, price: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const fillFormWithAI = (data: any) => {
    setCustomerName(data.customer_name || "");
    setAdvancePayment(data.advance_payment || "");
    if (data.items && data.items.length > 0) {
      setItems(data.items);
    }
    setMethod("manual");
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      processVoiceTranscript(transcript);
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event: any) => {
      let curr = "";
      for (let i = 0; i < event.results.length; i++) {
        curr += event.results[i][0].transcript;
      }
      setTranscript(curr);
    };
    
    recognition.onerror = (e: any) => {
      console.error(e);
      setIsRecording(false);
    };
    
    recognition.start();
    setIsRecording(true);
    setTranscript("");
  };

  const processVoiceTranscript = async (text: string) => {
    if (!text.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/ai/parse-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      fillFormWithAI(data);
      setStatus("idle");
    } catch(err) {
      console.error(err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/ai/parse-image`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      fillFormWithAI(data.parsed_order);
    } catch(err) {
      console.error(err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || items.some(i => !i.name || !i.price)) {
      alert("Please fill all required fields (Customer, Item Name, Price)");
      return;
    }
    
    setStatus("loading");
    
    const total_amount = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
    const advance = Number(advancePayment) || 0;
    
    const payload = {
      customer_name: customerName,
      items: items.map(item => ({
        name: item.name,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0
      })),
      total_amount,
      advance_payment: advance,
      discount: 0
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(()=>({}));
        throw new Error(errData.detail || "Failed to create order");
      }
      
      setStatus("success");
      setCustomerName("");
      setAdvancePayment("");
      setItems([{ name: "", quantity: 1, price: "" }]);
      
      setTimeout(() => setStatus("idle"), 4000);
    } catch (error: any) {
      console.error(error);
      alert(error.message); // Fallback to alert to clearly show Render errors if they occur
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Create Order</h1>
        <p className="text-gray-400 mt-1">Add a new order manually or using AI assisted tools.</p>
      </header>

      <div className="flex bg-[#1a1a1a] p-1 rounded-xl w-full max-w-md border border-gray-800 transition-all">
        {[
          { id: "manual", icon: Keyboard, label: "Manual" },
          { id: "voice", icon: Mic, label: "Voice" },
          { id: "image", icon: ImageIcon, label: "Scan" }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => { setMethod(m.id); setStatus("idle"); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              method === m.id ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <m.icon size={16} />
            {m.label}
          </button>
        ))}
      </div>

      <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 min-h-[400px]">
        {method === "manual" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === "success" && (
              <div className="bg-green-500/20 text-green-400 p-4 rounded-xl border border-green-500/30 text-center font-medium transition-all">
                ✨ Order Created Successfully! Synced to Google Sheets.
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-500/20 text-red-400 p-4 rounded-xl border border-red-500/30 text-center font-medium transition-all">
                Failed to create order. Check the alert box for details.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Customer Name *</label>
                <input required value={customerName} onChange={e => setCustomerName(e.target.value)} type="text" placeholder="e.g. Ahmed" className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Advance Payment (Rs.)</label>
                <input value={advancePayment} onChange={e => setAdvancePayment(e.target.value)} type="number" placeholder="e.g. 500" className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Order Items</label>
                <button type="button" onClick={handleAddItem} className="text-sm text-orange-400 hover:text-orange-300 transition-colors font-medium flex items-center gap-1">
                  <Plus size={14} /> Add Item
                </button>
              </div>
              
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-[#1a1a1a] md:bg-transparent p-3 md:p-0 rounded-xl border border-gray-800 md:border-none">
                    <div className="w-full md:flex-1">
                      <input 
                        required 
                        value={item.name} 
                        onChange={e => handleItemChange(index, "name", e.target.value)} 
                        type="text" 
                        placeholder="Item name" 
                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" 
                      />
                    </div>
                    <div className="flex w-full md:w-auto gap-3 items-end md:items-center">
                      <div className="flex-1 md:w-24">
                        <label className="text-[10px] text-gray-500 md:hidden block mb-1 uppercase tracking-wider">Qty</label>
                        <input 
                          required 
                          value={item.quantity} 
                          onChange={e => handleItemChange(index, "quantity", e.target.value)} 
                          type="number" 
                          min="1" 
                          placeholder="Qty" 
                          className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-orange-500 text-center" 
                        />
                      </div>
                      <div className="flex-1 md:w-32">
                        <label className="text-[10px] text-gray-500 md:hidden block mb-1 uppercase tracking-wider">Price</label>
                        <input 
                          required 
                          value={item.price} 
                          onChange={e => handleItemChange(index, "price", e.target.value)} 
                          type="number" 
                          min="0"
                          placeholder="Price" 
                          className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-orange-500 text-center" 
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveItem(index)} 
                        disabled={items.length === 1}
                        className="p-3 text-gray-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors bg-[#0a0a0a] border border-gray-800 rounded-xl h-[50px] w-[50px] shrink-0 flex items-center justify-center"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800 flex justify-end gap-4 items-center">
              <div className="text-sm text-gray-400 mr-auto">
                Total: <span className="text-white font-bold text-lg">Rs. {items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0)}</span>
              </div>
              <button 
                type="submit" 
                disabled={status === "loading"}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-medium py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70"
              >
                {status === "loading" ? (
                  <span className="animate-pulse flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Saving...</span>
                ) : (
                  <>
                    <Send size={18} />
                    Create Order
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {method === "voice" && (
          <div className="flex flex-col items-center justify-center h-full py-12 space-y-6">
            {status === "loading" ? (
               <div className="flex flex-col items-center gap-4 text-orange-500">
                 <Loader2 size={48} className="animate-spin" />
                 <p className="text-white">Parsing your speech...</p>
               </div>
            ) : (
              <>
                <button 
                  onClick={toggleRecording}
                  className={`h-32 w-32 rounded-full border flex items-center justify-center transition-all group relative ${
                    isRecording 
                      ? "bg-red-500/20 border-red-500 text-red-500" 
                      : "bg-gradient-to-tr from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white"
                  }`}
                >
                  {isRecording ? (
                    <>
                      <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping"></div>
                      <StopCircle size={48} />
                    </>
                  ) : (
                    <Mic size={48} />
                  )}
                </button>
                <div className="text-center">
                  <h3 className="text-xl font-medium text-white">{isRecording ? "Recording..." : "Tap to Speak"}</h3>
                  <p className="text-gray-400 mt-2 max-w-sm h-12 overflow-hidden">
                    {isRecording ? transcript || "Listening..." : "Say something like: '3 chicken rolls, 5 samosas for Ahmed advance 500'"}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {method === "image" && (
          <div className="flex flex-col items-center justify-center py-12">
            {isUploading ? (
               <div className="flex flex-col items-center gap-4 text-orange-500 my-10">
                 <Loader2 size={48} className="animate-spin" />
                 <p className="text-white animate-pulse">Running OCR scan on image...</p>
               </div>
            ) : (
              <label className="border-2 border-dashed border-gray-700 hover:border-orange-500/50 bg-[#0a0a0a] rounded-2xl p-12 w-full max-w-md text-center transition-colors cursor-pointer group">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
                <div className="h-16 w-16 bg-gray-800 group-hover:bg-orange-500/20 text-gray-400 group-hover:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                  <ImageIcon size={32} />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Upload Order Image</h3>
                <p className="text-sm text-gray-500">Take a photo of a handwritten order or upload a screenshot from WhatsApp.</p>
                <div className="mt-6 bg-gray-800 group-hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors inline-block pointer-events-none">
                  Select File or Take Photo
                </div>
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
