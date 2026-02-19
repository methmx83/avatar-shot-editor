import { ComfyNodeInput, ComfyWorkflow } from '../store/useComfyStore';

/**
 * Analyzes ComfyUI API JSON and extracts relevant input fields for UI generation.
 * Looks for common input nodes like CheckpointLoader, CLIPTextEncode, KSampler, etc.
 */
export const parseComfyWorkflow = (id: string, name: string, apiJson: any): ComfyWorkflow => {
  const inputs: ComfyNodeInput[] = [];

  // Iterate through nodes in the API JSON
  for (const nodeId in apiJson) {
    const node = apiJson[nodeId];
    const nodeType = node.class_type;

    // Handle common input types
    if (nodeType === 'CLIPTextEncode' || nodeType === 'CLIPTextEncodeSDXL') {
      inputs.push({
        name: `Prompt (${nodeId})`,
        type: 'text',
        default: node.inputs.text || '',
      });
    } else if (nodeType === 'KSampler' || nodeType === 'KSamplerAdvanced') {
      inputs.push({
        name: `Steps (${nodeId})`,
        type: 'number',
        default: node.inputs.steps || 20,
        min: 1,
        max: 100,
        step: 1
      });
      inputs.push({
        name: `CFG (${nodeId})`,
        type: 'number',
        default: node.inputs.cfg || 7.0,
        min: 1.0,
        max: 20.0,
        step: 0.1
      });
      inputs.push({
        name: `Seed (${nodeId})`,
        type: 'number',
        default: node.inputs.seed || 0,
        min: 0,
        max: 999999999999999,
        step: 1
      });
    } else if (nodeType === 'CheckpointLoaderSimple') {
      inputs.push({
        name: `Checkpoint (${nodeId})`,
        type: 'select',
        default: node.inputs.ckpt_name || '',
        options: [] // To be filled from ComfyUI API call
      });
    } else if (nodeType === 'EmptyLatentImage') {
      inputs.push({
        name: `Width (${nodeId})`,
        type: 'number',
        default: node.inputs.width || 512,
        min: 64,
        max: 2048,
        step: 64
      });
      inputs.push({
        name: `Height (${nodeId})`,
        type: 'number',
        default: node.inputs.height || 512,
        min: 64,
        max: 2048,
        step: 64
      });
    }
  }

  return {
    id,
    name,
    nodes: apiJson,
    inputs
  };
};
