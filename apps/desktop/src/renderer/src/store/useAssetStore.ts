import { create } from 'zustand';
import { Asset } from '@avatar-shot-editor/shared';

interface AssetState {
  assets: Asset[];
  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
}

export const useAssetStore = create<AssetState>((set) => ({
  assets: [],
  addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
  removeAsset: (id) => set((state) => ({ assets: state.assets.filter(a => a.id !== id) })),
}));
