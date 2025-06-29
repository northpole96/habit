'use client';

import { useState } from 'react';
import { Check, Flame, Trash2, Target, Hash, CheckSquare, TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Habit } from '@/types/habit';
import { HabitGraph } from './HabitGraph';
import { EditHabitEntryDialog } from './EditHabitEntryDialog';

interface HabitCardProps {
  habit: Habit;
  isCompletedToday: boolean;
  currentStreak: number;
  longestStreak: number;
  average: number;
  total: number;
  standardDeviation: number;
  todayValue: number;
  totalCount: number;
  onToggleCompletion: (habitId: string, date: string) => void;
  onUpdateEntry: (habitId: string, date: string, value: number) => void;
  onDelete: (habitId: string) => void;
}

export const HabitCard = ({
  habit,
  isCompletedToday,
  currentStreak,
  longestStreak,
  average,
  total,
  standardDeviation,
  todayValue,
  totalCount,
  onToggleCompletion,
  onUpdateEntry,
  onDelete,
}: HabitCardProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedValue, setSelectedValue] = useState(0);
  const [selectedIsCompleted, setSelectedIsCompleted] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  
  const handleCellClick = (date: string, value: number, isCompleted: boolean) => {
    setSelectedDate(date);
    setSelectedValue(value);
    setSelectedIsCompleted(isCompleted);
    setEditDialogOpen(true);
  };

  const handleTodayClick = () => {
    handleCellClick(today, todayValue, isCompletedToday);
  };

  const handleDialogSave = (date: string, value: number) => {
    onUpdateEntry(habit.id, date, value);
  };

  const handleDialogToggle = (date: string) => {
    onToggleCompletion(habit.id, date);
  };

  const completionRate = totalCount > 0 
    ? Math.round((totalCount / Math.max(1, Math.ceil((new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)))) * 100)
    : 0;

  const getProgressPercentage = () => {
    if (habit.type === 'number' && habit.target) {
      return Math.min((todayValue / habit.target) * 100, 100);
    }
    return isCompletedToday ? 100 : 0;
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Color indicator */}
      <div 
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: habit.color }}
      />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold truncate">{habit.name}</CardTitle>
              {habit.type === 'checkbox' ? (
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Hash className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {habit.description && (
              <CardDescription className="mt-1 text-sm">
                {habit.description}
              </CardDescription>
            )}
            {habit.type === 'number' && (
              <div className="text-xs text-muted-foreground mt-1">
                Target: {habit.target}{habit.unit ? ` ${habit.unit}` : ''} per day
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(habit.id)}
            className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Today's progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Today</span>
            <Button
              onClick={handleTodayClick}
              variant={isCompletedToday || todayValue > 0 ? 'default' : 'outline'}
              size="sm"
              className={`gap-2 ${
                habit.type === 'checkbox' && isCompletedToday
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : habit.type === 'number' && todayValue > 0
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : ''
              }`}
            >
              <Calendar className="h-4 w-4" />
              {habit.type === 'checkbox' 
                ? (isCompletedToday ? 'Completed' : 'Mark Done')
                : `${todayValue} ${habit.unit || 'units'}`
              }
            </Button>
          </div>
          
          {/* Progress bar for number habits */}
          {habit.type === 'number' && habit.target && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{todayValue}{habit.unit ? ` ${habit.unit}` : ''}</span>
                <span>Target: {habit.target}{habit.unit ? ` ${habit.unit}` : ''}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isCompletedToday ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <div className="text-xs text-center text-muted-foreground">
                {getProgressPercentage().toFixed(0)}% of target
              </div>
            </div>
          )}
        </div>

        {/* Activity graph - always shown */}
        <div className="space-y-3">
          <div className="text-sm font-medium">
            {new Date().getFullYear()} Activity
            {habit.type === 'number' && (
              <span className="text-xs text-muted-foreground ml-2">
                (Darker = higher values)
              </span>
            )}
          </div>
          <HabitGraph habit={habit} onCellClick={handleCellClick} />
        </div>

        {/* Insights section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Insights</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Longest streak:</span>
                <span className="font-medium">{longestStreak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current streak:</span>
                <span className="font-medium">{currentStreak} days</span>
              </div>
              {habit.type === 'number' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number of entries:</span>
                  <span className="font-medium">{totalCount}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {habit.type === 'number' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average:</span>
                    <span className="font-medium">
                      {average.toFixed(2)} {habit.unit || ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard deviation:</span>
                    <span className="font-medium">
                      {standardDeviation.toFixed(2)} {habit.unit || ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">
                      {total.toFixed(2)} {habit.unit || ''}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average:</span>
                  <span className="font-medium">{(average * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick stats badges */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">{currentStreak} day streak</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">{totalCount} total</span>
          </div>
          <Badge variant={completionRate >= 70 ? 'default' : 'secondary'}>
            {completionRate}% rate
          </Badge>
        </div>
      </CardContent>

      {/* Edit Entry Dialog */}
      <EditHabitEntryDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        habit={habit}
        date={selectedDate}
        currentValue={selectedValue}
        isCompleted={selectedIsCompleted}
        onSave={handleDialogSave}
        onToggleCompletion={handleDialogToggle}
      />
    </Card>
  );
}; 