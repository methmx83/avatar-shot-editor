import React, { useState, useRef, useEffect } from 'react';
import { useTimelineStore } from '../../store/useTimelineStore';
import { TimelineClip as ClipType } from '@avatar-shot-editor/shared';
import TimelineContextMenu from './TimelineContextMenu';

interface TimelineClipProps {
  clip: ClipType;
  pixelsPerSecond: number;
}

const TimelineClip: React.FC<TimelineClipProps> = ({ clip, pixelsPerSecond }) => {
  const { selectedClipId, setSelectedClip, moveClip } = useTimelineStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
  const isSelected = selectedClipId === clip.id;
  const clipRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();
    setSelectedClip(clip.id);
    setIsDragging(true);
    
    const rect = clipRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset(e.clientX - rect.left);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedClip(clip.id);
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const timelineElement = clipRef.current?.parentElement;
      if (!timelineElement) return;
      
      const rect = timelineElement.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset;
      const newStartTime = newX / pixelsPerSecond;
      
      moveClip(clip.id, newStartTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, clip.id, moveClip, pixelsPerSecond]);

  return (
    <>
      <div 
        ref={clipRef}
        className={`absolute top-1 bottom-1 rounded-md cursor-grab active:cursor-grabbing flex flex-col px-2 py-1 overflow-hidden transition-all duration-150 border-2 shadow-lg ${
          isSelected 
            ? 'bg-blue-600/60 border-blue-400 z-20 ring-2 ring-blue-500/20' 
            : 'bg-blue-800/30 border-blue-700/50 hover:bg-blue-700/40 hover:border-blue-500/50 z-10'
        }`}
        style={{ 
          left: `${clip.startTime * pixelsPerSecond}px`, 
          width: `${clip.duration * pixelsPerSecond}px`,
        }}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
          <span className="text-[10px] font-bold text-blue-100 truncate uppercase tracking-tight">{clip.name}</span>
        </div>
        
        {/* Visual representation of duration */}
        <div className="mt-auto h-0.5 w-full bg-blue-400/20 rounded-full overflow-hidden">
          <div className="h-full bg-blue-400/50" style={{ width: '100%' }} />
        </div>
      </div>

      {contextMenu && (
        <TimelineContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          clipId={clip.id} 
          onClose={() => setContextMenu(null)}
          onSwitchToComfy={() => {
             // We'll need a way to switch tabs, possibly via a custom event or store
             window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'comfy' }));
          }}
        />
      )}
    </>
  );
};

export default TimelineClip;
