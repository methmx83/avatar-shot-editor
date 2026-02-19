import React, { useState, useEffect } from 'react';
import Timeline from './components/Timeline/Timeline';
import AssetPanel from './components/AssetPanel';
import Inspector from './components/Inspector';
import { useTimelineStore } from './store/useTimelineStore';
import { useAssetStore } from './store/useAssetStore';
import { Settings, Play, Pause, Scissors, MousePointer2, Move, Magnet, ArrowLeftRight, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const { timeline, setCurrentTime, isSnapping, toggleSnapping, isRippling, toggleRippling, selectedClipId, removeClip } = useTimelineStore();
  const { assets } = useAssetStore();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(timeline.currentTime + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeline.currentTime, setCurrentTime]);

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedClipId) removeClip(selectedClipId);
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipId, removeClip, isPlaying]);

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-gray-200 overflow-hidden">
      {/* Top Navigation / Header */}
      <header className="h-12 border-b border-[#333] flex items-center px-4 justify-between bg-[#1e1e1e] flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-bold text-blue-500 text-lg">AI Studio</span>
          <nav className="flex gap-4 text-sm font-medium">
            <button className="hover:text-white">File</button>
            <button className="hover:text-white">Edit</button>
            <button className="hover:text-white">View</button>
            <button className="hover:text-white">Window</button>
            <button className="hover:text-white">Help</button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-[#333] rounded-md"><Settings size={18} /></button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium">Export</button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar - Assets */}
        <AssetPanel />

        {/* Center - Preview & Editor */}
        <section className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
             {/* Video Preview Placeholder */}
             <div className="aspect-video w-[80%] bg-[#1a1a1a] shadow-2xl flex items-center justify-center border border-[#333]">
                <span className="text-gray-600">Preview Area</span>
             </div>
             
             {/* Preview Controls Overlay */}
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-4">
                <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-blue-400">
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>
                <span className="text-xs font-mono w-20 text-center">
                  {new Date(timeline.currentTime * 1000).toISOString().substr(11, 8)}
                </span>
             </div>
          </div>
          
          {/* Timeline Controls */}
          <div className="h-10 border-t border-[#333] bg-[#1e1e1e] flex items-center px-4 gap-4 flex-shrink-0">
             <div className="flex items-center gap-1 border-r border-[#333] pr-4">
                <button className="p-1.5 hover:bg-[#333] rounded-md text-blue-500 bg-[#333]"><MousePointer2 size={16} /></button>
                <button className="p-1.5 hover:bg-[#333] rounded-md"><Scissors size={16} /></button>
                <button className="p-1.5 hover:bg-[#333] rounded-md"><Move size={16} /></button>
             </div>
             
             <div className="flex items-center gap-2 border-r border-[#333] pr-4">
                <button 
                  onClick={toggleSnapping}
                  className={`p-1.5 rounded-md transition-colors ${isSnapping ? 'bg-blue-600 text-white' : 'hover:bg-[#333] text-gray-400'}`}
                  title="Toggle Snapping (S)"
                >
                  <Magnet size={16} />
                </button>
                <button 
                  onClick={toggleRippling}
                  className={`p-1.5 rounded-md transition-colors ${isRippling ? 'bg-blue-600 text-white' : 'hover:bg-[#333] text-gray-400'}`}
                  title="Toggle Rippling (R)"
                >
                  <ArrowLeftRight size={16} />
                </button>
             </div>

             {selectedClipId && (
               <button 
                onClick={() => removeClip(selectedClipId)}
                className="p-1.5 hover:bg-red-900/40 text-red-500 rounded-md transition-colors"
                title="Delete Selected Clip"
               >
                 <Trash2 size={16} />
               </button>
             )}

             <div className="flex-1"></div>
             <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500">ZOOM</span>
                <input type="range" className="w-24 h-1 bg-[#333] rounded-lg appearance-none cursor-pointer" />
             </div>
          </div>
          
          {/* Timeline Component Container */}
          <div className="h-[300px] flex-shrink-0 overflow-hidden">
            <Timeline />
          </div>
        </section>

        {/* Right Sidebar - Inspector */}
        <Inspector />
      </main>
      
      {/* Footer / Status Bar */}
      <footer className="h-6 border-t border-[#333] bg-[#1e1e1e] px-3 flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest flex-shrink-0">
        <span>Ready</span>
        <div className="flex gap-4">
          <span>Assets: {assets.length}</span>
          <span>ComfyUI: <span className="text-green-500">Connected</span></span>
          <span>FPS: 60</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
