import { Project } from '../../entities/Project';

export const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Desenvolvimento do Portfólio Interativo',
    description: 'Criar um portfólio interativo com React e TypeScript para exibir projetos e habilidades.',
    status: 'active',
    progress: 45,
  },
  {
    id: 2,
    name: 'API de Gerenciamento de Tarefas',
    description: 'Desenvolver uma API RESTful para gerenciar tarefas, usuários e projetos.',
    status: 'active',
    progress: 75,
  },
  {
    id: 3,
    name: 'Aplicativo Mobile de E-commerce',
    description: 'Criar um aplicativo de e-commerce multiplataforma com React Native.',
    status: 'completed',
    progress: 100,
  },
    {
    id: 4,
    name: 'Blog Pessoal com Next.js',
    description: 'Desenvolver um blog pessoal usando Next.js para renderização do lado do servidor.',
    status: 'inactive',
    progress: 10,
  },
];
