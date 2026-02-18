import { create } from 'zustand';
import { Timeline, TimelineTrack, TimelineClip } from '@avatar-shot-editor/shared';

interface TimelineState {
  timeline: Timeline;
  selectedClipId: string | null;
  
  // Actions
  setCurrentTime: (time: number) => void;
  setZoom: (zoom: number) => void;
  setSelectedClip: (id: string | null) => void;
  addTrack: (track: TimelineTrack) => void;
  addClip: (trackId: string, clip: TimelineClip) => void;
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  removeClip: (clipId: string) => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  timeline: {
    tracks: [
      { id: 'v1', name: 'Video 1', type: 'video', clips: [], isMuted: false, isLocked: false },
      { id: 'a1', name: 'Audio 1', type: 'audio', clips: [], isMuted: false, isLocked: false },
    ],
    currentTime: 0,
    zoom: 1,
    duration: 600, // 10 minutes default
  },
  selectedClipId: null,

  setCurrentTime: (time) => set((state) => ({
    timeline: { ...state.timeline, currentTime: Math.max(0, time) }
  })),

  setZoom: (zoom) => set((state) => ({
    timeline: { ...state.timeline, zoom: Math.max(0.1, zoom) }
  })),

  setSelectedClip: (id) => set({ selectedClipId: id }),

  addTrack: (track) => set((state) => ({
    timeline: { ...state.timeline, tracks: [...state.timeline.tracks, track] }
  })),

  addClip: (trackId, clip) => set((state) => ({
    timeline: {
      ...state.timeline,
      tracks: state.timeline.tracks.map(t => 
        t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t
      )
    }
  })),

  updateClip: (clipId, updates) => set((state) => ({
    timeline: {
      ...state.timeline,
      tracks: state.timeline.tracks.map(t => ({
        ...t,
        clips: t.clips.map(c => c.id === clipId ? { ...c, ...updates } : c)
      }))
    }
  })),

  removeClip: (clipId) => set((state) => ({
    timeline: {
      ...state.timeline,
      tracks: state.timeline.tracks.map(t => ({
        ...t,
        clips: t.clips.filter(c => c.id !== clipId)
      }))
    }
  })),
}));
