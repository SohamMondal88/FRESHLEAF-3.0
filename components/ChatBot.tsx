import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Loader2, Brain, Zap, Globe, MapPin, Sparkles, ChevronRight, ShoppingBag, Leaf, Headphones } from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useProduct } from '../services/ProductContext';
import { useNavigate } from 'react-router-dom';

type ChatMode = 'thinking' | 'lite' | 'search' | 'maps';

interface Message {
  role: 'user' | 'model';
  text: string;
  groundingChunks?: any[];
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: "Track my order", icon: MapPin, action: "/orders" },
  { label: "Fresh Deals", icon: Sparkles, action: "/shop?category=Exotic" },
  { label: "Contact Support", icon: Headphones, action: "/contact" },
];

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('lite');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Namaste! 🌿 I am your FreshLeaf assistant. How can I help you find the freshest organic produce today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const { products } = useProduct();
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => console.log("Geolocation error:", error)
      );
    }
  }, []);

  useEffect(() => {
    const initChat = async () => {
      try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) return;

        const ai = new GoogleGenAI({ apiKey });
        
        const productContext = products.map(p => 
          `- ${p.name.en} (${p.name.hi || ''}): ₹${p.price}/${p.baseUnit}.`
        ).slice(0, 15).join('\n'); // Limit context for token efficiency
        
        const systemInstruction = `You are FreshLeaf's advanced AI assistant. Your tone is friendly, premium, and expert in organic health.
        
        Key Info:
        - Free shipping above ₹499.
        - Delivery in 24 hours.
        - Location: Metro cities (Delhi, Mumbai, Kolkata, etc).
        
        Catalog Preview:
        ${productContext}
        
        Always prioritize local Indian context. Be brief and professional.`;

        let modelName = 'gemini-3-flash-preview';
        let config: any = { systemInstruction };

        if (mode === 'thinking') {
          modelName = 'gemini-3-pro-preview';
          config.thinkingConfig = { thinkingBudget: 16000 };
        } else if (mode === 'search') {
          config.tools = [{ googleSearch: {} }];
        } else if (mode === 'maps') {
          modelName = 'gemini-2.5-flash';
          config.tools = [{ googleMaps: {} }];
          if (userLocation) {
            config.toolConfig = { retrievalConfig: { latLng: userLocation } };
          }
        }

        chatSessionRef.current = ai.chats.create({
          model: modelName,
          config: config,
        });
      } catch (error) {
        console.error("Chat Init Error", error);
      }
    };

    initChat();
  }, [mode, userLocation, products]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) throw new Error("Chat not initialized");
      const result = await chatSessionRef.current.sendMessage({ message: userText });
      
      const responseText = result.text || "I'm having a bit of a sprout-out. Could you repeat that?";
      const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: responseText,
        groundingChunks: groundingChunks,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Apologies, my connection with the farm is weak. Let's try again in a moment.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getModeIcon = (m: ChatMode) => {
    switch(m) {
      case 'thinking': return <Brain size={14} />;
      case 'lite': return <Zap size={14} />;
      case 'search': return <Globe size={14} />;
      case 'maps': return <MapPin size={14} />;
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[60] p-4 rounded-full shadow-premium transition-all duration-500 flex items-center justify-center border-4 border-white/30 backdrop-blur-md group active:scale-90 ${
          isOpen 
            ? 'bg-gray-900 rotate-90' 
            : 'bg-gradient-to-tr from-leaf-700 to-leaf-500 hover:scale-110 hover:shadow-leaf-500/40'
        } text-white`}
      >
        <div className="relative w-7 h-7">
            <MessageCircle className={`absolute inset-0 transition-all duration-500 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} />
            <Bot className={`absolute inset-0 transition-all duration-500 ${isOpen ? 'scale-110 opacity-100' : 'scale-0 opacity-0'}`} />
        </div>
        {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-white flex items-center justify-center text-[10px] font-bold">1</span>
            </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 z-[60] w-full md:w-[420px] h-full md:h-[650px] md:max-h-[85vh] bg-white md:rounded-[2.5rem] shadow-premium flex flex-col border border-gray-100 animate-in fade-in slide-in-from-bottom-10 duration-500 overflow-hidden font-sans">
          
          {/* Header */}
          <div className="bg-gradient-to-br from-leaf-800 to-leaf-600 p-5 text-white relative overflow-hidden shrink-0">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/20">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight">FreshLeaf AI</h3>
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-[11px] font-bold uppercase tracking-wider">Farm Assistant</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors md:hidden">
                  <X size={20} />
                </button>
                <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors hidden md:block">
                  <Minimize2 size={20} />
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-black/15 p-1 rounded-2xl backdrop-blur-lg border border-white/5">
              {(['lite', 'thinking', 'search', 'maps'] as ChatMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[9px] font-bold transition-all duration-300 uppercase tracking-tighter ${
                    mode === m 
                      ? 'bg-white text-leaf-800 shadow-md translate-y-[-2px]' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {getModeIcon(m)}
                  <span className="mt-0.5">{m === 'thinking' ? 'Expert' : m}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-5 bg-gray-50/50 space-y-6 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex items-end gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-sm border ${
                    msg.role === 'model' ? 'bg-leaf-100 border-leaf-200 text-leaf-600' : 'bg-gray-200 border-gray-300 text-gray-500'
                  }`}>
                    {msg.role === 'model' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div
                    className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm relative group ${
                      msg.role === 'user'
                        ? 'bg-gray-900 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                    <div className={`text-[9px] font-bold mt-2 opacity-40 uppercase tracking-widest ${msg.role === 'user' ? 'text-white text-right' : 'text-gray-500'}`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
                {msg.groundingChunks && (
                  <div className="mt-3 ml-10 space-y-2 max-w-[80%]">
                    {msg.groundingChunks.map((chunk: any, i: number) => chunk.web && (
                      <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="block bg-white border border-gray-100 p-3 rounded-2xl hover:border-leaf-300 hover:bg-leaf-50/30 transition-all shadow-sm group">
                         <div className="font-bold text-leaf-800 text-[11px] flex items-center gap-1.5 mb-0.5">
                            <Globe size={12} className="text-leaf-500" /> {chunk.web.title}
                         </div>
                         <div className="text-gray-400 truncate text-[10px] italic">{chunk.web.uri}</div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-leaf-50 border border-leaf-100 flex items-center justify-center text-leaf-600">
                    <Bot size={16} />
                </div>
                <div className="bg-white p-4 rounded-3xl rounded-bl-none border border-gray-100 shadow-sm flex gap-1.5">
                  <span className="w-2 h-2 bg-leaf-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-leaf-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-leaf-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-5 py-3 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
            {QUICK_ACTIONS.map((action, i) => (
              <button 
                key={i}
                onClick={() => { navigate(action.action); if(window.innerWidth < 768) setIsOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 hover:bg-leaf-600 hover:text-white hover:border-leaf-600 transition-all whitespace-nowrap"
              >
                <action.icon size={12} /> {action.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-5 bg-white border-t border-gray-100 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'search' ? "Search the live web..." : "Type your query..."}
                className="w-full bg-gray-100/80 text-sm rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-leaf-500/20 focus:bg-white transition-all placeholder-gray-400 font-medium"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2.5 rounded-xl bg-leaf-600 text-white hover:bg-leaf-700 disabled:opacity-50 disabled:bg-gray-300 transition-all shadow-md active:scale-90"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-3 font-medium uppercase tracking-widest">Powered by Gemini AI</p>
          </form>
        </div>
      )}
    </>
  );
};