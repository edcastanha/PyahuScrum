import React, { useEffect } from 'react';
import { UserStory } from '../../entities/UserStory';
import { Project } from '../../entities/Project';
import { userStorySchema, UserStoryFormData } from './userStorySchema';
import { useForm, Controller, useFieldArray, FieldValues, FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Textarea, Select, Option } from '@material-tailwind/react';
import { XCircle, PlusCircle } from 'lucide-react';

interface UserStoryFormProps {
  story?: UserStory;
  projects: Project[];
  onSave: (data: UserStory) => void;
  onCancel: () => void;
}

// Interface customizada para contornar problema de tipagem do useFieldArray
interface FormData {
  title: string;
  projectId: string;
  description: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  acceptanceCriteria: string[];
}

const UserStoryForm: React.FC<UserStoryFormProps> = ({ story, projects, onSave, onCancel }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(userStorySchema),
    defaultValues: {
      title: story?.title || '',
      projectId: story?.projectId || '',
      description: story?.description || '',
      status: story?.status || 'todo',
      priority: story?.priority || 'medium',
      acceptanceCriteria: story?.acceptanceCriteria && story.acceptanceCriteria.length > 0 ? story.acceptanceCriteria : [''],
    },
  });

  // Corrige o tipo do useFieldArray usando any completo para resolver incompatibilidade
  const { fields, append, remove } = (useFieldArray as any)({
    control,
    name: 'acceptanceCriteria',
  });

  useEffect(() => {
    reset({
      title: story?.title || '',
      projectId: story?.projectId || '',
      description: story?.description || '',
      status: story?.status || 'todo',
      priority: story?.priority || 'medium',
      acceptanceCriteria: story?.acceptanceCriteria && story.acceptanceCriteria.length > 0 ? story.acceptanceCriteria : [''],
    });
  }, [story, reset]);

  const onSubmit = (data: FormData) => {
    const storyData: UserStory = {
      ...data,
      id: story?.id || 0,
      createdDate: story?.createdDate || new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      acceptanceCriteria: data.acceptanceCriteria.filter(c => c && c.trim() !== ''),
    };
    onSave(storyData);
    reset();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{story ? 'Editar História' : 'Nova História'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Input 
                  {...field} 
                  label="Título" 
                  error={!!errors.title} 
                  crossOrigin={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  onResize={undefined}
                  onResizeCapture={undefined}
                />
              )} 
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Controller
              name="projectId"
              control={control}
              render={({ field }) => (
                <Select 
                  {...field} 
                  label="Projeto" 
                  error={!!errors.projectId}
                  placeholder=""
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  onResize={undefined}
                  onResizeCapture={undefined}
                >
                  {projects.map(p => (
                    <Option key={p.id} value={p.id.toString()}>{p.name}</Option>
                  ))}
                </Select>
              )}
            />
            {errors.projectId && <p className="text-red-500 text-sm mt-1">{errors.projectId.message}</p>}
          </div>

          <div>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea 
                  {...field} 
                  label="Descrição" 
                  error={!!errors.description}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  onResize={undefined}
                  onResizeCapture={undefined}
                />
              )} 
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select 
                    {...field} 
                    label="Status" 
                    error={!!errors.status}
                    placeholder=""
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                    onResize={undefined}
                    onResizeCapture={undefined}
                  >
                    <Option value="todo">A Fazer</Option>
                    <Option value="inprogress">Em Progresso</Option>
                    <Option value="done">Concluído</Option>
                  </Select>
                )}
              />
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
            </div>
            <div>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select 
                    {...field} 
                    label="Prioridade" 
                    error={!!errors.priority}
                    placeholder=""
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                    onResize={undefined}
                    onResizeCapture={undefined}
                  >
                    <Option value="low">Baixa</Option>
                    <Option value="medium">Média</Option>
                    <Option value="high">Alta</Option>
                  </Select>
                )}
              />
              {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Critérios de Aceite</label>
            {fields.map((item: any, index: number) => (
              <div key={item.id} className="flex items-center gap-2 mb-2">
                <Controller
                    name={`acceptanceCriteria.${index}` as const}
                    control={control}
                    render={({ field }) => (
                        <Input
                        {...field}
                        label={`Critério ${index + 1}`}
                        error={!!errors.acceptanceCriteria?.[index]}
                        crossOrigin={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                        onResize={undefined}
                        onResizeCapture={undefined}
                        />
                    )}
                />
                <Button
                  type="button"
                  color="red"
                  variant='text'
                  onClick={() => remove(index)}
                  className="p-2"
                  disabled={fields.length <= 1}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  placeholder=""
                  onResize={undefined}
                  onResizeCapture={undefined}
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            ))}
            {errors.acceptanceCriteria && <p className="text-red-500 text-sm">{errors.acceptanceCriteria.message}</p>}
            <Button
              type="button"
              onClick={() => append('')}
              variant='text'
              className="mt-2 flex items-center gap-2"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              placeholder=""
              onResize={undefined}
              onResizeCapture={undefined}
            >
              <PlusCircle className="h-5 w-5" />
              Adicionar Critério
            </Button>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button 
              variant="text" 
              color="gray" 
              onClick={onCancel}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              placeholder=""
              onResize={undefined}
              onResizeCapture={undefined}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              placeholder=""
              onResize={undefined}
              onResizeCapture={undefined}
            >
              {story ? 'Salvar Alterações' : 'Criar História'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserStoryForm;
