'use client';

import { useState, useEffect } from 'react';
import { Calendar, Check, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Habit } from '@/types/habit';
import { format, isValid } from 'date-fns';

interface EditHabitEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit;
  date: string;
  currentValue: number;
  isCompleted: boolean;
  onSave: (date: string, value: number) => void;
  onToggleCompletion: (date: string) => void;
}

export const EditHabitEntryDialog = ({
  open,
  onOpenChange,
  habit,
  date,
  currentValue,
  isCompleted,
  onSave,
  onToggleCompletion,
}: EditHabitEntryDialogProps) => {
  const [value, setValue] = useState(currentValue.toString());

  useEffect(() => {
    setValue(currentValue.toString());
  }, [currentValue, open]);

  const handleSave = () => {
    if (habit.type === 'checkbox') {
      onToggleCompletion(date);
    } else {
      const numValue = parseFloat(value) || 0;
      onSave(date, numValue);
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (habit.type === 'checkbox') {
      onToggleCompletion(date);
    } else {
      onSave(date, 0);
    }
    onOpenChange(false);
  };

  // Validate date before using it
  const dateObj = new Date(date);
  const isValidDate = date && isValid(dateObj);
  const isToday = isValidDate && date === new Date().toISOString().split('T')[0];
  const formattedDate = isValidDate ? format(dateObj, 'EEEE, MMMM d, yyyy') : 'Invalid Date';
  
  const getProgressPercentage = () => {
    if (habit.type === 'number' && habit.target) {
      const numValue = parseFloat(value) || 0;
      return Math.min((numValue / habit.target) * 100, 100);
    }
    return isCompleted ? 100 : 0;
  };

  // Don't render dialog if date is invalid
  if (!isValidDate) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Edit {habit.name}
          </DialogTitle>
          <DialogDescription>
            {isToday ? 'Today' : formattedDate}
            {isToday && <Badge variant="outline" className="ml-2">Today</Badge>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: habit.color }}
            />
            <span className="font-medium">{habit.name}</span>
            {habit.type === 'checkbox' ? (
              <Check className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Hash className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {habit.type === 'checkbox' ? (
            <div className="space-y-3">
              <div className="text-center">
                <Button
                  onClick={() => onToggleCompletion(date)}
                  variant={isCompleted ? 'default' : 'outline'}
                  size="lg"
                  className={`w-full gap-2 ${
                    isCompleted 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'hover:bg-green-50 dark:hover:bg-green-950'
                  }`}
                >
                  <Check className="h-4 w-4" />
                  {isCompleted ? 'Completed' : 'Mark as Complete'}
                </Button>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Status: {isCompleted ? 'Completed' : 'Not completed'}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="value">
                  Value {habit.unit ? `(${habit.unit})` : ''}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="value"
                    type="number"
                    step="0.1"
                    min="0"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0"
                    className="flex-1"
                  />
                  {habit.unit && (
                    <div className="flex items-center px-3 bg-muted rounded-md text-sm text-muted-foreground">
                      {habit.unit}
                    </div>
                  )}
                </div>
              </div>

              {habit.target && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>Target: {habit.target} {habit.unit || ''}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        getProgressPercentage() >= 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(getProgressPercentage(), 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    {getProgressPercentage().toFixed(0)}% of target
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-muted-foreground">
                Current: {currentValue} {habit.unit || 'units'}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {(isCompleted || currentValue > 0) && (
            <Button variant="outline" onClick={handleDelete}>
              {habit.type === 'checkbox' ? 'Mark Incomplete' : 'Remove Entry'}
            </Button>
          )}
          <Button onClick={handleSave}>
            {habit.type === 'checkbox' 
              ? (isCompleted ? 'Mark Incomplete' : 'Mark Complete')
              : 'Save'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 