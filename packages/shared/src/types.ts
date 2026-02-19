export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'unknown';
  path: string;
}

export interface TimelineClip {
  id: string;
  assetId: string;
  trackId: string;
  startTime: number; // In seconds
  duration: number; // In seconds
  offset: number; // Offset within the source asset in seconds
  sourcePath: string;
  name: string;
  color?: string;
  type: 'video' | 'audio' | 'image';
  // Transformation properties
  scale: number;
  position: { x: number; y: number };
  opacity: number;
  rotation: number;
  blur?: number;
  blendMode?: string;
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio';
  clips: TimelineClip[];
  isMuted: boolean;
  isLocked: boolean;
}

export interface Timeline {
  tracks: TimelineTrack[];
  currentTime: number;
  zoom: number;
  duration: number;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  config: Record<string, unknown>;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  createdAt: string;
}

export interface Project {
  schemaVersion: number;
  id: string;
  name: string;
  assets: Asset[];
  timeline: Timeline;
  workflowDefinitions: WorkflowDefinition[];
  workflowRuns: WorkflowRun[];
}
