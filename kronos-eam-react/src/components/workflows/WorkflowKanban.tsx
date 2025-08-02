import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, User, AlertCircle, CheckCircle, MoreVertical, FileText, MessageSquare } from 'lucide-react';
import { Task } from '../../types';
import clsx from 'clsx';

interface KanbanColumn {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  icon: React.ElementType;
}

interface WorkflowKanbanProps {
  tasks: Task[];
  onTaskUpdate: (taskId: number, status: Task['status']) => void;
  onTaskClick: (task: Task) => void;
}

const WorkflowKanban: React.FC<WorkflowKanbanProps> = ({ tasks, onTaskUpdate, onTaskClick }) => {
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: 'To Do',
      title: 'To Do',
      tasks: tasks.filter(t => t.status === 'To Do'),
      color: 'bg-gray-100 dark:bg-gray-700',
      icon: Clock
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      tasks: tasks.filter(t => t.status === 'In Progress'),
      color: 'bg-blue-100 dark:bg-blue-900',
      icon: User
    },
    {
      id: 'Delayed',
      title: 'Delayed',
      tasks: tasks.filter(t => t.status === 'Delayed'),
      color: 'bg-red-100 dark:bg-red-900',
      icon: AlertCircle
    },
    {
      id: 'Completed',
      title: 'Completed',
      tasks: tasks.filter(t => t.status === 'Completed'),
      color: 'bg-green-100 dark:bg-green-900',
      icon: CheckCircle
    }
  ]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId as Task['status'];
    
    // Update columns
    const newColumns = [...columns];
    const sourceCol = newColumns.find(col => col.id === source.droppableId);
    const destCol = newColumns.find(col => col.id === destination.droppableId);
    
    if (sourceCol && destCol) {
      const task = sourceCol.tasks.find(t => t.id === taskId);
      if (task) {
        sourceCol.tasks = sourceCol.tasks.filter(t => t.id !== taskId);
        destCol.tasks.splice(destination.index, 0, { ...task, status: newStatus });
        setColumns(newColumns);
        onTaskUpdate(taskId, newStatus);
      }
    }
  };

  const getPriorityColor = (priority?: Task['priority']) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <div key={column.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{column.title}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">({column.tasks.length})</span>
                </div>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={clsx(
                      'space-y-2 min-h-[200px] rounded-lg p-2 transition-colors',
                      snapshot.isDraggingOver ? 'bg-gray-200 dark:bg-gray-700' : ''
                    )}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onTaskClick(task)}
                            className={clsx(
                              'kanban-card bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm',
                              snapshot.isDragging ? 'shadow-lg opacity-90' : ''
                            )}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 flex-1">
                                {task.title}
                              </h4>
                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>

                            <div className="space-y-2">
                              {task.priority && (
                                <span className={clsx(
                                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                  getPriorityColor(task.priority)
                                )}>
                                  {task.priority}
                                </span>
                              )}

                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{task.assignee}</span>
                                </div>
                                {task.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span className={clsx(
                                      getDaysUntilDue(task.dueDate) <= 3 ? 'text-red-600 dark:text-red-400' : ''
                                    )}>
                                      {getDaysUntilDue(task.dueDate)}g
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                {task.documents.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    <span>{task.documents.length}</span>
                                  </div>
                                )}
                                {task.comments.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    <span>{task.comments.length}</span>
                                  </div>
                                )}
                              </div>

                              {task.estimatedHours && (
                                <div className="mt-2">
                                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                    <div
                                      className="bg-blue-600 h-1.5 rounded-full"
                                      style={{
                                        width: `${Math.min(100, ((task.actualHours || 0) / task.estimatedHours) * 100)}%`
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {task.actualHours || 0}/{task.estimatedHours}h
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default WorkflowKanban;