import { create } from 'zustand';
import { Timeline, TimelineTrack, TimelineClip, Annotation } from '@avatar-shot-editor/shared';

interface TimelineState {
  timeline: Timeline;
  selectedClipId: string | null;
  isRippling: boolean;
  isSnapping: boolean;
  
  // Actions
  setCurrentTime: (time: number) => void;
  setZoom: (zoom: number) => void;
  setSelectedClip: (id: string | null) => void;
  toggleRippling: () => void;
  toggleSnapping: () => void;
  
  addTrack: (track: TimelineTrack) => void;
  addClip: (trackId: string, clip: Partial<TimelineClip> & { assetId: string; startTime: number; duration: number; sourcePath: string; name: string; type: 'video' | 'audio' | 'image' }) => void;
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  moveClip: (clipId: string, newStartTime: number, newTrackId?: string) => void;
  removeClip: (clipId: string) => void;
  
  // AI Metadata Actions
  addAiTag: (clipId: string, tag: string) => void;
  removeAiTag: (clipId: string, tag: string) => void;
  addAnnotation: (clipId: string, annotation: Annotation) => void;
  removeAnnotation: (clipId: string, annotationId: string) => void;
  
  // Advanced Editing
  splitClip: (clipId: string, time: number) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  timeline: {
    tracks: [
      { id: 'v1', name: 'Video 1', type: 'video', clips: [], isMuted: false, isLocked: false },
      { id: 'a1', name: 'Audio 1', type: 'audio', clips: [], isMuted: false, isLocked: false },
    ],
    currentTime: 0,
    zoom: 1,
    duration: 600,
  },
  selectedClipId: null,
  isRippling: false,
  isSnapping: true,

  setCurrentTime: (time) => set((state) => ({
    timeline: { ...state.timeline, currentTime: Math.max(0, time) }
  })),

  setZoom: (zoom) => set((state) => ({
    timeline: { ...state.timeline, zoom: Math.max(0.1, zoom) }
  })),

  setSelectedClip: (id) => set({ selectedClipId: id }),
  
  toggleRippling: () => set((state) => ({ isRippling: !state.isRippling })),
  toggleSnapping: () => set((state) => ({ isSnapping: !state.isSnapping })),

  addTrack: (track) => set((state) => ({
    timeline: { ...state.timeline, tracks: [...state.timeline.tracks, track] }
  })),

  addClip: (trackId, clipData) => set((state) => {
    const newClip: TimelineClip = {
      id: crypto.randomUUID(),
      trackId,
      offset: 0,
      scale: 1,
      position: { x: 0, y: 0 },
      opacity: 1,
      rotation: 0,
      blur: 0,
      blendMode: 'normal',
      aiTags: [],
      annotations: [],
      ...clipData
    };

    return {
      timeline: {
        ...state.timeline,
        tracks: state.timeline.tracks.map(t => 
          t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t
        )
      }
    };
  }),

  updateClip: (clipId, updates) => set((state) => ({
    timeline: {
      ...state.timeline,
      tracks: state.timeline.tracks.map(t => ({
        ...t,
        clips: t.clips.map(c => c.id === clipId ? { ...c, ...updates } : c)
      }))
    }
  })),

