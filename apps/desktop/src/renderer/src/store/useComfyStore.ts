import { create } from 'zustand';

export interface ComfyNodeInput {
  name: string;
  type: string;
  default: any;
  options?: any[];
  min?: number;
  max?: number;
  step?: number;
}

export interface ComfyWorkflow {
  id: string;
  name: string;
  nodes: Record<string, any>;
  inputs: ComfyNodeInput[];
}

export interface QueueItem {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  outputUrl?: string;
  createdAt: number;
}

interface ComfyState {
  workflows: ComfyWorkflow[];
  queue: QueueItem[];
  isConnected: boolean;
  serverUrl: string;
  
  // Actions
  setServerUrl: (url: string) => void;
  setConnected: (connected: boolean) => void;
  addWorkflow: (workflow: ComfyWorkflow) => void;
  addToQueue: (item: QueueItem) => void;
  updateQueueItem: (id: string, updates: Partial<QueueItem>) => void;
  removeFromQueue: (id: string) => void;
}

export const useComfyStore = create<ComfyState>((set) => ({
  workflows: [],
  queue: [],
  isConnected: false,
  serverUrl: 'http://127.0.0.1:8188',

  setServerUrl: (url) => set({ serverUrl: url }),
  setConnected: (connected) => set({ isConnected: connected }),
  addWorkflow: (workflow) => set((state) => ({ workflows: [...state.workflows, workflow] })),
  addToQueue: (item) => set((state) => ({ queue: [item, ...state.queue] })),
  updateQueueItem: (id, updates) => set((state) => ({
    queue: state.queue.map(item => item.id === id ? { ...item, ...updates } : item)
  })),
  removeFromQueue: (id) => set((state) => ({
    queue: state.queue.filter(item => item.id !== id)
  })),
}));
