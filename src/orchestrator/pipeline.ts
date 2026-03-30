import { logger } from '../telemetry/logger';
import { BriefingAnalysis } from '../schemas/project.schema';

export class OrchestratorPipeline {
  
  /**
   * Step 1: Interpret Briefing (Calls Node.js Backend)
   */
  static async interpretBriefing(briefing: string, projectId?: string): Promise<BriefingAnalysis | null> {
    const startTime = performance.now();
    try {
      const response = await fetch('/api/analyze-briefing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ briefing }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json() as BriefingAnalysis;
      
      const latencyMs = performance.now() - startTime;
      logger.log({
        eventName: 'brief_interpreted',
        projectId,
        modelUsed: 'gemini-3.1-pro-preview',
        provider: 'Google',
        latencyMs,
        estimatedCostUsd: 0.004, // Mocked cost
      });

      if (result.ambiguidades && result.ambiguidades.length > 0) {
        logger.log({
          eventName: 'ambiguity_detected',
          projectId,
          metadata: { count: result.ambiguidades.length }
        });
      }

      return result;
    } catch (error) {
      console.error("Error in OrchestratorPipeline.interpretBriefing:", error);
      return null;
    }
  }

  /**
   * Step 2: Extract Geometry from Sketch (Mocked for now)
   */
  static async extractGeometryFromSketch(files: File[], projectId?: string): Promise<any> {
    const startTime = performance.now();
    // Simulate API call to a Vision model (e.g., GPT-4o or Gemini Pro Vision)
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const latencyMs = performance.now() - startTime;
    logger.log({
      eventName: 'sketch_uploaded',
      projectId,
      modelUsed: 'gpt-4o-vision-mock',
      provider: 'OpenAI',
      latencyMs,
      estimatedCostUsd: 0.012,
    });

    return {
      shape: 'hexagon',
      sectors: 3,
      confidence: 0.92
    };
  }

  /**
   * Step 3: Generate 3D Massing (Mocked)
   */
  static async generate3DMassing(projectId?: string): Promise<any> {
    logger.log({
      eventName: 'concept_generated',
      projectId,
      modelUsed: 'procedural-geometry-engine',
      provider: 'EGOS',
      estimatedCostUsd: 0.001,
    });
    return { volume: 480, height: 4.5 };
  }
}
