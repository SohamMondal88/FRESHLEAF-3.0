
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../services/CartContext';
import { useAuth } from '../services/AuthContext';
import { useOrder } from '../services/OrderContext';
import { useToast } from '../services/ToastContext';
import { ShieldCheck, CreditCard, Banknote, MapPin, BellOff, PhoneOff, Package, Plus } from 'lucide-react';
import { DeliverySlotPicker } from '../components/DeliverySlotPicker';

export const Checkout: React.FC = () => {
  const { cartItems, bill, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrder();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [deliverySlot, setDeliverySlot] = useState<{date: string, time: string} | null>(null);
  const [deliveryInstruction, setDeliveryInstruction] = useState<string[]>([]);
  const [geoLocating, setGeoLocating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    phone: user?.phone?.replace('+91', '') || '',
    address: user?.address || '',
    city: user?.city || 'Kolkata', 
    zip: user?.pincode || '',
    paymentMethod: 'razorpay'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleInstruction = (inst: string) => {
      setDeliveryInstruction(prev => prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst]);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
        addToast("Geolocation not supported", "error");
        return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // In a real app, use Reverse Geocoding API (Google/Mapbox) here.
            // For Free Tier safe, we set lat/lng and a placeholder address.
            const lat = position.coords.latitude.toFixed(4);
            const lng = position.coords.longitude.toFixed(4);
            setFormData(prev => ({
                ...prev, 
                address: `GPS Location (${lat}, ${lng}) - Near Current Position`
            }));
            setGeoLocating(false);
            addToast("Location detected!", "success");
        },
        (error) => {
            setGeoLocating(false);
            addToast("Unable to retrieve location", "error");
        }
    );
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Create Order with all details
    const orderId = await createOrder(
        cartItems, 
        bill.finalTotal, 
        `${formData.address}, ${formData.city} - ${formData.zip}`, 
        formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online', 
        formData.phone, 
        `${formData.firstName} ${formData.lastName}`,
        deliveryInstruction
    );

    clearCart();
    setLoading(false);
    addToast('Order placed successfully!', 'success');
    navigate(`/order-confirmation?id=${orderId}`);
  };

  const instructions = [
      { id: 'door', label: 'Leave at Door', icon: Package },
      { id: 'bell', label: 'No Doorbell', icon: BellOff },
      { id: 'call', label: 'Avoid Calling', icon: PhoneOff },
  ];

  return (
    <div className="py-8 bg-[#f8fafc] min-h-screen font-sans">
      <div className="container mx-auto px-4 max-w-xl">
        <h1 className="text-xl font-extrabold mb-6 text-gray-900">Checkout</h1>
        
        <form onSubmit={handlePayment} className="space-y-6">
            
            {/* Delivery Instructions */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-sm text-gray-900 mb-3">Delivery Preferences</h3>
                <div className="grid grid-cols-3 gap-3">
                    {instructions.map(inst => (
                        <button
                            key={inst.id}
                            type="button"
                            onClick={() => toggleInstruction(inst.label)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                deliveryInstruction.includes(inst.label) 
                                ? 'bg-green-50 border-green-500 text-green-700' 
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <inst.icon size={20} className="mb-1" />
                            <span className="text-[10px] font-bold">{inst.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Address */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-sm text-gray-900">Address Details</h3>
                    <button type="button" onClick={detectLocation} className="text-xs font-bold text-leaf-600 flex items-center gap-1 hover:underline">
                        <MapPin size={12}/> {geoLocating ? 'Detecting...' : 'Detect Location'}
                    </button>
                </div>
                <div className="space-y-3">
                    <input required name="address" value={formData.address} onChange={handleInputChange} placeholder="House / Flat / Block No." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-green-500" />
                    <div className="grid grid-cols-2 gap-3">
                        <input required name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-green-500" />
                        <input required name="zip" value={formData.zip} onChange={handleInputChange} placeholder="Pincode" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-green-500" />
                    </div>
                </div>
            </div>

            {/* Pay Button */}
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 flex items-center justify-center gap-2"
            >
                {loading ? 'Processing...' : `Pay ₹${bill.finalTotal}`}
            </button>
        </form>
      </div>
    </div>
  );
};
