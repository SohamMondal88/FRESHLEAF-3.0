import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Loader2, Brain, Zap, Globe, MapPin, Sparkles, ChevronRight, ShoppingBag, Leaf } from 'lucide-react';
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
  { label: "Organic Veggies", icon: Leaf, action: "/shop?category=Veg" },
  { label: "Contact Support", icon: User, action: "/contact" },
];

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('lite');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Namaste! I am your FreshLeaf assistant. How can I help you find the freshest produce today?', timestamp: new Date() }
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
          `- ${p.name.en} (${p.name.hi || ''}): ₹${p.price}/${p.baseUnit}. ${p.inStock ? 'In Stock' : 'Out'}.`
        ).join('\n');
        
        const systemInstruction = `You are FreshLeaf's advanced AI assistant. Your tone is friendly, helpful, and knowledgeable about organic farming.
        
        Store Information:
        - We sell organic vegetables and fruits sourced directly from farmers.
        - Free shipping on orders above ₹499.
        - Delivery within 24 hours in metro cities.
        
        Product Catalog:
        ${productContext}
        
        Guidelines:
        - Provide concise answers.
        - Recommend products based on user queries (e.g., "good for immunity").
        - If using Google Maps, use the user's location if available.
        - Use emojis to make the conversation lively.
        `;

        let modelName = 'gemini-3-flash-preview';
        let config: any = { systemInstruction };

        switch (mode) {
          case 'thinking':
            modelName = 'gemini-3-pro-preview';
            config.thinkingConfig = { thinkingBudget: 32768 };
            break;
          case 'lite':
            modelName = 'gemini-3-flash-preview';
            break;
          case 'search':
            modelName = 'gemini-3-flash-preview';
            config.tools = [{ googleSearch: {} }];
            break;
          case 'maps':
            modelName = 'gemini-2.5-flash';
            config.tools = [{ googleMaps: {} }];
            if (userLocation) {
              config.toolConfig = {
                retrievalConfig: {
                  latLng: userLocation
                }
              };
            }
            break;
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
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) throw new Error("Chat not initialized");

      const result = await chatSessionRef.current.sendMessage({ message: userText });
      
      const responseText = result.text || "I couldn't generate a text response. Please try again.";
      const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: responseText,
        groundingChunks: groundingChunks,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error("Msg Error", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered a temporary connection issue. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    navigate(action);
    if (window.innerWidth < 768) setIsOpen(false);
  };

  const getModeIcon = (m: ChatMode) => {
    switch(m) {
      case 'thinking': return <Brain size={14} />;
      case 'lite': return <Zap size={14} />;
      case 'search': return <Globe size={14} />;
      case 'maps': return <MapPin size={14} />;
    }
  };

  const getModeLabel = (m: ChatMode) => {
    switch(m) {
      case 'thinking': return 'Expert';
      case 'lite': return 'Fast';
      case 'search': return 'Web';
      case 'maps': return 'Maps';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center border-4 border-white/20 backdrop-blur-sm group ${
          isOpen 
            ? 'bg-gray-900 rotate-90 scale-90' 
            : 'bg-gradient-to-r from-leaf-600 to-leaf-500 hover:scale-110 hover:shadow-leaf-500/50'
        } text-white`}
      >
        {isOpen ? <X size={24} /> : (
          <>
            <MessageCircle size={28} className="absolute group-hover:scale-0 transition-transform duration-300" />
            <Bot size={28} className="absolute scale-0 group-hover:scale-100 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 z-50 w-[95vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-gray-100 animate-in fade-in slide-in-from-bottom-8 duration-300 overflow-hidden font-sans">
          <div className="bg-gradient-to-r from-leaf-700 to-leaf-600 p-4 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">FreshLeaf AI</h3>
                  <div className="flex items-center gap-1.5 opacity-80">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-xs font-medium">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors backdrop-blur-md"
              >
                <Minimize2 size={18} />
              </button>
            </div>
            <div className="flex bg-black/20 p-1 rounded-xl backdrop-blur-md">
              {(['thinking', 'lite', 'search', 'maps'] as ChatMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-[10px] font-bold transition-all duration-300 ${
                    mode === m 
                      ? 'bg-white text-leaf-800 shadow-sm scale-100' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white scale-95'
                  }`}
                >
                  {getModeIcon(m)}
                  {getModeLabel(m)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4 bg-gray-50 space-y-5">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className="flex items-end gap-2 max-w-[90%]">
                  {msg.role === 'model' && (
                    <div className="w-6 h-6 rounded-full bg-leaf-100 flex items-center justify-center text-leaf-600 shrink-0 mb-1">
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm relative group ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-leaf-600 to-leaf-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                    <span className={`text-[10px] absolute -bottom-5 ${msg.role === 'user' ? 'right-0 text-gray-400' : 'left-0 text-gray-400'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 shrink-0 mb-1">
                      <User size={14} />
                    </div>
                  )}
                </div>
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-2 ml-8 max-w-[85%] space-y-2">
                    {msg.groundingChunks.map((chunk: any, i: number) => {
                      if (chunk.web) {
                        return (
                          <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="block bg-blue-50/50 border border-blue-100 p-2.5 rounded-xl hover:bg-blue-50 transition text-xs group">
                             <div className="font-bold text-blue-700 flex items-center gap-1 mb-0.5"><Globe size={12}/> {chunk.web.title} <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto"/></div>
                             <div className="text-blue-500/80 truncate font-mono text-[10px]">{chunk.web.uri}</div>
                          </a>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full bg-leaf-100 flex items-center justify-center text-leaf-600 shrink-0 mb-1">
                    <Bot size={14} />
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-leaf-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-leaf-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-leaf-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-hide">
            {QUICK_ACTIONS.map((action, i) => (
              <button 
                key={i}
                onClick={() => handleQuickAction(action.action)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:bg-leaf-50 hover:text-leaf-700 hover:border-leaf-200 transition-all whitespace-nowrap active:scale-95"
              >
                <action.icon size={12} /> {action.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'search' ? "Search the web..." : "Ask anything..."}
                className="flex-grow bg-gray-100 text-sm rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-leaf-500/20 focus:bg-white transition-all placeholder-gray-400 font-medium"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 rounded-xl bg-leaf-600 text-white hover:bg-leaf-700 disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
              >
                <Send size={18} className={isLoading ? 'opacity-0' : 'opacity-100'} />
                {isLoading && <Loader2 size={18} className="absolute animate-spin" />}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};