import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Folder, Plus } from 'lucide-react';
import { useAssetStore } from '../store/useAssetStore'; // Assuming you'll create this store

const AssetPanel: React.FC = () => {
  const { addAsset } = useAssetStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const newAsset = {
        id: crypto.randomUUID(),
        name: file.name,
        path: file.path, // This works in Electron
        type: file.type.startsWith('video') ? 'video' : file.type.startsWith('image') ? 'image' : 'audio',
      };
      addAsset(newAsset);
    });
  }, [addAsset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

  return (
    <aside className="w-64 border-r border-[#333] flex flex-col bg-[#1a1a1a]" {...getRootProps()}>
      <input {...getInputProps()} />
      <div className="p-3 border-b border-[#333] flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Assets</span>
        <button className="p-1 hover:bg-[#333] rounded-md"><Plus size={16} /></button>
      </div>
      <div className={`flex-1 p-4 flex flex-col items-center justify-center text-gray-500 text-center transition-colors ${isDragActive ? 'bg-blue-500/10' : ''}`}>
        <Folder size={48} strokeWidth={1} className="mb-2 opacity-20" />
        <p className="text-sm">Drag and drop files here</p>
      </div>
    </aside>
  );
};

export default AssetPanel;
