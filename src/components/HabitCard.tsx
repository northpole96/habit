'use client';

import { useState, useEffect } from 'react';
import { Check, Flame, Trash2, Calendar, Target, Hash, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Habit } from '@/types/habit';
import { HabitGraph } from './HabitGraph';

interface HabitCardProps {
  habit: Habit;
  isCompletedToday: boolean;
  currentStreak: number;
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
  todayValue,
  totalCount,
  onToggleCompletion,
  onUpdateEntry,
  onDelete,
}: HabitCardProps) => {
  const [showGraph, setShowGraph] = useState(false);
  const [inputValue, setInputValue] = useState(todayValue.toString());
  
  // Update input value when todayValue changes
  useEffect(() => {
    setInputValue(todayValue.toString());
  }, [todayValue]);
  
  const today = new Date().toISOString().split('T')[0];
  
  const handleToggleCompletion = () => {
    if (habit.type === 'checkbox') {
      onToggleCompletion(habit.id, today);
    }
  };

  const handleNumberSubmit = () => {
    const value = parseFloat(inputValue) || 0;
    onUpdateEntry(habit.id, today, value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNumberSubmit();
    }
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

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">{currentStreak} day streak</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">{totalCount} total</span>
            </div>
          </div>
          <Badge variant={completionRate >= 70 ? 'default' : 'secondary'}>
            {completionRate}% rate
          </Badge>
        </div>

        {/* Today's progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Today</span>
            {habit.type === 'checkbox' ? (
              <Button
                onClick={handleToggleCompletion}
                variant={isCompletedToday ? 'default' : 'outline'}
                size="sm"
                className={`gap-2 ${
                  isCompletedToday 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'hover:bg-green-50 dark:hover:bg-green-950'
                }`}
              >
                <Check className="h-4 w-4" />
                {isCompletedToday ? 'Completed' : 'Mark Done'}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleInputKeyPress}
                  onBlur={handleNumberSubmit}
                  className="w-20 h-8 text-center"
                  placeholder="0"
                />
                <span className="text-sm text-muted-foreground">
                  {habit.unit || 'units'}
                </span>
              </div>
            )}
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

        {/* Graph toggle */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGraph(!showGraph)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Calendar className="h-4 w-4" />
            {showGraph ? 'Hide' : 'Show'} Activity
          </Button>
        </div>

        {/* Activity graph */}
        {showGraph && (
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2">
              {new Date().getFullYear()} Activity
              {habit.type === 'number' && (
                <span className="text-xs text-muted-foreground ml-2">
                  (Darker = higher values)
                </span>
              )}
            </div>
            <HabitGraph habit={habit} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 