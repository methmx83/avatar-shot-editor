import React from 'react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { useComfyStore } from '../../store/useComfyStore';
import { Scissors, Trash2, Wand2, Copy, Layers } from 'lucide-react';

interface TimelineContextMenuProps {
  x: number;
  y: number;
  clipId: string;
  onClose: () => void;
  onSwitchToComfy: () => void;
}

const TimelineContextMenu: React.FC<TimelineContextMenuProps> = ({ x, y, clipId, onClose, onSwitchToComfy }) => {
  const { removeClip, splitClip, timeline } = useTimelineStore();
  const { workflows, addToQueue } = useComfyStore();

  const handleSplit = () => {
    splitClip(clipId, timeline.currentTime);
    onClose();
  };

  const handleRemove = () => {
    removeClip(clipId);
    onClose();
  };

  const handleExtendWithAI = (workflowId: string) => {
    // Find the clip to get its data
    let clipData: any = null;
    for (const track of timeline.tracks) {
      const found = track.clips.find(c => c.id === clipId);
      if (found) {
        clipData = found;
        break;
      }
    }

    if (clipData) {
      addToQueue({
        id: crypto.randomUUID(),
        workflowId: workflowId,
        status: 'pending',
        progress: 0,
        createdAt: Date.now(),
        // In a real scenario, we'd pass the clip's source path or current frame as an input to the workflow
      });
      onSwitchToComfy();
    }
    onClose();
  };

  return (
    <div 
      className="fixed z-[100] bg-[#252525] border border-[#444] rounded-md shadow-xl py-1 w-56 text-xs text-gray-300 select-none"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#333] mb-1">
        Clip Actions
      </div>
      
      <button onClick={handleSplit} className="w-full px-3 py-2 flex items-center gap-3 hover:bg-blue-600 hover:text-white transition-colors">
        <Scissors size={14} /> Split at Playhead
      </button>
      
      <button className="w-full px-3 py-2 flex items-center gap-3 hover:bg-blue-600 hover:text-white transition-colors opacity-50 cursor-not-allowed">
        <Copy size={14} /> Duplicate Clip
      </button>

      <div className="h-px bg-[#333] my-1" />

      <div className="px-3 py-1.5 text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
        <Wand2 size={12} /> AI Enhancements
      </div>

      {workflows.length === 0 ? (
        <div className="px-3 py-2 text-gray-600 italic">No workflows loaded</div>
      ) : (
        workflows.map(w => (
          <button 
            key={w.id} 
            onClick={() => handleExtendWithAI(w.id)}
            className="w-full px-3 py-2 flex items-center gap-3 hover:bg-blue-600 hover:text-white transition-colors pl-6"
          >
            <Layers size={14} /> Use {w.name}
          </button>
        ))
      )}

      <div className="h-px bg-[#333] my-1" />

      <button onClick={handleRemove} className="w-full px-3 py-2 flex items-center gap-3 hover:bg-red-600 hover:text-white transition-colors text-red-400">
        <Trash2 size={14} /> Delete Clip
      </button>
    </div>
  );
};

export default TimelineContextMenu;
