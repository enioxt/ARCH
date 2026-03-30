import { z } from 'zod';

export const RoomSchema = z.object({
  nome: z.string(),
  descricao: z.string(),
  areaEstimada: z.number().optional(),
});

export const BriefingAnalysisSchema = z.object({
  resumo: z.string(),
  geometria_principal: z.string(),
  ambientes: z.array(RoomSchema),
  pontos_chave: z.array(z.string()),
  ambiguidades: z.array(z.string()),
});

export const ProjectVersionSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  briefing: z.string(),
  analysis: BriefingAnalysisSchema.nullable(),
  status: z.enum(['draft', 'analyzing', 'conceptual', 'technical']),
});

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  currentVersionId: z.string().uuid(),
  versions: z.array(ProjectVersionSchema),
});

export type Room = z.infer<typeof RoomSchema>;
export type BriefingAnalysis = z.infer<typeof BriefingAnalysisSchema>;
export type ProjectVersion = z.infer<typeof ProjectVersionSchema>;
export type Project = z.infer<typeof ProjectSchema>;
