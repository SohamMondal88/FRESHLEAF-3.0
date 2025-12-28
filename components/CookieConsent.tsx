import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('freshleaf_cookie_consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('freshleaf_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-10 duration-500">
      <div className="max-w-4xl mx-auto bg-gray-900 text-white p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-6 border border-gray-800">
        <div className="bg-leaf-900 p-3 rounded-full text-leaf-400 shrink-0">
          <Cookie size={32} />
        </div>
        <div className="flex-grow text-center md:text-left">
          <h4 className="font-bold text-lg mb-1">We value your privacy</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            We use cookies to enhance your shopping experience, analyze site traffic, and serve personalized content. 
            By clicking "Accept", you consent to our use of cookies.
          </p>
        </div>
        <div className="flex gap-3 shrink-0 w-full md:w-auto">
          <button 
            onClick={() => setIsVisible(false)}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-sm font-bold transition"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-8 py-2.5 rounded-xl bg-leaf-600 hover:bg-leaf-700 text-white text-sm font-bold shadow-lg shadow-leaf-900/50 transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};