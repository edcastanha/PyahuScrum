import { createPipelineRequest, deriveIdeaFromProject } from './pipelineService';

describe('deriveIdeaFromProject', () => {
  it('combines name and description into a single idea string', () => {
    const idea = deriveIdeaFromProject({ name: 'Portfólio', description: 'Um app de portfólio' });

    expect(idea).toBe('Portfólio: Um app de portfólio');
  });
});

describe('createPipelineRequest', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('posts the idea and returns the created pipeline request', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 'abc123', status: 'TRIAGEM_INICIAL' }),
    } as Response);

    const result = await createPipelineRequest('Uma ideia de projeto');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/projects'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: 'Uma ideia de projeto' }),
      })
    );
    expect(result).toEqual({ id: 'abc123', status: 'TRIAGEM_INICIAL' });
  });

  it('throws when the request fails', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    await expect(createPipelineRequest('Uma ideia')).rejects.toThrow('500');
  });
});
