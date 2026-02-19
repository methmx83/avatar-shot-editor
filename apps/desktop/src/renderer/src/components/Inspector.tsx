import React from 'react';
import { useTimelineStore } from '../store/useTimelineStore';
import { TimelineClip } from '@avatar-shot-editor/shared';
import { Trash2, RotateCcw, Maximize, Move, Layers, Eye } from 'lucide-react';

const Inspector: React.FC = () => {
  const { timeline, selectedClipId, updateClip, removeClip } = useTimelineStore();

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
      <aside className="w-72 border-l border-[#333] bg-[#1a1a1a] flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-[#333]">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Inspector</span>
        </div>
        <div className="p-8 text-sm text-gray-500 text-center mt-10 italic">
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
    const defaults: Partial<TimelineClip> = {
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

  return (
    <aside className="w-72 border-l border-[#333] bg-[#1a1a1a] flex flex-col flex-shrink-0 overflow-y-auto custom-scrollbar">
      <div className="p-3 border-b border-[#333] flex justify-between items-center sticky top-0 bg-[#1a1a1a] z-10">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Inspector</span>
        <button 
          onClick={() => removeClip(selectedClipId!)}
          className="p-1 hover:bg-red-900/40 text-red-500 rounded transition-colors"
          title="Delete Clip"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Clip Info Section */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase text-gray-600 tracking-widest flex items-center gap-2">
            <Layers size={12} /> Clip Info
          </h3>
          <div className="bg-[#252525] p-2 rounded border border-[#333]">
            <p className="text-xs font-medium text-gray-300 truncate">{selectedClip.name}</p>
            <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase">{selectedClip.type} | {selectedClip.duration.toFixed(2)}s</p>
          </div>
        </section>

        {/* Transform Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase text-gray-600 tracking-widest flex items-center gap-2">
              <Maximize size={12} /> Transform
            </h3>
            <button onClick={() => { handleReset('scale'); handleReset('rotation'); handleReset('position'); }} className="text-gray-600 hover:text-gray-400">
              <RotateCcw size={10} />
            </button>
          </div>

          {/* Scale */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <label className="text-gray-400">Scale</label>
              <span className="text-blue-400">{(selectedClip.scale * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0.1" max="5" step="0.01"
              value={selectedClip.scale}
              onChange={(e) => handleUpdate({ scale: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Rotation */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <label className="text-gray-400">Rotation</label>
              <span className="text-blue-400">{selectedClip.rotation}°</span>
            </div>
            <input 
              type="range" min="-180" max="180" step="1"
              value={selectedClip.rotation}
              onChange={(e) => handleUpdate({ rotation: parseInt(e.target.value) })}
              className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Position X/Y */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-600 uppercase">Pos X</label>
              <input 
                type="number"
                value={selectedClip.position.x}
                onChange={(e) => handleUpdate({ position: { ...selectedClip!.position, x: parseInt(e.target.value) } })}
                className="w-full bg-[#252525] border border-[#333] rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-600 uppercase">Pos Y</label>
              <input 
                type="number"
                value={selectedClip.position.y}
                onChange={(e) => handleUpdate({ position: { ...selectedClip!.position, y: parseInt(e.target.value) } })}
                className="w-full bg-[#252525] border border-[#333] rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="space-y-4 pt-4 border-t border-[#333]">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase text-gray-600 tracking-widest flex items-center gap-2">
              <Eye size={12} /> Appearance
            </h3>
            <button onClick={() => { handleReset('opacity'); handleReset('blur'); }} className="text-gray-600 hover:text-gray-400">
              <RotateCcw size={10} />
            </button>
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <label className="text-gray-400">Opacity</label>
              <span className="text-blue-400">{(selectedClip.opacity * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.01"
              value={selectedClip.opacity}
              onChange={(e) => handleUpdate({ opacity: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Blur */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <label className="text-gray-400">Blur</label>
              <span className="text-blue-400">{selectedClip.blur || 0}px</span>
            </div>
            <input 
              type="range" min="0" max="50" step="1"
              value={selectedClip.blur || 0}
              onChange={(e) => handleUpdate({ blur: parseInt(e.target.value) })}
              className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Blend Mode */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-600 uppercase">Blend Mode</label>
            <select 
              value={selectedClip.blendMode || 'normal'}
              onChange={(e) => handleUpdate({ blendMode: e.target.value })}
              className="w-full bg-[#252525] border border-[#333] rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="multiply">Multiply</option>
              <option value="screen">Screen</option>
              <option value="overlay">Overlay</option>
              <option value="darken">Darken</option>
              <option value="lighten">Lighten</option>
            </select>
          </div>
        </section>
      </div>
    </aside>
  );
};

export default Inspector;
