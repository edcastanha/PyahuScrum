import { z } from 'zod';

export const adrFormSchema = z.object({
  title: z
    .string()
    .min(5, 'O título deve ter pelo menos 5 caracteres')
    .max(100, 'O título não pode ter mais de 100 caracteres'),
  status: z.enum(['proposed', 'accepted', 'rejected', 'deprecated', 'superseded']),
  context: z
    .string()
    .min(20, 'O contexto deve ter pelo menos 20 caracteres')
    .max(2000, 'O contexto não pode ter mais de 2000 caracteres'),
  decision: z
    .string()
    .min(20, 'A decisão deve ter pelo menos 20 caracteres')
    .max(2000, 'A decisão não pode ter mais de 2000 caracteres'),
  consequences: z
    .string()
    .min(20, 'As consequências devem ter pelo menos 20 caracteres')
    .max(2000, 'As consequências não podem ter mais de 2000 caracteres'),
  alternatives: z
    .array(z.string().min(5, 'Cada alternativa deve ter pelo menos 5 caracteres'))
    .min(1, 'Adicione pelo menos uma alternativa')
});

export type ADRFormData = z.infer<typeof adrFormSchema>;
