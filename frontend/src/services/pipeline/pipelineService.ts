import { AGENT_ORCHESTRATOR_BASE_URL } from '../../config/api';
import { Project } from '../../entities/Project';

export interface PipelineRequest {
  id: string;
  status: string;
}

export function deriveIdeaFromProject(project: Pick<Project, 'name' | 'description'>): string {
  return `${project.name}: ${project.description}`;
}

export async function createPipelineRequest(idea: string): Promise<PipelineRequest> {
  const response = await fetch(`${AGENT_ORCHESTRATOR_BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idea }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao criar pedido no Agent Orchestrator: HTTP ${response.status} (${await _describeError(response)})`);
  }

  return response.json();
}

async function _describeError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return typeof body?.detail === 'string' ? body.detail : JSON.stringify(body?.detail ?? body);
  } catch {
    return 'sem detalhes';
  }
}
