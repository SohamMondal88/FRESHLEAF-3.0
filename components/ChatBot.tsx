
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Loader2, Brain, Zap, Globe, MapPin, Sparkles, ChevronRight, ShoppingBag, Headphones } from 'lucide-react';
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
  { label: "Track Order", icon: MapPin, action: "/orders" },
  { label: "Fresh Deals", icon: Sparkles, action: "/shop?category=Exotic" },
  { label: "Support", icon: Headphones, action: "/contact" },
];

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('lite');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Namaste! 🌿 I am your FreshLeaf assistant. How can I help you find the freshest produce today?', timestamp: new Date() }
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
        (position) => setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
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
        
        const productContext = products.map(p => `- ${p.name.en} (${p.name.hi || ''}): ₹${p.price}/${p.baseUnit}.`).slice(0, 15).join('\n');
        
        const systemInstruction = `You are FreshLeaf's AI assistant. Tone: Friendly, helpful, Indian context.
        Key Info: Free shipping > ₹499. 24h Delivery.
        Products: ${productContext}
        Keep answers short.`;

        let modelName = 'gemini-3-flash-preview';
        let config: any = { systemInstruction };

        if (mode === 'thinking') {
          modelName = 'gemini-3-pro-preview';
          config.thinkingConfig = { thinkingBudget: 16000 };
        } else if (mode === 'search') {
          config.tools = [{ googleSearch: {} }];
        }

        chatSessionRef.current = ai.chats.create({ model: modelName, config: config });
      } catch (error) { console.error("Chat Init Error", error); }
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

      setMessages(prev => [...prev, { role: 'model', text: responseText, groundingChunks: groundingChunks, timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Connection weak. Let's try again.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[60] p-4 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center border-4 border-white/50 backdrop-blur-md group active:scale-95 ${
          isOpen ? 'bg-gray-900 rotate-90 scale-90' : 'bg-gradient-to-tr from-leaf-600 to-leaf-400 hover:scale-110 hover:shadow-leaf-500/40'
        } text-white`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} className="fill-current" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 z-[60] w-full md:w-[400px] h-full md:h-[600px] md:max-h-[80vh] bg-white/95 backdrop-blur-xl md:rounded-[2.5rem] shadow-2xl flex flex-col border border-white/50 animate-in fade-in slide-in-from-bottom-10 duration-500 font-sans overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-leaf-700 to-leaf-500 p-5 text-white shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="flex items-center gap-3 relative z-10">
                <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md shadow-inner">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight leading-none">FreshLeaf AI</h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 flex items-center gap-1 mt-1"><span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span> Online</span>
                </div>
                <div className="ml-auto flex gap-1 bg-black/20 p-1 rounded-lg backdrop-blur-sm">
                   {(['lite', 'thinking'] as ChatMode[]).map(m => (
                       <button key={m} onClick={() => setMode(m)} className={`p-1.5 rounded-md transition ${mode === m ? 'bg-white text-leaf-800 shadow-sm' : 'text-white/60 hover:text-white'}`}>
                           {m === 'lite' ? <Zap size={14}/> : <Brain size={14}/>}
                       </button>
                   ))}
                </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-grow overflow-y-auto p-5 bg-gray-50/50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${msg.role === 'model' ? 'bg-leaf-100 text-leaf-700' : 'bg-gray-200 text-gray-600'}`}>
                    {msg.role === 'model' ? 'AI' : 'U'}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
                {msg.groundingChunks && (
                  <div className="mt-2 ml-8 space-y-2 max-w-[80%]">
                    {msg.groundingChunks.map((chunk: any, i: number) => chunk.web && (
                      <a key={i} href={chunk.web.uri} target="_blank" className="block bg-white border border-gray-100 p-2 rounded-xl text-xs hover:border-leaf-300 transition shadow-sm">
                         <div className="font-bold text-leaf-700 truncate mb-0.5 flex items-center gap-1"><Globe size={10}/> {chunk.web.title}</div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 ml-2">
                 <div className="w-6 h-6 bg-leaf-100 rounded-full flex items-center justify-center"><Bot size={12} className="text-leaf-600"/></div>
                 <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-leaf-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-leaf-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                    <span className="w-1.5 h-1.5 bg-leaf-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
             {QUICK_ACTIONS.map((action, i) => (
                 <button key={i} onClick={() => { navigate(action.action); setIsOpen(false); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-leaf-50 hover:border-leaf-200 hover:text-leaf-700 transition whitespace-nowrap shadow-sm">
                     <action.icon size={12}/> {action.label}
                 </button>
             ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full bg-gray-100 rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500/20 focus:bg-white transition-all font-medium"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 bg-leaf-600 text-white rounded-lg hover:bg-leaf-700 disabled:opacity-50 disabled:bg-gray-300 transition-all shadow-md active:scale-95"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
