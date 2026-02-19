import React, { useState, useRef, useEffect } from 'react';
import { TimelineClip as ITimelineClip } from '@avatar-shot-editor/shared';
import { useTimelineStore } from '../../store/useTimelineStore';

interface TimelineClipProps {
  clip: ITimelineClip;
  pixelsPerSecond: number;
}

const TimelineClip: React.FC<TimelineClipProps> = ({ clip, pixelsPerSecond }) => {
  const { selectedClipId, setSelectedClip, moveClip, updateClip } = useTimelineStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [originalStartTime, setOriginalStartTime] = useState(0);
  const isSelected = selectedClipId === clip.id;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClip(clip.id);
    setIsDragging(true);
    setDragStartX(e.clientX);
    setOriginalStartTime(clip.startTime);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      const deltaTime = deltaX / pixelsPerSecond;
      moveClip(clip.id, originalStartTime + deltaTime);
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
  }, [isDragging, dragStartX, originalStartTime, pixelsPerSecond, clip.id, moveClip]);

  return (
    <div 
      className={`absolute top-1 bottom-1 rounded-sm cursor-move flex items-center px-2 overflow-hidden select-none border-2 transition-colors ${
        isSelected ? 'border-white bg-blue-500 z-20' : 'border-blue-400/50 bg-blue-600/40 z-10'
      } ${isDragging ? 'opacity-70 scale-[0.98]' : 'opacity-100'}`}
      style={{ 
        left: `${clip.startTime * pixelsPerSecond}px`, 
        width: `${clip.duration * pixelsPerSecond}px`,
        backgroundColor: clip.color || undefined
      }}
      onMouseDown={handleMouseDown}
    >
      <span className="text-[10px] font-medium truncate pointer-events-none">{clip.name}</span>
      
      {/* Resizer Handles */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/30" />
      <div className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-white/30" />
    </div>
  );
};

export default TimelineClip;
