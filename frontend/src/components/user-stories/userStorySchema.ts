import { z } from 'zod';

export const userStorySchema = z.object({
  title: z.string().min(3, { message: 'O título deve ter pelo menos 3 caracteres.' }),
  projectId: z.string().nonempty({ message: 'É necessário associar a um projeto.' }),
  description: z.string().min(10, { message: 'A descrição deve ter pelo menos 10 caracteres.' }),
  status: z.enum(['todo', 'inprogress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  acceptanceCriteria: z.array(z.string().min(5, { message: 'Cada critério deve ter pelo menos 5 caracteres.' })).min(1, { message: 'Pelo menos um critério de aceite é necessário.' }),
});

export type UserStoryFormData = z.infer<typeof userStorySchema>;
