/**
 * projectService.test.ts — TDD para E3-T10 (ticket #27)
 *
 * Spec: specs/004-elicitacao-interativa/spec.md (CA-1)
 * - Project.id é string (UUID)
 * - Project não tem status nem progress
 * - saveProject() gera UUID para projetos novos
 * - getProjectById() aceita string
 * - deleteProject() aceita string
 */

import { ProjectService } from './projectService';

// Mock do storageService
const storageMock: Record<string, unknown> = {};
jest.mock('../storage/storageService', () => ({
  storageService: {
    getItem: <T>(key: string): T | null => (storageMock[key] as T) ?? null,
    setItem: (key: string, value: unknown) => { storageMock[key] = value; },
  },
}));

// Mock do mockProjects — sem status/progress
jest.mock('../mock/projectMock', () => ({
  mockProjects: [
    { id: 'uuid-mock-1', name: 'Projeto A', description: 'Desc A' },
    { id: 'uuid-mock-2', name: 'Projeto B', description: 'Desc B' },
  ],
}));

describe('ProjectService — E3-T10', () => {
  let service: ProjectService;

  beforeEach(() => {
    Object.keys(storageMock).forEach(k => delete storageMock[k]);
    service = new ProjectService();
  });

  describe('saveProject — novo projeto', () => {
    it('deve gerar um id string (UUID) para projeto novo', () => {
      const saved = service.saveProject({ id: '', name: 'Novo', description: 'Desc' });
      expect(typeof saved.id).toBe('string');
      expect(saved.id.length).toBeGreaterThan(0);
    });

    it('não deve usar Date.now() como id (deve ser UUID, não número)', () => {
      const saved = service.saveProject({ id: '', name: 'Novo', description: 'Desc' });
      // UUID não é parseable como número inteiro de 13 dígitos
      expect(isNaN(Number(saved.id))).toBe(true);
    });

    it('deve preservar nome e descrição', () => {
      const saved = service.saveProject({ id: '', name: 'Meu Projeto', description: 'Minha ideia' });
      expect(saved.name).toBe('Meu Projeto');
      expect(saved.description).toBe('Minha ideia');
    });

    it('não deve ter campo status nem progress no projeto salvo', () => {
      const saved = service.saveProject({ id: '', name: 'X', description: 'Y' });
      expect(saved).not.toHaveProperty('status');
      expect(saved).not.toHaveProperty('progress');
    });
  });

  describe('saveProject — projeto existente', () => {
    it('deve atualizar projeto existente mantendo o id', () => {
      const first = service.saveProject({ id: '', name: 'Original', description: 'Desc' });
      const updated = service.saveProject({ ...first, name: 'Atualizado' });
      expect(updated.id).toBe(first.id);
      expect(updated.name).toBe('Atualizado');
    });
  });

  describe('getProjectById', () => {
    it('deve retornar projeto pelo id string', () => {
      const saved = service.saveProject({ id: '', name: 'Busca', description: 'Desc' });
      const found = service.getProjectById(saved.id);
      expect(found?.name).toBe('Busca');
    });

    it('deve retornar undefined para id inexistente', () => {
      const found = service.getProjectById('id-que-nao-existe');
      expect(found).toBeUndefined();
    });
  });

  describe('deleteProject', () => {
    it('deve remover projeto pelo id string', () => {
      const saved = service.saveProject({ id: '', name: 'Deletar', description: 'Desc' });
      service.deleteProject(saved.id);
      expect(service.getProjectById(saved.id)).toBeUndefined();
    });
  });

  describe('getProjects', () => {
    it('deve retornar projetos sem status nem progress', () => {
      service.saveProject({ id: '', name: 'P1', description: 'D1' });
      const projects = service.getProjects();
      projects.forEach(p => {
        expect(p).not.toHaveProperty('status');
        expect(p).not.toHaveProperty('progress');
      });
    });
  });
});
