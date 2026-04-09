import React from 'react';
import { UserStory } from '../../entities/UserStory';
import { Card, CardBody, Typography, Chip, Button } from '@material-tailwind/react';
import { Draggable } from 'react-beautiful-dnd';

interface UserStoryCardProps {
  story: UserStory;
  index: number;
  onEdit: (story: UserStory) => void;
}

const priorityColors = {
  low: 'blue',
  medium: 'orange',
  high: 'red',
};

const UserStoryCard: React.FC<UserStoryCardProps> = ({ story, index, onEdit }) => {
  return (
    <Draggable draggableId={story.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-4 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
        >
          <Card 
            className="w-full"
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            placeholder=""
            onResize={undefined}
            onResizeCapture={undefined}
          >
            <CardBody
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              placeholder=""
              onResize={undefined}
              onResizeCapture={undefined}
            >
              <div className="flex justify-between items-start mb-2">
                <Typography 
                  variant="h6" 
                  color="blue-gray" 
                  className="flex-grow"
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  placeholder=""
                  onResize={undefined}
                  onResizeCapture={undefined}
                >
                  {story.title}
                </Typography>
                <div className="flex-shrink-0 flex items-center gap-2">
                    <Chip
                      value={story.priority}
                      color={priorityColors[story.priority] as any}
                      size="sm"
                    />
                    <Button 
                      variant="text" 
                      size="sm" 
                      className="py-1 px-2" 
                      onClick={() => onEdit(story)}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                      placeholder=""
                      onResize={undefined}
                      onResizeCapture={undefined}
                    >
                        Editar
                    </Button>
                </div>
              </div>
              <Typography 
                color="gray" 
                className="font-normal mb-4"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                placeholder=""
                onResize={undefined}
                onResizeCapture={undefined}
              >
                {story.description}
              </Typography>
              <div>
                <Typography 
                  variant="small" 
                  color="blue-gray" 
                  className="font-semibold"
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  placeholder=""
                  onResize={undefined}
                  onResizeCapture={undefined}
                >
                  Critérios de Aceite:
                </Typography>
                <ul className="list-disc list-inside pl-4 mt-1">
                  {story.acceptanceCriteria.map((criterion, i) => (
                    <li key={i} className="text-sm text-gray-600">{criterion}</li>
                  ))}
                </ul>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default UserStoryCard;
