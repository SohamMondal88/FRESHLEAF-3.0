import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DeliverySlotPickerProps {
  onSelect: (slot: { date: string, time: string }) => void;
}

export const DeliverySlotPicker: React.FC<DeliverySlotPickerProps> = ({ onSelect }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Generate next 3 days
  const dates = Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Start from tomorrow
    return {
      value: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: d.getDate(),
      fullLabel: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
    };
  });

  const timeSlots = [
    { id: 'morning', label: '8 AM - 11 AM', status: 'Filling Fast' },
    { id: 'afternoon', label: '1 PM - 4 PM', status: 'Available' },
    { id: 'evening', label: '5 PM - 8 PM', status: 'Available' }
  ];

  const handleSelection = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    if (date && time) {
      onSelect({ date, time });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Calendar size={14}/> Select Delivery Date
        </label>
        <div className="grid grid-cols-3 gap-3">
          {dates.map((date) => (
            <button
              key={date.value}
              type="button"
              onClick={() => handleSelection(date.value, selectedTime)}
              className={`p-3 rounded-xl border transition-all text-center ${
                selectedDate === date.value 
                  ? 'bg-leaf-600 text-white border-leaf-600 shadow-md transform scale-105' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-leaf-300'
              }`}
            >
              <div className="text-xs font-medium uppercase opacity-80">{date.day}</div>
              <div className="text-xl font-bold">{date.date}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Clock size={14}/> Select Time Slot
          </label>
          <div className="grid grid-cols-1 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => handleSelection(selectedDate, slot.label)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  selectedTime === slot.label 
                    ? 'bg-leaf-50 border-leaf-500 ring-1 ring-leaf-500' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className={`text-sm font-bold ${selectedTime === slot.label ? 'text-leaf-800' : 'text-gray-700'}`}>
                  {slot.label}
                </span>
                {slot.status === 'Filling Fast' && (
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full uppercase tracking-wider">
                    Filling Fast
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};