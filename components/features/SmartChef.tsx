
import React, { useState } from 'react';
import { ChefHat, Sparkles, X, ShoppingBag, Utensils, ArrowRight, Loader2, Play } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useCart } from '../../services/CartContext';

interface SmartChefProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartChef: React.FC<SmartChefProps> = ({ isOpen, onClose }) => {
  const { cartItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [mode, setMode] = useState<'cart' | 'custom'>('cart');
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const generateRecipe = async () => {
    setLoading(true);
    setRecipe(null);

    try {
      const apiKey = process.env.API_KEY;
      // Fallback if no API Key is available
      if (!apiKey) {
        setTimeout(() => {
            setRecipe(`**FreshLeaf Garden Salad (Demo)**\n\n*Ingredients:*\n- Spinach\n- Cherry Tomatoes\n- Cucumber\n\n*Instructions:*\n1. Wash all vegetables thoroughly.\n2. Chop cucumber and tomatoes.\n3. Toss with spinach and olive oil.\n4. Season with salt and pepper.`);
            setLoading(false);
        }, 2000);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      let prompt = "";
      if (mode === 'cart') {
        const ingredients = cartItems.map(i => i.name.en).join(', ');
        if (!ingredients) {
            setRecipe("Your cart is empty! Add some fresh veggies and I'll suggest a recipe.");
            setLoading(false);
            return;
        }
        prompt = `Suggest a healthy, delicious Indian or Continental recipe using these ingredients: ${ingredients}. You can assume basic pantry staples (oil, salt, spices) are available. Format nicely with Markdown.`;
      } else {
        prompt = `Suggest a healthy recipe based on this request: "${customInput}". Prioritize fresh vegetables and fruits. Format nicely with Markdown.`;
      }

      // Updated to use ai.models.generateContent properly
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      setRecipe(result.text || null);
    } catch (error) {
      console.error(error);
      setRecipe("I'm having trouble connecting to the kitchen server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shrink-0 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
           <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full transition"><X size={20}/></button>
           <div className="flex items-center gap-3 relative z-10">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                 <ChefHat size={32} />
              </div>
              <div>
                 <h2 className="text-2xl font-bold">Smart Chef AI</h2>
                 <p className="text-orange-100 text-sm">Turn your harvest into healthy meals</p>
              </div>
           </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-grow overflow-y-auto bg-gray-50/50">
           
           {!recipe && !loading && (
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <button 
                    onClick={() => setMode('cart')}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'cart' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white hover:border-orange-200'}`}
                   >
                      <ShoppingBag size={24}/>
                      <span className="font-bold text-sm">Use My Cart</span>
                   </button>
                   <button 
                    onClick={() => setMode('custom')}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${mode === 'custom' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white hover:border-orange-200'}`}
                   >
                      <Utensils size={24}/>
                      <span className="font-bold text-sm">Custom Request</span>
                   </button>
                </div>

                {mode === 'custom' && (
                    <input 
                      type="text" 
                      placeholder="e.g. Low carb dinner with spinach..." 
                      className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                    />
                )}

                {mode === 'cart' && cartItems.length > 0 && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Ingredients from Cart</p>
                        <div className="flex flex-wrap gap-2">
                            {cartItems.map(item => (
                                <span key={item.id} className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-lg border border-green-100">{item.name.en}</span>
                            ))}
                        </div>
                    </div>
                )}

                <button 
                    onClick={generateRecipe}
                    disabled={mode === 'cart' && cartItems.length === 0}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Sparkles size={20} /> Generate Recipe
                </button>
             </div>
           )}

           {loading && (
             <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 size={48} className="text-orange-500 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-gray-800">Cooking up ideas...</h3>
                <p className="text-gray-500">Analyzing flavors and nutrition.</p>
             </div>
           )}

           {recipe && (
             <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="prose prose-orange max-w-none bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="whitespace-pre-wrap font-medium text-gray-700">{recipe}</div>
                </div>
                <div className="mt-6 flex gap-3">
                    <button onClick={() => setRecipe(null)} className="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50">Try Another</button>
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 shadow-lg">Start Cooking</button>
                </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};
