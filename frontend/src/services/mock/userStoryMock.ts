import { UserStory } from '../../entities/UserStory';

export const mockUserStories: UserStory[] = [
  {
    id: 1,
    projectId: '1',
    title: 'Como usuário, quero visualizar o dashboard',
    description: 'O dashboard principal deve exibir métricas chave e atividades recentes.',
    status: 'done',
    priority: 'high',
    acceptanceCriteria: [
      'Deve mostrar o número total de projetos.',
      'Deve listar os 5 projetos mais recentes.',
      'Deve ter um feed de atividades.'
    ],
    createdDate: '2024-01-10',
    updatedDate: '2024-01-15',
  },
  {
    id: 2,
    projectId: '1',
    title: 'Como usuário, quero criar um novo projeto',
    description: 'Permitir que os usuários adicionem novos projetos ao portfólio através de um formulário.',
    status: 'inprogress',
    priority: 'high',
    acceptanceCriteria: [
      'O formulário deve ter campos para nome, descrição e status.',
      'A validação deve ser aplicada aos campos obrigatórios.',
      'O novo projeto deve aparecer na lista após a criação.'
    ],
    createdDate: '2024-01-12',
    updatedDate: '2024-01-18',
  },
  {
    id: 3,
    projectId: '2',
    title: 'Como usuário, quero editar um ADR existente',
    description: 'Permitir a edição de Registros de Decisão de Arquitetura para um projeto.',
    status: 'todo',
    priority: 'medium',
    acceptanceCriteria: [
      'Um botão de edição deve estar visível no card do ADR.',
      'O formulário deve ser pré-preenchido com os dados do ADR.',
      'As alterações devem ser salvas e refletidas na visualização.'
    ],
    createdDate: '2024-01-15',
    updatedDate: '2024-01-15',
  },
  {
    id: 4,
    projectId: '1',
    title: 'Como usuário, quero ver a documentação de um projeto',
    description: 'Uma aba de documentação deve estar disponível na página de detalhes do projeto.',
    status: 'todo',
    priority: 'low',
    acceptanceCriteria: [
      'A aba deve mostrar o conteúdo do README.md.',
      'Deve ser possível editar o README.md.'
    ],
    createdDate: '2024-01-20',
    updatedDate: '2024-01-20',
  },
];
