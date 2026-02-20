import React, { useState } from 'react';
import { useTimelineStore } from '../store/useTimelineStore';
import { TimelineClip, Annotation } from '@avatar-shot-editor/shared';
import { Trash2, RotateCcw, Maximize, Move, Layers, Eye, Wand2, Tag, X, Plus, Target, MessageSquareQuote } from 'lucide-react';

const PRESET_TAGS = [
  'Close-up', 'Wide Shot', 'Low Angle', 'High Angle', 'Cinematic', 
  'Neon Lighting', 'Natural Light', 'Portrait', 'Landscape', 'Dynamic'
];

const Inspector: React.FC = () => {
  const { timeline, selectedClipId, updateClip, removeClip, addAiTag, removeAiTag } = useTimelineStore();
  const [newTag, setNewTag] = useState('');

  // Find the selected clip
  let selectedClip: TimelineClip | undefined;
  for (const track of timeline.tracks) {
    const found = track.clips.find(c => c.id === selectedClipId);
    if (found) {
      selectedClip = found;
      break;
    }
  }

  if (!selectedClip) {
    return (
      <aside className="w-72 border-l border-[#222] bg-[#111] flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-[#222]">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-600">Inspector</span>
        </div>
        <div className="p-10 text-sm text-gray-700 text-center mt-10 italic font-medium">
          Select a clip on the timeline to edit its properties.
        </div>
      </aside>
    );
  }

  const handleUpdate = (updates: Partial<TimelineClip>) => {
    if (selectedClipId) {
      updateClip(selectedClipId, updates);
    }
  };

  const handleReset = (property: keyof TimelineClip) => {
    const defaults: any = {
      scale: 1,
      opacity: 1,
      rotation: 0,
      blur: 0,
      position: { x: 0, y: 0 }
    };
    if (property in defaults) {
      handleUpdate({ [property]: defaults[property] });
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag.trim() && selectedClipId) {
      addAiTag(selectedClipId, tag.trim());
      setNewTag('');
    }
  };

  return (
    <aside className="w-72 border-l border-[#222] bg-[#111] flex flex-col flex-shrink-0 overflow-y-auto custom-scrollbar select-none">
      <div className="p-4 border-b border-[#222] flex justify-between items-center sticky top-0 bg-[#111]/90 backdrop-blur-md z-10">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Inspector</span>
        <button 
          onClick={() => removeClip(selectedClipId!)}
          className="p-1.5 hover:bg-red-900/20 text-red-500 rounded-lg transition-all border border-transparent hover:border-red-900/30"
          title="Delete Clip"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="p-5 space-y-8">
        {/* AI Generative Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] flex items-center gap-2">
            <Wand2 size={12} fill="currentColor" className="opacity-50" /> AI GENERATIVE
          </h3>
          
          {/* Prompt Override */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <MessageSquareQuote size={10} /> Prompt Override
            </label>
            <textarea 
              value={selectedClip.promptOverride || ''}
              onChange={(e) => handleUpdate({ promptOverride: e.target.value })}
              placeholder="Describe how AI should modify this clip..."
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-blue-600 min-h-[80px] transition-all"
            />
          </div>

          {/* Cinematography Tags */}
          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Tag size={10} /> Cinematography Tags
            </label>
            
            <div className="flex flex-wrap gap-1.5">
              {selectedClip.aiTags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-blue-900/20 text-blue-400 border border-blue-900/30 rounded-md text-[10px] font-bold">
                  {tag}
                  <button onClick={() => removeAiTag(selectedClipId!, tag)} className="hover:text-white">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag(newTag)}
                placeholder="Add tag..."
                className="flex-1 bg-[#0a0a0a] border border-[#222] rounded-md px-2 py-1 text-[10px] focus:outline-none focus:border-blue-600"
              />
              <button 
                onClick={() => handleAddTag(newTag)}
                className="p-1.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#222] rounded-md transition-all"
              >
                <Plus size={12} />
              </button>
            </div>

            <div className="pt-1 flex flex-wrap gap-1 opacity-60">
               {PRESET_TAGS.filter(t => !selectedClip?.aiTags.includes(t)).slice(0, 5).map(tag => (
                 <button 
                   key={tag}
                   onClick={() => handleAddTag(tag)}
                   className="text-[9px] px-1.5 py-0.5 border border-[#222] rounded hover:border-blue-900/50 hover:text-blue-400 transition-all"
                 >
                   +{tag}
                 </button>
               ))}
            </div>
          </div>

          {/* Annotation Link */}
          <div className="space-y-2">
             <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Target size={10} /> Annotations
             </label>
             <button className="w-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/20 rounded-lg py-2.5 text-[10px] font-black uppercase tracking-[0.1em] text-blue-400 transition-all flex items-center justify-center gap-2">
                <Target size={14} /> Open Annotation Canvas
             </button>
             <p className="text-[9px] text-gray-600 text-center italic">Draw masks or bounding boxes for Inpainting</p>
          </div>
        </section>

        {/* Transform Section */}
        <section className="space-y-4 pt-6 border-t border-[#222]">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] flex items-center gap-2">
              <Maximize size={12} className="opacity-50" /> TRANSFORM
            </h3>
            <button onClick={() => { handleReset('scale'); handleReset('rotation'); handleReset('position'); }} className="text-gray-700 hover:text-white transition-colors">
              <RotateCcw size={12} />
            </button>
          </div>

          {/* Scale */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold">
              <label className="text-gray-500">SCALE</label>
              <span className="text-blue-500">{(selectedClip.scale * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0.1" max="5" step="0.01"
              value={selectedClip.scale}
              onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#222] rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Rotation */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold">
              <label className="text-gray-500">ROTATION</label>
              <span className="text-blue-500">{selectedClip.rotation}°</span>
            </div>
            <input 
              type="range" min="-180" max="180" step="1"
              value={selectedClip.rotation}
              onChange={(e) => handleUpdate({ rotation: parseInt(e.target.value) })}
              className="w-full h-1 bg-[#222] rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Position X/Y */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-600 font-bold uppercase">Pos X</label>
              <input 
                type="number"
                value={selectedClip.position.x}
                onChange={(e) => handleUpdate({ position: { ...selectedClip!.position, x: parseInt(e.target.value) } })}
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-600 font-bold uppercase">Pos Y</label>
              <input 
                type="number"
                value={selectedClip.position.y}
                onChange={(e) => handleUpdate({ position: { ...selectedClip!.position, y: parseInt(e.target.value) } })}
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="space-y-4 pt-6 border-t border-[#222]">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] flex items-center gap-2">
              <Eye size={12} className="opacity-50" /> APPEARANCE
            </h3>
            <button onClick={() => { handleReset('opacity'); handleReset('blur'); }} className="text-gray-700 hover:text-white transition-colors">
              <RotateCcw size={12} />
            </button>
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold">
              <label className="text-gray-500">OPACITY</label>
              <span className="text-blue-500">{(selectedClip.opacity * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01"
              value={selectedClip.opacity}
              onChange={(e) => handleUpdate({ opacity: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#222] rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Blur */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold">
              <label className="text-gray-500">BLUR</label>
              <span className="text-blue-500">{selectedClip.blur || 0}px</span>
            </div>
            <input 
              type="range" min="0" max="50" step="1"
              value={selectedClip.blur || 0}
              onChange={(e) => handleUpdate({ blur: parseInt(e.target.value) })}
              className="w-full h-1 bg-[#222] rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </section>
      </div>
    </aside>
  );
};

export default Inspector;
