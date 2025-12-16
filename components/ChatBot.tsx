import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Loader2, Brain, Zap, Globe, MapPin, ExternalLink } from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useProduct } from '../services/ProductContext';

type ChatMode = 'thinking' | 'lite' | 'search' | 'maps';

interface Message {
  role: 'user' | 'model';
  text: string;
  groundingChunks?: any[];
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('thinking');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I am the FreshLeaf AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const { products } = useProduct();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Get User Location for Maps
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

  // Initialize Chat based on Mode
  useEffect(() => {
    const initChat = async () => {
      try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) return;

        const ai = new GoogleGenAI({ apiKey });
        
        // Context Construction
        const productContext = products.map(p => 
          `- ${p.name.en}: ₹${p.price}/${p.baseUnit}. ${p.inStock ? 'In Stock' : 'Out'}.`
        ).join('\n');
        
        const systemInstruction = `You are FreshLeaf's AI assistant. 
        Products: ${productContext}
        Policies: Free shipping > ₹499. Returns within 24h.
        If using Google Maps, use the user's location if available.`;

        let modelName = 'gemini-3-pro-preview';
        let config: any = { systemInstruction };

        switch (mode) {
          case 'thinking':
            modelName = 'gemini-3-pro-preview';
            config.thinkingConfig = { thinkingBudget: 32768 };
            break;
          case 'lite':
            modelName = 'gemini-2.5-flash-lite';
            break;
          case 'search':
            modelName = 'gemini-2.5-flash';
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
  }, [mode, userLocation, products]); // Re-init if products change (price update)

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) throw new Error("Chat not initialized");

      const result = await chatSessionRef.current.sendMessage({ message: userText });
      
      const responseText = result.text || "I couldn't generate a text response.";
      
      // Extract grounding chunks if available
      const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: responseText,
        groundingChunks: groundingChunks
      }]);

    } catch (error) {
      console.error("Msg Error", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
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

  const getModeLabel = (m: ChatMode) => {
    switch(m) {
      case 'thinking': return 'Deep Thinker';
      case 'lite': return 'Fast Chat';
      case 'search': return 'Web Search';
      case 'maps': return 'Maps Locator';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-leaf-600 hover:bg-leaf-700 hover:scale-110'
        } text-white`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-96 h-[600px] max-h-[75vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 animate-in fade-in slide-in-from-bottom-10 overflow-hidden font-sans">
          
          {/* Header */}
          <div className="bg-leaf-600 p-3 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <h3 className="font-bold text-sm">FreshLeaf AI</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white"><Minimize2 size={18} /></button>
            </div>
            
            {/* Mode Selector */}
            <div className="flex gap-1 bg-leaf-700/50 p-1 rounded-lg overflow-x-auto">
              {(['thinking', 'lite', 'search', 'maps'] as ChatMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[10px] font-bold transition-all whitespace-nowrap ${
                    mode === m ? 'bg-white text-leaf-700 shadow-sm' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {getModeIcon(m)}
                  {getModeLabel(m)}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-leaf-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Grounding Sources (Search/Maps) */}
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-2 max-w-[85%] space-y-2">
                    {msg.groundingChunks.map((chunk: any, i: number) => {
                      if (chunk.web) {
                        return (
                          <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="block bg-blue-50 border border-blue-100 p-2 rounded-lg hover:bg-blue-100 transition text-xs">
                             <div className="font-bold text-blue-700 flex items-center gap-1"><Globe size={10}/> {chunk.web.title}</div>
                             <div className="text-blue-500 truncate">{chunk.web.uri}</div>
                          </a>
                        );
                      }
                      if (chunk.maps) {
                         return (
                          <a key={i} href={chunk.maps.googleMapsUri || "#"} target="_blank" rel="noopener noreferrer" className="block bg-green-50 border border-green-100 p-2 rounded-lg hover:bg-green-100 transition text-xs">
                             <div className="font-bold text-green-700 flex items-center gap-1"><MapPin size={10}/> {chunk.maps.title}</div>
                             <div className="text-green-600 truncate">{chunk.maps.formattedAddress}</div>
                             {chunk.maps.rating && <div className="text-green-600 mt-0.5 flex items-center gap-1">★ {chunk.maps.rating}</div>}
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
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-leaf-600" />
                  <span className="text-xs text-gray-500 font-medium">
                    {mode === 'thinking' ? 'Reasoning...' : mode === 'search' ? 'Searching web...' : 'Typing...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'search' ? "Search for prices, trends..." : mode === 'maps' ? "Find stores nearby..." : "Ask me anything..."}
              className="flex-grow bg-gray-100 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-leaf-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-leaf-600 text-white p-2.5 rounded-full hover:bg-leaf-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};