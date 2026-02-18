import React, { useRef, useEffect } from 'react';
import { useTimelineStore } from '../../store/useTimelineStore';

const Timeline: React.FC = () => {
  const { timeline, setCurrentTime } = useTimelineStore();
  const timelineRef = useRef<HTMLDivElement>(null);
  const zoom = timeline.zoom || 1;
  const pixelsPerSecond = 50 * zoom;

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / pixelsPerSecond;
    setCurrentTime(time);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-t border-[#333]">
      {/* Timeline Header / Ruler */}
      <div 
        ref={timelineRef}
        className="h-8 bg-[#252525] relative cursor-pointer border-b border-[#333]"
        onClick={handleTimelineClick}
      >
        {/* Simple Ticks */}
        {Array.from({ length: Math.ceil(timeline.duration / 5) }).map((_, i) => (
          <div 
            key={i} 
            className="absolute top-0 h-full border-l border-[#444] text-[10px] text-gray-500 pl-1"
            style={{ left: `${i * 5 * pixelsPerSecond}px` }}
          >
            {i * 5}s
          </div>
        ))}

        {/* Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-px bg-red-500 z-10 pointer-events-none"
          style={{ left: `${timeline.currentTime * pixelsPerSecond}px` }}
        >
          <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 mt-[-2px]" />
        </div>
      </div>

      {/* Tracks Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {timeline.tracks.map((track) => (
          <div key={track.id} className="flex h-16 border-b border-[#333]">
            {/* Track Info */}
            <div className="w-48 bg-[#252525] border-r border-[#333] p-2 text-sm flex flex-col justify-center">
              <span className="font-medium">{track.name}</span>
              <span className="text-xs text-gray-500 uppercase">{track.type}</span>
            </div>
            
            {/* Track Content */}
            <div className="flex-1 relative bg-[#1a1a1a]">
              {track.clips.map((clip) => (
                <div 
                  key={clip.id}
                  className="absolute top-1 bottom-1 bg-blue-600/40 border border-blue-400 rounded-sm cursor-move flex items-center px-2 overflow-hidden"
                  style={{ 
                    left: `${clip.startTime * pixelsPerSecond}px`, 
                    width: `${clip.duration * pixelsPerSecond}px` 
                  }}
                >
                  <span className="text-xs truncate">{clip.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
