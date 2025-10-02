import React, { useState } from 'react';
import { WorkflowTask, TaskStatusEnum } from '../../types';
import {
  User, Calendar, AlertCircle, CheckCircle, Clock, Square,
  AlertTriangle, ExternalLink, Upload
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { workflowService } from '../../services/api';
import clsx from 'clsx';

interface TaskCardProps {
  task: WorkflowTask;
  onUpdate: (taskId: number | string, updates: Partial<WorkflowTask>) => void;
}

const TaskStatusOptions = [
  TaskStatusEnum.TO_START,
  TaskStatusEnum.IN_PROGRESS,
  TaskStatusEnum.COMPLETED,
  TaskStatusEnum.DELAYED,
  TaskStatusEnum.BLOCKED,
];

const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case TaskStatusEnum.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case TaskStatusEnum.IN_PROGRESS:
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      case TaskStatusEnum.BLOCKED:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case TaskStatusEnum.DELAYED:
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Square className="h-4 w-4 text-gray-400" />;
    }
};

const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Adjust for timezone offset to prevent date from changing
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset*60*1000));
    return adjustedDate.toISOString().split('T')[0];
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate }) => {
  const [isEditingAssignee, setIsEditingAssignee] = useState(false);
  const [assignee, setAssignee] = useState(task.assignee || '');
  const [dueDate, setDueDate] = useState(formatDate(task.due_date));
  
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: TaskStatusEnum) => {
    try {
      await workflowService.updateTask(Number(task.id), { status: newStatus });
      onUpdate(task.id, { status: newStatus });
      toast.success('Stato attività aggiornato');
    } catch (error) {
      toast.error('Errore aggiornamento stato');
    }
  };
  
  const handleAssigneeBlur = async () => {
    setIsEditingAssignee(false);
    if (assignee !== task.assignee) {
      try {
        await workflowService.updateTask(Number(task.id), { assigned_to: assignee });
        onUpdate(task.id, { assignee });
        toast.success('Assegnatario aggiornato');
      } catch (error) {
        toast.error('Errore aggiornamento assegnatario');
        setAssignee(task.assignee || ''); // Revert on error
      }
    }
  };

  const handleDueDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDueDate = e.target.value;
    setDueDate(newDueDate);
    try {
      await workflowService.updateTask(Number(task.id), { due_date: newDueDate });
      onUpdate(task.id, { due_date: newDueDate });
      toast.success('Scadenza aggiornata');
    } catch (error) {
      toast.error('Errore aggiornamento scadenza');
    }
  };

  const daysRemaining = (dueDate?: string): number | null => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const remaining = daysRemaining(task.due_date);
  const isOverdue = remaining !== null && remaining < 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 border dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getTaskStatusIcon(task.status || TaskStatusEnum.TO_START)}
          <div className="flex-1">
            <h6 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h6>
            {task.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>}
          </div>
        </div>
        <div className="relative">
          <select
            value={task.status || TaskStatusEnum.TO_START}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatusEnum)}
            className="input text-xs"
          >
            {TaskStatusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm pt-3 border-t dark:border-gray-700">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          {isEditingAssignee ? (
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              onBlur={handleAssigneeBlur}
              autoFocus
              className="input text-sm"
            />
          ) : (
            <span
              className="text-gray-600 dark:text-gray-400 cursor-pointer"
              onClick={() => setIsEditingAssignee(true)}
            >
              {task.assignee || 'Non assegnato'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={dueDate}
            onChange={handleDueDateChange}
            className={clsx(
              "input text-sm",
              isOverdue ? "text-red-600 dark:text-red-400 border-red-500" : "text-gray-600 dark:text-gray-400"
            )}
          />
        </div>
        <div className="flex items-center gap-2">
          {isOverdue && (
            <span className="text-red-600 dark:text-red-400 text-xs flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Scaduto da {Math.abs(remaining!)} giorni
            </span>
          )}
          {remaining !== null && !isOverdue && (
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              {remaining} giorni rimasti
            </span>
          )}
        </div>
      </div>

      {(task.portal_url || task.documents?.length || 0 > 0) &&
        <div className="pt-3 border-t dark:border-gray-700 space-y-2">
          {task.portal_url && (
            <div className="flex items-center gap-2">
              <a href={task.portal_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                Apri Portale
              </a>
              {task.required_credentials && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400">
                  Richiede: {task.required_credentials}
                </span>
              )}
            </div>
          )}
          {(task.documents?.length || 0 > 0) && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Documenti</span>
              <button className="btn btn-secondary btn-sm">
                <Upload className="h-3 w-3 mr-1" />
                Carica
              </button>
            </div>
          )}
        </div>
      }
    </div>
  );
};

export default TaskCard;
