
import React, { useState, useEffect } from 'react';
import { Gift, X, Sparkles, Trophy } from 'lucide-react';
import { useToast } from '../../services/ToastContext';
import { useAuth } from '../../services/AuthContext';

export const DailyRewards: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [reward, setReward] = useState<string | null>(null);
  const { addToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Show popup 5 seconds after load if not spun today
    const lastSpin = localStorage.getItem('freshleaf_last_spin');
    const today = new Date().toDateString();
    
    if (lastSpin !== today) {
        const timer = setTimeout(() => setIsOpen(true), 5000);
        return () => clearTimeout(timer);
    } else {
        setHasSpun(true);
    }
  }, []);

  const rewards = [
    { label: "10% OFF", color: "#4CAF50", code: "FRESH10" },
    { label: "50 Points", color: "#FF9800", code: "POINTS50" },
    { label: "Free Delivery", color: "#2196F3", code: "FREESHIP" },
    { label: "Better Luck", color: "#9E9E9E", code: null },
    { label: "20% OFF", color: "#E91E63", code: "FRESH20" },
    { label: "Surprise", color: "#9C27B0", code: "SURPRISE" }
  ];

  const spin = () => {
    if (isSpinning || hasSpun) return;
    
    setIsSpinning(true);
    
    // Simulate spin
    const randomIndex = Math.floor(Math.random() * rewards.length);
    const degrees = 1800 + (randomIndex * (360 / rewards.length)); // 5 spins + alignment
    
    const wheel = document.getElementById('spin-wheel');
    if (wheel) {
        wheel.style.transform = `rotate(${degrees}deg)`;
    }

    setTimeout(() => {
        setIsSpinning(false);
        setHasSpun(true);
        const won = rewards[rewards.length - 1 - randomIndex]; // Calculate based on rotation logic
        setReward(won.label);
        
        localStorage.setItem('freshleaf_last_spin', new Date().toDateString());
        
        if (won.code) {
            addToast(`You won ${won.label}! Code: ${won.code}`, 'success');
        } else {
            addToast("Better luck next time!", "info");
        }
    }, 4000); // Duration matches CSS transition
  };

  if (!isOpen && hasSpun) return (
    <button 
        onClick={() => addToast("You have already claimed your daily reward!", "info")}
        className="fixed bottom-24 right-6 z-40 bg-white p-3 rounded-full shadow-lg border border-yellow-200 text-yellow-600 hover:scale-110 transition hidden md:block"
        title="Daily Reward Claimed"
    >
        <Trophy size={20} />
    </button>
  );

  if (!isOpen) return (
    <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full shadow-lg text-white hover:scale-110 transition animate-bounce hidden md:block"
    >
        <Gift size={24} />
    </button>
  );

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isSpinning && setIsOpen(false)}></div>
      
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative overflow-hidden text-center shadow-2xl animate-in zoom-in-95">
         <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-yellow-100 to-white -z-10"></div>
         <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
         
         <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={12}/> Daily Luck
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Spin & Win</h2>
            <p className="text-gray-500 text-sm">Guaranteed rewards every day!</p>
         </div>

         <div className="relative w-64 h-64 mx-auto mb-8">
            {/* Arrow */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-gray-900"></div>
            
            {/* Wheel */}
            <div 
                id="spin-wheel"
                className="w-full h-full rounded-full border-4 border-white shadow-xl relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
                style={{ background: 'conic-gradient(from 0deg, #4CAF50 0 60deg, #FF9800 60deg 120deg, #2196F3 120deg 180deg, #9E9E9E 180deg 240deg, #E91E63 240deg 300deg, #9C27B0 300deg 360deg)' }}
            >
                {/* Simulated segments for visual - simpler than drawing text on conic gradient */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full z-10 shadow-md"></div>
                </div>
            </div>
         </div>

         {reward ? (
             <div className="animate-in fade-in slide-in-from-bottom-2">
                 <h3 className="text-xl font-bold text-gray-900">Result: <span className="text-leaf-600">{reward}</span></h3>
                 <p className="text-xs text-gray-500 mt-1">Check your rewards wallet.</p>
                 <button onClick={() => setIsOpen(false)} className="mt-4 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition">Awesome</button>
             </div>
         ) : (
             <button 
                onClick={spin}
                disabled={isSpinning}
                className="w-full bg-gradient-to-r from-leaf-600 to-leaf-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-leaf-500/30 transition transform active:scale-95 disabled:opacity-70 disabled:transform-none"
             >
                {isSpinning ? 'Spinning...' : 'Spin Now'}
             </button>
         )}
      </div>
    </div>
  );
};
