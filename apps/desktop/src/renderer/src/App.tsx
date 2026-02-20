import React, { useState, useEffect } from 'react';
import Timeline from './components/Timeline/Timeline';
import AssetPanel from './components/AssetPanel';
import Inspector from './components/Inspector';
import WorkflowPanel from './components/WorkflowPanel';
import { useTimelineStore } from './store/useTimelineStore';
import { useAssetStore } from './store/useAssetStore';
import { Settings, Play, Pause, Scissors, MousePointer2, Move, Magnet, ArrowLeftRight, Trash2, Database, Layout, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const { timeline, setCurrentTime, isSnapping, toggleSnapping, isRippling, toggleRippling, selectedClipId, removeClip } = useTimelineStore();
  const { assets } = useAssetStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'comfy'>('editor');

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

  // Listen for tab switch events (from context menu)
  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('switch-tab', handleSwitchTab);
    return () => window.removeEventListener('switch-tab', handleSwitchTab);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-gray-200 overflow-hidden font-sans">
      {/* Top Navigation / Header */}
      <header className="h-12 border-b border-[#222] flex items-center px-4 justify-between bg-[#111] flex-shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Sparkles size={18} className="text-white" fill="currentColor" />
            </div>
            <span className="font-black text-white text-lg tracking-tighter uppercase">Avatar Shot</span>
          </div>
          
          <nav className="flex gap-1 ml-6 bg-[#1a1a1a] p-1 rounded-lg border border-[#333]">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${activeTab === 'editor' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-500 hover:text-white hover:bg-[#222]'}`}
            >
              <Layout size={14} /> EDITOR
            </button>
            <button 
              onClick={() => setActiveTab('comfy')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${activeTab === 'comfy' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-500 hover:text-white hover:bg-[#222]'}`}
            >
              <Database size={14} /> COMFY BRIDGE
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#333]">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live</span>
          </div>
          <button className="p-2 hover:bg-[#333] rounded-full transition-colors"><Settings size={18} className="text-gray-400" /></button>
          <button className="bg-white hover:bg-gray-200 text-black px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">
            Export
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden min-h-0 bg-[#0d0d0d]">
        {activeTab === 'editor' ? (
          <>
            {/* Left Sidebar - Assets */}
            <AssetPanel />

            {/* Center - Preview & Editor */}
            <section className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
              <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden group">
                 {/* Video Preview Placeholder */}
                 <div className="aspect-video w-[85%] bg-[#111] shadow-2xl shadow-black flex items-center justify-center border border-[#222] rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-transparent pointer-events-none" />
                    <span className="text-gray-800 font-black text-4xl tracking-tighter uppercase opacity-20 select-none">Preview Area</span>
                 </div>
                 
                 {/* Preview Controls Overlay */}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#111]/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-6 shadow-2xl transition-all group-hover:bottom-8">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-blue-400 transition-colors transform active:scale-90">
                      {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>
                    <div className="h-6 w-px bg-white/10" />
                    <span className="text-sm font-mono font-bold w-24 text-center text-blue-400 tracking-wider">
                      {new Date(timeline.currentTime * 1000).toISOString().substr(11, 8)}
                    </span>
                 </div>
              </div>
              
              {/* Timeline Controls */}
              <div className="h-12 border-t border-[#222] bg-[#111] flex items-center px-6 gap-6 flex-shrink-0 z-10">
                 <div className="flex items-center gap-1 bg-[#0a0a0a] p-1 rounded-lg border border-[#222]">
                    <button className="p-2 hover:bg-[#222] rounded-md text-blue-500 bg-[#222] transition-all"><MousePointer2 size={16} /></button>
                    <button className="p-2 hover:bg-[#222] rounded-md text-gray-500 hover:text-white transition-all"><Scissors size={16} /></button>
                    <button className="p-2 hover:bg-[#222] rounded-md text-gray-500 hover:text-white transition-all"><Move size={16} /></button>
                 </div>
                 
                 <div className="flex items-center gap-2 bg-[#0a0a0a] p-1 rounded-lg border border-[#222]">
                    <button 
                      onClick={toggleSnapping}
                      className={`p-2 rounded-md transition-all ${isSnapping ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-500 hover:text-white hover:bg-[#222]'}`}
                      title="Toggle Snapping (S)"
                    >
                      <Magnet size={16} />
                    </button>
                    <button 
                      onClick={toggleRippling}
                      className={`p-2 rounded-md transition-all ${isRippling ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-500 hover:text-white hover:bg-[#222]'}`}
                      title="Toggle Rippling (R)"
                    >
                      <ArrowLeftRight size={16} />
                    </button>
                 </div>

                 {selectedClipId && (
                   <button 
                    onClick={() => removeClip(selectedClipId)}
                    className="p-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded-lg transition-all border border-red-900/30"
                    title="Delete Selected Clip"
                   >
                     <Trash2 size={16} />
                   </button>
                 )}

                 <div className="flex-1"></div>
                 <div className="flex items-center gap-3 bg-[#0a0a0a] px-4 py-1.5 rounded-lg border border-[#222]">
                    <span className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Zoom</span>
                    <input type="range" className="w-32 h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-500" />
                 </div>
              </div>
              
              {/* Timeline Component Container */}
              <div className="h-[320px] flex-shrink-0 overflow-hidden bg-[#0d0d0d]">
                <Timeline />
              </div>
            </section>

            {/* Right Sidebar - Inspector */}
            <Inspector />
          </>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0a0a0a]">
            <WorkflowPanel />
          </div>
        )}
      </main>
      
      {/* Footer / Status Bar */}
      <footer className="h-7 border-t border-[#222] bg-[#111] px-4 flex items-center justify-between text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] flex-shrink-0 z-50">
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> System: Online</span>
          <span className="text-gray-700">|</span>
          <span>Assets: <span className="text-white">{assets.length}</span></span>
        </div>
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-1.5">ComfyUI: <span className="text-green-500">Connected</span></span>
          <span className="text-gray-700">|</span>
          <span>FPS: <span className="text-white">60.0</span></span>
        </div>
      </footer>
    </div>
  );
};

export default App;
