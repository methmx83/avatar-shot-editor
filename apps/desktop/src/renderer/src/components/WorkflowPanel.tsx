import React, { useState } from 'react';
import { useComfyStore, ComfyWorkflow, ComfyNodeInput } from '../store/useComfyStore';
import { Play, Plus, Upload, Database, Settings2, Trash2, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { parseComfyWorkflow } from '../utils/WorkflowParser';

const WorkflowPanel: React.FC = () => {
  const { workflows, addWorkflow, queue, addToQueue, isConnected, serverUrl } = useComfyStore();
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, any>>({});

  const activeWorkflow = workflows.find(w => w.id === activeWorkflowId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const newWorkflow = parseComfyWorkflow(crypto.randomUUID(), file.name.replace('.json', ''), json);
        addWorkflow(newWorkflow);
        setActiveWorkflowId(newWorkflow.id);
        
        // Initialize input values
        const initialValues: Record<string, any> = {};
        newWorkflow.inputs.forEach(input => {
          initialValues[input.name] = input.default;
        });
        setInputValues(initialValues);
      } catch (err) {
        console.error('Failed to parse workflow:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleQueueGeneration = () => {
    if (!activeWorkflow) return;
    
    const newItem = {
      id: crypto.randomUUID(),
      workflowId: activeWorkflow.id,
      status: 'pending' as const,
      progress: 0,
      createdAt: Date.now()
    };
    addToQueue(newItem);
  };

  const renderInput = (input: ComfyNodeInput) => {
    const value = inputValues[input.name];
    const onChange = (val: any) => setInputValues(prev => ({ ...prev, [input.name]: val }));

    switch (input.type) {
      case 'text':
        return (
          <div key={input.name} className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase">{input.name}</label>
            <textarea 
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-[#252525] border border-[#333] rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 min-h-[60px]"
            />
          </div>
        );
      case 'number':
        return (
          <div key={input.name} className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <label className="text-gray-500 uppercase">{input.name}</label>
              <span className="text-blue-400">{value}</span>
            </div>
            <input 
              type="range"
              min={input.min}
              max={input.max}
              step={input.step}
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        );
      case 'select':
        return (
          <div key={input.name} className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase">{input.name}</label>
            <select 
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-[#252525] border border-[#333] rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="">Select...</option>
              {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a]">
      {/* Header */}
      <div className="p-3 border-b border-[#333] flex justify-between items-center bg-[#1e1e1e]">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
          <Database size={14} /> ComfyUI Bridge
        </span>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
           <label className="cursor-pointer p-1 hover:bg-[#333] rounded transition-colors" title="Import Workflow">
              <Plus size={16} />
              <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
           </label>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Workflow List & Inputs */}
        <div className="w-1/2 border-r border-[#333] flex flex-col overflow-y-auto custom-scrollbar">
          {workflows.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
               <Upload size={32} strokeWidth={1} className="mb-2 opacity-20" />
               <p className="text-xs">Import a ComfyUI API JSON to get started</p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-600 tracking-widest">Active Workflow</label>
                  <select 
                    value={activeWorkflowId || ''}
                    onChange={(e) => setActiveWorkflowId(e.target.value)}
                    className="w-full bg-[#252525] border border-[#333] rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
               </div>

               {activeWorkflow && (
                 <div className="space-y-4 pt-4 border-t border-[#333]">
                    <div className="flex justify-between items-center">
                       <h3 className="text-[10px] font-bold uppercase text-gray-600 tracking-widest flex items-center gap-2">
                          <Settings2 size={12} /> Parameters
                       </h3>
                    </div>
                    <div className="space-y-4">
                       {activeWorkflow.inputs.map(renderInput)}
                    </div>
                    <button 
                      onClick={handleQueueGeneration}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-2 mt-4 transition-colors"
                    >
                       <Play size={14} fill="currentColor" /> Queue Generation
                    </button>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Right: Queue & Outputs */}
        <div className="w-1/2 flex flex-col overflow-y-auto custom-scrollbar bg-[#161616]">
          <div className="p-3 border-b border-[#333] flex justify-between items-center sticky top-0 bg-[#161616] z-10">
             <span className="text-[10px] font-bold uppercase text-gray-600 tracking-widest flex items-center gap-2">
                <Clock size={12} /> Render Queue
             </span>
          </div>
          
          <div className="p-2 space-y-2">
             {queue.length === 0 ? (
               <p className="text-[10px] text-gray-600 text-center mt-10 italic">No active tasks</p>
             ) : (
               queue.map(item => (
                 <div key={item.id} className="bg-[#252525] border border-[#333] rounded p-2 space-y-2">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">
                          {workflows.find(w => w.id === item.workflowId)?.name || 'Workflow'}
                       </span>
                       <div className="flex items-center gap-1">
                          {item.status === 'pending' && <Clock size={12} className="text-gray-500" />}
                          {item.status === 'running' && <Loader2 size={12} className="text-blue-500 animate-spin" />}
                          {item.status === 'completed' && <CheckCircle2 size={12} className="text-green-500" />}
                          {item.status === 'failed' && <AlertCircle size={12} className="text-red-500" />}
                          <span className="text-[10px] uppercase font-bold text-gray-500">{item.status}</span>
                       </div>
                    </div>
                    {item.status === 'running' && (
                      <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${item.progress}%` }} />
                      </div>
                    )}
                 </div>
               ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPanel;
