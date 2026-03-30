import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Briefing (Texto)' },
    position: { x: 50, y: 50 },
    style: { background: '#f4f4f5', border: '1px solid #e4e4e7', borderRadius: '8px', padding: '10px' }
  },
  {
    id: '2',
    type: 'input',
    data: { label: 'Croqui (Imagem)' },
    position: { x: 50, y: 150 },
    style: { background: '#f4f4f5', border: '1px solid #e4e4e7', borderRadius: '8px', padding: '10px' }
  },
  {
    id: '3',
    data: { label: 'Interpretação Multimodal (GPT-5.4 / Gemini 3.1)' },
    position: { x: 300, y: 100 },
    style: { background: '#18181b', color: 'white', border: '1px solid #27272a', borderRadius: '8px', padding: '10px' }
  },
  {
    id: '4',
    data: { label: 'Planta 2D Conceitual' },
    position: { x: 600, y: 50 },
    style: { background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '10px' }
  },
  {
    id: '5',
    data: { label: 'Massa 3D' },
    position: { x: 600, y: 150 },
    style: { background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '10px' }
  },
  {
    id: '6',
    data: { label: 'Renders (GPT Image 1.5)' },
    position: { x: 850, y: 100 },
    style: { background: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '10px' }
  },
  {
    id: '7',
    type: 'output',
    data: { label: 'Vídeo (Veo 3.1)' },
    position: { x: 1100, y: 100 },
    style: { background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px' }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
  { id: 'e3-5', source: '3', target: '5', animated: true },
  { id: 'e4-6', source: '4', target: '6', animated: true },
  { id: 'e5-6', source: '5', target: '6', animated: true },
  { id: 'e6-7', source: '6', target: '7', animated: true },
];

export default function WorkflowView() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Workflow & Rationale</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Visualização do pipeline de IA e as decisões tomadas em cada etapa do projeto.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-zinc-200 rounded-xl overflow-hidden min-h-[600px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-right"
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
