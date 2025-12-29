
import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('freshleaf_cookie_consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('freshleaf_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-xl animate-in slide-in-from-bottom-10 fade-in duration-700">
      <div className="bg-gray-900/90 backdrop-blur-xl text-white p-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center gap-5 border border-white/10 ring-1 ring-black/50">
        <div className="bg-gradient-to-br from-orange-400 to-yellow-600 p-3 rounded-full text-white shrink-0 shadow-lg">
          <Cookie size={28} />
        </div>
        <div className="flex-grow text-center sm:text-left">
          <h4 className="font-bold text-base mb-1">We value your privacy</h4>
          <p className="text-gray-300 text-xs leading-relaxed font-medium">
            We use cookies to improve your experience. By continuing, you agree to our privacy policy.
          </p>
        </div>
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <button 
            onClick={() => setIsVisible(false)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-bold transition text-gray-300"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-white text-gray-900 hover:bg-gray-100 text-xs font-bold shadow-lg transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};
