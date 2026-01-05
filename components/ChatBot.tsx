
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Loader2, Brain, Zap, Globe, MapPin, Sparkles, ChevronRight, ShoppingBag, Headphones, Camera, Paperclip, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useProduct } from '../services/ProductContext';
import { useNavigate } from 'react-router-dom';

type ChatMode = 'thinking' | 'lite' | 'maps';

interface Message {
  role: 'user' | 'model';
  text: string;
  groundingChunks?: any[];
  image?: string;
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
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !attachedImage) || isLoading) return;

    const userText = input.trim();
    const currentImage = attachedImage;
    
    // Optimistic UI Update
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: userText, 
      image: currentImage || undefined,
      timestamp: new Date() 
    }]);
    
    setInput('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      
      const productContext = products.map(p => `- ${p.name.en} (${p.name.hi || ''}): ₹${p.price}/${p.baseUnit}.`).slice(0, 20).join('\n');
      
      const systemInstruction = `You are FreshLeaf's AI assistant. Tone: Friendly, helpful, Indian context.
      Key Info: Free shipping > ₹499. 24h Delivery.
      Products Available: ${productContext}
      Keep answers short and concise.`;

      let modelName = 'gemini-3-flash-preview'; // Default fallback
      let config: any = { systemInstruction };
      let promptContent: any = userText;

      // 1. Image Analysis (Prioritize Pro Model)
      if (currentImage) {
        modelName = 'gemini-3-pro-preview'; // Use Pro for image analysis
        const base64Data = currentImage.split(',')[1];
        promptContent = [
          { text: userText || "Analyze this image." },
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
        ];
      } 
      // 2. Thinking Mode
      else if (mode === 'thinking') {
        modelName = 'gemini-3-pro-preview';
        config.thinkingConfig = { thinkingBudget: 32768 }; // Max budget for deep reasoning
      } 
      // 3. Maps Grounding
      else if (mode === 'maps') {
        modelName = 'gemini-2.5-flash'; // Required for Maps
        config.tools = [{ googleMaps: {} }];
        // Add location if available
        if (userLocation) {
            config.toolConfig = { 
                googleMaps: {
                    retrievalConfig: { latLng: userLocation } 
                } 
            };
        }
      } 
      // 4. Fast/Lite Mode
      else {
        modelName = 'gemini-2.5-flash-lite-preview-02-05'; // Fastest model
      }

      // Generate Content
      const response = await ai.models.generateContent({
        model: modelName,
        contents: currentImage ? { role: 'user', parts: promptContent } : { role: 'user', parts: [{ text: userText }] },
        config: config
      });
      
      const responseText = response.text || "I'm having a bit of a sprout-out. Could you repeat that?";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: responseText, 
        groundingChunks: groundingChunks, 
        timestamp: new Date() 
      }]);

    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Connection weak. Let's try again.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Hidden when open on mobile to avoid z-index conflicts) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[60] p-4 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center border-4 border-white/50 backdrop-blur-md group active:scale-95 ${
          isOpen ? 'bg-gray-900 rotate-90 scale-90 sm:flex hidden' : 'bg-gradient-to-br from-emerald-600 to-teal-500 hover:scale-110 hover:shadow-emerald-500/40 flex'
        } text-white`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} className="fill-current" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`
            fixed z-[70] sm:z-[60] bg-white/90 backdrop-blur-xl shadow-2xl flex flex-col border border-white/50 
            animate-in fade-in slide-in-from-bottom-10 duration-300 font-sans overflow-hidden
            inset-0 w-full h-[100dvh] rounded-none
            sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[400px] sm:h-[600px] sm:max-h-[80vh] sm:rounded-[2.5rem]
        `}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-5 text-white shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="flex items-center gap-3 relative z-10">
                <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight leading-none">FreshLeaf AI</h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 flex items-center gap-1 mt-1"><span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span> Online</span>
                </div>
                <div className="ml-auto flex gap-1 items-center">
                   <div className="flex gap-1 bg-black/20 p-1 rounded-lg backdrop-blur-sm border border-white/10">
                        {(['lite', 'thinking', 'maps'] as ChatMode[]).map(m => (
                            <button 
                                key={m} 
                                onClick={() => setMode(m)} 
                                title={m === 'lite' ? 'Fast Mode' : m === 'thinking' ? 'Deep Thinking' : 'Maps'}
                                className={`p-1.5 rounded-md transition ${mode === m ? 'bg-white text-emerald-800 shadow-sm' : 'text-white/60 hover:text-white'}`}
                            >
                                {m === 'lite' ? <Zap size={14}/> : m === 'thinking' ? <Brain size={14}/> : <MapPin size={14}/>}
                            </button>
                        ))}
                   </div>
                   {/* Mobile Close Button */}
                   <button 
                        onClick={() => setIsOpen(false)}
                        className="sm:hidden p-2 bg-white/10 hover:bg-white/20 rounded-full text-white ml-2 transition"
                   >
                        <ChevronDown size={20} />
                   </button>
                </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-grow overflow-y-auto p-5 bg-gray-50/50 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${msg.role === 'model' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                    {msg.role === 'model' ? 'AI' : 'U'}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm backdrop-blur-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-br-sm' 
                      : 'bg-white/80 text-gray-800 border border-white rounded-bl-sm'
                  }`}>
                    {msg.image && (
                        <img src={msg.image} alt="Uploaded" className="w-full h-32 object-cover rounded-lg mb-2 border border-white/20" />
                    )}
                    {msg.text}
                  </div>
                </div>
                {msg.groundingChunks && (
                  <div className="mt-2 ml-8 space-y-2 max-w-[80%]">
                    {msg.groundingChunks.map((chunk: any, i: number) => {
                        if (chunk.web) {
                            return (
                                <a key={i} href={chunk.web.uri} target="_blank" className="block bg-white/90 border border-gray-100 p-2 rounded-xl text-xs hover:border-emerald-300 transition shadow-sm backdrop-blur-sm">
                                    <div className="font-bold text-emerald-700 truncate mb-0.5 flex items-center gap-1"><Globe size={10}/> {chunk.web.title}</div>
                                </a>
                            );
                        }
                        if (chunk.maps) {
                             return (
                                <a key={i} href={chunk.maps.googleMapsLink} target="_blank" className="block bg-white/90 border border-gray-100 p-2 rounded-xl text-xs hover:border-emerald-300 transition shadow-sm backdrop-blur-sm">
                                    <div className="font-bold text-emerald-700 truncate mb-0.5 flex items-center gap-1"><MapPin size={10}/> {chunk.maps.title}</div>
                                    <div className="text-gray-500 truncate">{chunk.maps.address}</div>
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
              <div className="flex items-center gap-2 ml-2">
                 <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center"><Bot size={12} className="text-emerald-600"/></div>
                 <div className="bg-white/80 px-4 py-3 rounded-2xl rounded-bl-sm border border-white shadow-sm flex gap-1 items-center backdrop-blur-sm">
                    <span className="text-xs text-gray-500 font-medium mr-2">Typing</span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 bg-white/30 backdrop-blur-md">
             {QUICK_ACTIONS.map((action, i) => (
                 <button key={i} onClick={() => { navigate(action.action); setIsOpen(false); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition whitespace-nowrap shadow-sm backdrop-blur-sm">
                     <action.icon size={12}/> {action.label}
                 </button>
             ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white/80 backdrop-blur-xl border-t border-gray-100 shrink-0 pb-safe-or-4">
            {attachedImage && (
                <div className="flex items-center gap-2 mb-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <img src={attachedImage} className="w-8 h-8 rounded object-cover" alt="Preview"/>
                    <span className="text-xs text-gray-500 flex-grow truncate">Image attached</span>
                    <button onClick={() => setAttachedImage(null)}><X size={14} className="text-gray-400 hover:text-red-500"/></button>
                </div>
            )}
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-gray-100/80 rounded-xl text-gray-500 hover:text-emerald-600 transition hover:bg-emerald-50 backdrop-blur-sm"
              >
                <Camera size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload}
              />
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'thinking' ? "Ask complex questions..." : "Ask me anything..."}
                className="flex-grow bg-gray-100/80 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-medium backdrop-blur-sm"
              />
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !attachedImage)}
                className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:bg-gray-300 transition-all shadow-md active:scale-95 flex items-center justify-center"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
