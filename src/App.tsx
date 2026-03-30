import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Map, 
  Box, 
  Camera, 
  Video, 
  Activity, 
  Settings,
  FileText,
  UploadCloud,
  Wand2,
  TreePine,
  DollarSign,
  History,
  Download,
  GitMerge
} from 'lucide-react';
import { cn } from './lib/utils';
import BriefingView from './components/views/BriefingView';
import CroquiView from './components/views/CroquiView';
import PlantaView from './components/views/PlantaView';
import Massa3DView from './components/views/Massa3DView';
import RendersView from './components/views/RendersView';
import VideoView from './components/views/VideoView';
import ObservabilidadeView from './components/views/ObservabilidadeView';
import WorkflowView from './components/views/WorkflowView';
import ExportView from './components/views/ExportView';
import { useProjectStore } from './store/project.store';

type ViewType = 'briefing' | 'croqui' | 'planta' | 'massa3d' | 'renders' | 'video' | 'workflow' | 'observabilidade' | 'export';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('briefing');
  const { project, projects, initializeProject, switchProject } = useProjectStore();

  useEffect(() => {
    if (!project) {
      initializeProject();
    }
  }, [project, initializeProject]);

  const navItems = [
    { id: 'briefing', label: 'Briefing', icon: FileText },
    { id: 'croqui', label: 'Croqui & Terreno', icon: UploadCloud },
    { id: 'workflow', label: 'Workflow & Rationale', icon: GitMerge },
    { id: 'planta', label: 'Planta 2D', icon: Map },
    { id: 'massa3d', label: 'Massa 3D', icon: Box },
    { id: 'renders', label: 'Renders', icon: Camera },
    { id: 'video', label: 'Vídeo', icon: Video },
    { id: 'observabilidade', label: 'Telemetria EGOS', icon: Activity },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f5f5f5] text-zinc-900 font-sans">
      {/* Development Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 text-center py-1.5 text-xs font-semibold tracking-wide shadow-sm">
        EM DESENVOLVIMENTO &mdash; EGOS Arch v0.1.0-alpha &mdash; github.com/enioxt/ARCH
      </div>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col h-full shadow-sm z-10 pt-8">
        <div className="p-6 border-b border-zinc-100">
          <div className="flex items-center gap-2 text-zinc-900 font-semibold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-md bg-zinc-900 flex items-center justify-center text-white">
              <Box size={18} />
            </div>
            EGOS Arch
          </div>
          <div className="mt-1 text-xs text-zinc-500 font-mono">v0.1.0-alpha</div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-3">
            Projeto {project?.name}
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewType)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                currentView === item.id 
                  ? "bg-zinc-100 text-zinc-900" 
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <item.icon size={18} className={currentView === item.id ? "text-zinc-900" : "text-zinc-400"} />
              {item.label}
            </button>
          ))}

          <div className="mt-8 mb-2 px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Sistema
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
            <History size={18} className="text-zinc-400" />
            Versões
          </button>
          <button 
            onClick={() => setCurrentView('export')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              currentView === 'export'
                ? "bg-zinc-100 text-zinc-900" 
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <Download size={18} className={currentView === 'export' ? "text-zinc-900" : "text-zinc-400"} />
            Exportações
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
            <Settings size={18} className="text-zinc-400" />
            Configurações
          </button>
        </div>

        <div className="p-4 border-t border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-medium text-xs">
              ER
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-900">Enio Rocha</span>
              <span className="text-xs text-zinc-500">Pro Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f5f5f5] pt-8">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center px-8 justify-between shrink-0">
          <h1 className="text-xl font-semibold text-zinc-800 tracking-tight">
            {currentView === 'export' ? 'Exportações' : navItems.find(i => i.id === currentView)?.label}
          </h1>
          <div className="flex items-center gap-4">
            <select 
              className="text-xs font-mono text-zinc-700 bg-zinc-100 px-3 py-2 rounded border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer max-w-xs truncate"
              value={project?.id || ''}
              onChange={(e) => switchProject(e.target.value)}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button className="bg-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2">
              <Wand2 size={16} />
              Gerar Próxima Etapa
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            {currentView === 'briefing' && <BriefingView />}
            {currentView === 'croqui' && <CroquiView />}
            {currentView === 'workflow' && <WorkflowView />}
            {currentView === 'planta' && <PlantaView />}
            {currentView === 'massa3d' && <Massa3DView />}
            {currentView === 'renders' && <RendersView />}
            {currentView === 'video' && <VideoView />}
            {currentView === 'observabilidade' && <ObservabilidadeView />}
            {currentView === 'export' && <ExportView />}
          </div>
        </div>
      </main>
    </div>
  );
}
