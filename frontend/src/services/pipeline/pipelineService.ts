import { AGENT_ORCHESTRATOR_BASE_URL } from '../../config/api';
import { Project } from '../../entities/Project';

export interface PipelineRequest {
  id: string;
  status: string;
}

export function deriveIdeaFromProject(project: Pick<Project, 'name' | 'description'>): string {
  return `${project.name}: ${project.description}`;
}

/** Cria o projeto na API e retorna {id, status: TRIAGEM_INICIAL}.
 *  O pipeline é assíncrono — o status evolui via Firestore onSnapshot. */
export async function createPipelineRequest(idea: string): Promise<PipelineRequest> {
  const response = await fetch(`${AGENT_ORCHESTRATOR_BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idea }),
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao criar pedido no Agent Orchestrator: HTTP ${response.status} (${await _describeError(response)})`,
    );
  }

  return response.json();
}

/** Envia respostas de uma Rodada de Elicitação (202 Accepted — assíncrono). */
export async function sendRoundAnswers(
  projectId: string,
  rodada: number,
  respostas: Array<{ pergunta_id: string; opcao?: string | null; texto?: string | null }>,
  forcaGeracao = false,
): Promise<void> {
  const response = await fetch(
    `${AGENT_ORCHESTRATOR_BASE_URL}/projects/${projectId}/respostas`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rodada, respostas, forcar_geracao: forcaGeracao }),
    },
  );
  if (!response.ok && response.status !== 202) {
    throw new Error(`Falha ao enviar respostas: HTTP ${response.status}`);
  }
}

/** Remove o projeto e todos os dados associados (delete cascade). */
export async function deleteProjectFromPipeline(projectId: string): Promise<void> {
  const response = await fetch(
    `${AGENT_ORCHESTRATOR_BASE_URL}/projects/${projectId}`,
    { method: 'DELETE' },
  );
  if (!response.ok && response.status !== 204 && response.status !== 404) {
    throw new Error(`Falha ao excluir projeto no backend: HTTP ${response.status}`);
  }
}

async function _describeError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return typeof body?.detail === 'string' ? body.detail : JSON.stringify(body?.detail ?? body);
  } catch {
    return 'sem detalhes';
  }
}
