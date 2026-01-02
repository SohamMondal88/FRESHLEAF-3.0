
import React, { useState } from 'react';
import { X, Play, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STORIES = [
  { id: 1, user: 'FreshLeaf', avatar: 'https://cdn-icons-png.flaticon.com/512/2909/2909808.png', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', title: 'Just Harvested!', type: 'video' },
  { id: 2, user: 'Farmer Raj', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', image: 'https://images.unsplash.com/photo-1595855709957-bc07692996d1?auto=format&fit=crop&w=600&q=80', title: 'Farm Tour', type: 'image' },
  { id: 3, user: 'Chef Anjali', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', title: 'Recipe Idea', type: 'image' },
  { id: 4, user: 'Deals', avatar: 'https://cdn-icons-png.flaticon.com/512/726/726496.png', image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=600&q=80', title: '50% OFF', type: 'image' },
];

export const FreshStories: React.FC = () => {
  const [activeStory, setActiveStory] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleOpen = (idx: number) => setActiveStory(idx);
  const handleClose = () => setActiveStory(null);
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStory !== null && activeStory < STORIES.length - 1) setActiveStory(activeStory + 1);
    else handleClose();
  };

  const activeStoryData = activeStory !== null ? STORIES[activeStory] : null;

  return (
    <>
      {/* Story Bubbles */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide py-4 px-4 bg-white border-b border-gray-100">
        {STORIES.map((story, idx) => (
          <div key={story.id} className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group" onClick={() => handleOpen(idx)}>
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-leaf-600 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative">
                <img src={story.image} alt="" className="w-full h-full object-cover" />
                {story.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play size={12} className="text-white fill-current"/>
                    </div>
                )}
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-600 truncate max-w-[70px]">{story.title}</span>
          </div>
        ))}
      </div>

      {/* Full Screen Viewer */}
      {activeStoryData && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" onClick={handleNext}>
           
           {/* Progress Bar (Simulated) */}
           <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
              {STORIES.map((_, i) => (
                  <div key={i} className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
                      <div className={`h-full bg-white transition-all duration-300 ${i < activeStory! ? 'w-full' : i === activeStory ? 'w-1/2 animate-pulse' : 'w-0'}`}></div>
                  </div>
              ))}
           </div>

           {/* Header */}
           <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-20 text-white">
              <div className="flex items-center gap-3">
                  <img src={activeStoryData.avatar} className="w-8 h-8 rounded-full border border-white/50" />
                  <span className="font-bold text-sm shadow-sm">{activeStoryData.user}</span>
                  <span className="text-xs opacity-70">2h ago</span>
              </div>
              <button onClick={(e) => {e.stopPropagation(); handleClose();}}><X size={24}/></button>
           </div>

           {/* Content */}
           <div className="w-full h-full max-w-md bg-gray-900 relative">
              <img src={activeStoryData.image} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40"></div>
              
              {/* CTA */}
              <div className="absolute bottom-10 left-0 right-0 p-6 flex justify-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleClose(); navigate('/shop'); }}
                    className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition shadow-xl"
                  >
                      View Products <ShoppingBag size={16}/>
                  </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};
