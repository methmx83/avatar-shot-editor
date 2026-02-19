import React, { useRef, useEffect, useState } from 'react';
import { useTimelineStore } from '../../store/useTimelineStore';
import TimelineClip from './TimelineClip';

const Timeline: React.FC = () => {
  const { timeline, setCurrentTime, setSelectedClip, isSnapping, toggleSnapping, isRippling, toggleRippling } = useTimelineStore();
  const timelineRef = useRef<HTMLDivElement>(null);
  const zoom = timeline.zoom || 1;
  const pixelsPerSecond = 50 * zoom;

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / pixelsPerSecond;
    setCurrentTime(time);
    setSelectedClip(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-t border-[#333] select-none">
      {/* Timeline Header / Ruler */}
      <div 
        ref={timelineRef}
        className="h-8 bg-[#252525] relative cursor-pointer border-b border-[#333] overflow-hidden"
        onClick={handleTimelineClick}
      >
        {/* Simple Ticks */}
        {Array.from({ length: Math.ceil(timeline.duration / 5) }).map((_, i) => (
          <div 
            key={i} 
            className="absolute top-0 h-full border-l border-[#444] text-[10px] text-gray-500 pl-1 pt-1"
            style={{ left: `${i * 5 * pixelsPerSecond}px` }}
          >
            {i * 5}s
          </div>
        ))}

        {/* Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-px bg-red-500 z-50 pointer-events-none"
          style={{ left: `${timeline.currentTime * pixelsPerSecond}px` }}
        >
          <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 mt-[-2px] shadow-sm shadow-black/50" />
          <div className="h-full w-px bg-red-500/50" />
        </div>
      </div>

      {/* Tracks Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {timeline.tracks.map((track) => (
          <div key={track.id} className="flex h-16 border-b border-[#333] group">
            {/* Track Info */}
            <div className="w-48 bg-[#252525] border-r border-[#333] p-2 text-sm flex flex-col justify-center sticky left-0 z-30">
              <span className="font-medium text-gray-300 group-hover:text-white transition-colors">{track.name}</span>
              <div className="flex gap-2 mt-1">
                 <button className={`text-[10px] uppercase font-bold px-1 rounded ${track.isMuted ? 'bg-red-900/40 text-red-400' : 'bg-gray-700 text-gray-400'}`}>M</button>
                 <button className={`text-[10px] uppercase font-bold px-1 rounded ${track.isLocked ? 'bg-orange-900/40 text-orange-400' : 'bg-gray-700 text-gray-400'}`}>L</button>
              </div>
            </div>
            
            {/* Track Content */}
            <div className="flex-1 relative bg-[#1a1a1a]">
              {track.clips.map((clip) => (
                <TimelineClip 
                  key={clip.id} 
                  clip={clip} 
                  pixelsPerSecond={pixelsPerSecond} 
                />
              ))}
            </div>
          </div>
        ))}
        
        {/* Add Track Placeholder */}
        <div className="h-16 flex items-center justify-center border-b border-[#333] opacity-20 hover:opacity-100 transition-opacity cursor-pointer">
           <span className="text-xs uppercase font-bold tracking-widest text-gray-500">+ Add Track</span>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
