'use client';

import { useMemo } from 'react';
import { Habit } from '@/types/habit';
import { eachDayOfInterval, format, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';

interface HabitGraphProps {
  habit: Habit;
  onCellClick?: (date: string, value: number, isCompleted: boolean) => void;
  className?: string;
}

export const HabitGraph = ({ habit, onCellClick, className }: HabitGraphProps) => {
  const graphData = useMemo(() => {
    const today = new Date();
    const endOfGraph = startOfWeek(today, { weekStartsOn: 0 }); // Start week on Sunday
    const startOfGraph = subWeeks(endOfGraph, 51); // 52 weeks total (0-51)
    
    // Create a grid of weeks and days
    const weeks = [];
    for (let week = 0; week < 52; week++) {
      const weekDays = [];
      const weekStart = addWeeks(startOfGraph, week);
      
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + day);
        
        const dateString = format(currentDate, 'yyyy-MM-dd');
        const isWithinRange = currentDate <= today;
        
        let value = 0;
        let isCompleted = false;
        
        if (habit.type === 'checkbox') {
          isCompleted = habit.completedDates.some(completedDate => 
            isSameDay(new Date(completedDate), currentDate)
          );
        } else {
          const entry = habit.entries?.find(entry => entry.date === dateString);
          value = entry?.value || 0;
          isCompleted = value >= (habit.target || 1);
        }
        
        weekDays.push({
          date: currentDate,
          dateString,
          isCompleted,
          value,
          isWithinRange,
        });
      }
      weeks.push(weekDays);
    }
    
    return weeks;
  }, [habit.completedDates, habit.entries, habit.target, habit.type]);

  const getIntensityClass = (isCompleted: boolean, value: number, isWithinRange: boolean) => {
    if (!isWithinRange) return 'bg-gray-100 dark:bg-gray-800';
    
    if (habit.type === 'checkbox') {
      if (isCompleted) return 'bg-green-500 dark:bg-green-400';
      return 'bg-gray-200 dark:bg-gray-700';
    } else {
      // For number habits, calculate intensity based on value relative to target
      const target = habit.target || 1;
      if (value === 0) return 'bg-gray-200 dark:bg-gray-700';
      
      const intensity = Math.min(value / target, 2); // Cap at 2x target for max intensity
      
      if (intensity >= 2) return 'bg-green-600 dark:bg-green-300';
      if (intensity >= 1.5) return 'bg-green-500 dark:bg-green-400';
      if (intensity >= 1) return 'bg-green-400 dark:bg-green-500';
      if (intensity >= 0.5) return 'bg-green-300 dark:bg-green-600';
      return 'bg-green-200 dark:bg-green-700';
    }
  };

  const getTooltipText = (day: any) => {
    const dateStr = format(day.date, 'MMM d, yyyy');
    
    if (habit.type === 'checkbox') {
      return `${dateStr} - ${day.isCompleted ? 'Completed' : 'Not completed'}`;
    } else {
      const unit = habit.unit ? ` ${habit.unit}` : '';
      const target = habit.target || 1;
      const progress = day.value > 0 ? ` (${((day.value / target) * 100).toFixed(0)}% of target)` : '';
      return `${dateStr} - ${day.value}${unit}${progress}`;
    }
  };

  const handleCellClick = (day: any) => {
    if (onCellClick && day.isWithinRange) {
      onCellClick(day.dateString, day.value, day.isCompleted);
    }
  };

  const monthLabels = useMemo(() => {
    if (graphData.length === 0) return [];
    
    const months = [];
    let currentMonth = -1;
    
    graphData.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0].date;
      const month = firstDayOfWeek.getMonth();
      
      if (month !== currentMonth) {
        currentMonth = month;
        months.push({
          name: format(firstDayOfWeek, 'MMM'),
          weekIndex,
          year: firstDayOfWeek.getFullYear(),
        });
      }
    });
    
    return months;
  }, [graphData]);

  return (
    <div className={`p-4 ${className}`}>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-2 text-xs text-gray-600 dark:text-gray-400 relative">
            {monthLabels.map((month, index) => (
              <div
                key={`${month.name}-${month.year}-${index}`}
                className="absolute"
                style={{ left: `${month.weekIndex * 16 + 40}px` }}
              >
                {month.name}
              </div>
            ))}
          </div>
          
          {/* Day labels */}
          <div className="flex">
            <div className="flex flex-col text-xs text-gray-600 dark:text-gray-400 mr-2">
              <div className="h-3"></div>
              <div className="h-3 flex items-center">Mon</div>
              <div className="h-3"></div>
              <div className="h-3 flex items-center">Wed</div>
              <div className="h-3"></div>
              <div className="h-3 flex items-center">Fri</div>
              <div className="h-3"></div>
            </div>
            
            {/* Graph grid */}
            <div className="flex gap-1">
              {graphData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm transition-all ${getIntensityClass(
                        day.isCompleted,
                        day.value,
                        day.isWithinRange
                      )} ${
                        day.isWithinRange && onCellClick 
                          ? 'cursor-pointer hover:ring-2 hover:ring-blue-300 hover:scale-110' 
                          : ''
                      }`}
                      title={getTooltipText(day)}
                      onClick={() => handleCellClick(day)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between mt-4 text-xs text-gray-600 dark:text-gray-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700"></div>
              <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-700"></div>
              <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-600"></div>
              <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-500"></div>
              <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-400"></div>
              <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-300"></div>
            </div>
            <span>More</span>
          </div>
          
          {/* Additional info for number habits */}
          {habit.type === 'number' && (
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Target: {habit.target}{habit.unit ? ` ${habit.unit}` : ''} per day
              {onCellClick && <div className="mt-1">Click on any day to edit</div>}
            </div>
          )}
          
          {/* Click instruction for checkbox habits */}
          {habit.type === 'checkbox' && onCellClick && (
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Click on any day to mark complete/incomplete
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 