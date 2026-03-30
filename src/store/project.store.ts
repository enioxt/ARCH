import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Project, ProjectVersion, BriefingAnalysis } from '../schemas/project.schema';
import { logger } from '../telemetry/logger';
import { seedProjects } from './seed';

interface ProjectState {
  project: Project | null;
  projects: Project[];
  initializeProject: () => void;
  switchProject: (id: string) => void;
  updateBriefing: (briefing: string) => void;
  setAnalysis: (analysis: BriefingAnalysis) => void;
  saveNewVersion: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  projects: seedProjects,

  initializeProject: () => {
    // Load the first seed project by default instead of a blank one
    const defaultProject = get().projects[0];
    set({ project: defaultProject });
    logger.log({ eventName: 'project_created', projectId: defaultProject.id });
  },

  switchProject: (id: string) => {
    const selected = get().projects.find(p => p.id === id);
    if (selected) {
      set({ project: selected });
      logger.log({ eventName: 'project_created', projectId: selected.id }); // Reusing event for telemetry
    }
  },

  updateBriefing: (briefing: string) => {
    set((state) => {
      if (!state.project) return state;
      
      const updatedVersions = state.project.versions.map(v => 
        v.id === state.project!.currentVersionId 
          ? { ...v, briefing } 
          : v
      );

      return {
        project: {
          ...state.project,
          versions: updatedVersions
        }
      };
    });
  },

  setAnalysis: (analysis: BriefingAnalysis) => {
    set((state) => {
      if (!state.project) return state;
      
      const updatedVersions = state.project.versions.map(v => 
        v.id === state.project!.currentVersionId 
          ? { ...v, analysis, status: 'analyzing' as const } 
          : v
      );

      return {
        project: {
          ...state.project,
          versions: updatedVersions
        }
      };
    });
  },

  saveNewVersion: () => {
    set((state) => {
      if (!state.project) return state;
      
      const currentVersion = state.project.versions.find(v => v.id === state.project!.currentVersionId);
      if (!currentVersion) return state;

      const newVersionId = uuidv4();
      const newVersion: ProjectVersion = {
        ...currentVersion,
        id: newVersionId,
        createdAt: new Date().toISOString(),
      };

      logger.log({ eventName: 'version_saved', projectId: state.project.id });

      return {
        project: {
          ...state.project,
          currentVersionId: newVersionId,
          versions: [...state.project.versions, newVersion]
        }
      };
    });
  }
}));
