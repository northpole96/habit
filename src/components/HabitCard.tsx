'use client';

import { useState } from 'react';
import { Check, Flame, Trash2, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Habit } from '@/types/habit';
import { HabitGraph } from './HabitGraph';

interface HabitCardProps {
  habit: Habit;
  isCompletedToday: boolean;
  currentStreak: number;
  onToggleCompletion: (habitId: string, date: string) => void;
  onDelete: (habitId: string) => void;
}

export const HabitCard = ({
  habit,
  isCompletedToday,
  currentStreak,
  onToggleCompletion,
  onDelete,
}: HabitCardProps) => {
  const [showGraph, setShowGraph] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  
  const handleToggleCompletion = () => {
    onToggleCompletion(habit.id, today);
  };

  const totalCompletions = habit.completedDates.length;
  const completionRate = totalCompletions > 0 
    ? Math.round((totalCompletions / Math.max(1, Math.ceil((new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)))) * 100)
    : 0;

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
            <CardTitle className="text-lg font-semibold truncate">{habit.name}</CardTitle>
            {habit.description && (
              <CardDescription className="mt-1 text-sm">
                {habit.description}
              </CardDescription>
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
              <span className="text-sm text-muted-foreground">{totalCompletions} total</span>
            </div>
          </div>
          <Badge variant={completionRate >= 70 ? 'default' : 'secondary'}>
            {completionRate}% rate
          </Badge>
        </div>

        {/* Today's completion */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Today</span>
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
            </div>
            <HabitGraph habit={habit} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 