  moveClip: (clipId, newStartTime, newTrackId) => {
    const { timeline, isSnapping } = get();
    let finalStartTime = Math.max(0, newStartTime);

    if (isSnapping) {
      const threshold = 0.2; // 200ms snapping threshold
      for (const track of timeline.tracks) {
        for (const clip of track.clips) {
          if (clip.id === clipId) continue;
          if (Math.abs(finalStartTime - clip.startTime) < threshold) {
            finalStartTime = clip.startTime;
          } else if (Math.abs(finalStartTime - (clip.startTime + clip.duration)) < threshold) {
            finalStartTime = clip.startTime + clip.duration;
          }
          if (Math.abs(finalStartTime - timeline.currentTime) < threshold) {
             finalStartTime = timeline.currentTime;
          }
        }
      }
    }

    set((state) => {
      const tracks = state.timeline.tracks.map(track => {
        const clipToMove = track.clips.find(c => c.id === clipId);
        if (clipToMove) {
          if (newTrackId && newTrackId !== track.id) {
             return { ...track, clips: track.clips.filter(c => c.id !== clipId) };
          }
          return {
            ...track,
            clips: track.clips.map(c => c.id === clipId ? { ...c, startTime: finalStartTime } : c)
          };
        }
        if (newTrackId === track.id) {
           const sourceTrack = state.timeline.tracks.find(t => t.clips.some(c => c.id === clipId));
           const clip = sourceTrack?.clips.find(c => c.id === clipId);
           if (clip) {
             return { ...track, clips: [...track.clips, { ...clip, startTime: finalStartTime, trackId: newTrackId }] };
           }
        }
        return track;
      });

      return { timeline: { ...state.timeline, tracks } };
    });
  },

  removeClip: (clipId) => set((state) => {
    const { isRippling } = state;
    let clipToRemove: TimelineClip | undefined;
    
    state.timeline.tracks.forEach(t => {
      const found = t.clips.find(c => c.id === clipId);
      if (found) clipToRemove = found;
    });

    const tracks = state.timeline.tracks.map(t => {
      const filteredClips = t.clips.filter(c => c.id !== clipId);
      if (isRippling && clipToRemove && t.id === clipToRemove.trackId) {
        return {
          ...t,
          clips: filteredClips.map(c => 
            c.startTime > clipToRemove!.startTime 
              ? { ...c, startTime: c.startTime - clipToRemove!.duration } 
              : c
          )
        };
      }
      return { ...t, clips: filteredClips };
    });

    return { timeline: { ...state.timeline, tracks }, selectedClipId: null };
  }),

  addAiTag: (clipId, tag) => set((state) => ({
    timeline: {
      ...state.timeline,
      tracks: state.timeline.tracks.map(t => ({
        ...t,
        clips: t.clips.map(c => 
          c.id === clipId && !c.aiTags.includes(tag) 
            ? { ...c, aiTags: [...c.aiTags, tag] } 
            : c
        )
      }))
    }
  })),

  removeAiTag: (clipId, tag) => set((state) => ({
    timeline: {
      ...state.timeline,
      tracks: state.timeline.tracks.map(t => ({
        ...t,
        clips: t.clips.map(c => 
          c.id === clipId ? { ...c, aiTags: c.aiTags.filter(t => t !== tag) } : c
        )
      }))
    }
  })),

  addAnnotation: (clipId, annotation) => set((state) => ({
    timeline: {
      ...state.timeline,
      tracks: state.timeline.tracks.map(t => ({
        ...t,
        clips: t.clips.map(c => 
          c.id === clipId ? { ...c, annotations: [...c.annotations, annotation] } : c
        )
      }))
    }
  })),

  removeAnnotation: (clipId, annotationId) => set((state) => ({
    timeline: {
      ...state.timeline,
      tracks: state.timeline.tracks.map(t => ({
        ...t,
        clips: t.clips.map(c => 
          c.id === clipId ? { ...c, annotations: c.annotations.filter(a => a.id !== annotationId) } : c
        )
      }))
    }
  })),

  splitClip: (clipId, time) => set((state) => {
    const tracks = state.timeline.tracks.map(track => {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip && time > clip.startTime && time < clip.startTime + clip.duration) {
        const splitPoint = time - clip.startTime;
        const clip1 = { ...clip, duration: splitPoint };
        const clip2 = { 
          ...clip, 
          id: crypto.randomUUID(), 
          startTime: time, 
          duration: clip.duration - splitPoint,
          offset: clip.offset + splitPoint
        };
        return {
          ...track,
          clips: [...track.clips.filter(c => c.id !== clipId), clip1, clip2]
        };
      }
      return track;
    });
    return { timeline: { ...state.timeline, tracks } };
  }),
}));
