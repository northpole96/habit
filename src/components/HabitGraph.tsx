'use client';

import { useMemo } from 'react';
import { Habit } from '@/types/habit';
import { eachDayOfInterval, format, startOfYear, endOfYear, startOfWeek, isSameDay } from 'date-fns';

interface HabitGraphProps {
  habit: Habit;
  className?: string;
}

export const HabitGraph = ({ habit, className }: HabitGraphProps) => {
  const graphData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const yearEnd = endOfYear(new Date(currentYear, 0, 1));
    
    // Start from the first day of the week containing January 1st
    const graphStart = startOfWeek(yearStart);
    const totalWeeks = Math.ceil((yearEnd.getTime() - graphStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Create a grid of weeks and days
    const weeks = [];
    for (let week = 0; week < totalWeeks; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(graphStart);
        currentDate.setDate(graphStart.getDate() + week * 7 + day);
        
        const dateString = format(currentDate, 'yyyy-MM-dd');
        const isCurrentYear = currentDate.getFullYear() === currentYear;
        
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
          isCurrentYear,
        });
      }
      weeks.push(weekDays);
    }
    
    return weeks;
  }, [habit.completedDates, habit.entries, habit.target, habit.type]);

  const getIntensityClass = (isCompleted: boolean, value: number, isCurrentYear: boolean) => {
    if (!isCurrentYear) return 'bg-gray-100 dark:bg-gray-800';
    
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

  const monthLabels = useMemo(() => {
    const months = [];
    const currentYear = new Date().getFullYear();
    for (let month = 0; month < 12; month++) {
      const date = new Date(currentYear, month, 1);
      months.push({
        name: format(date, 'MMM'),
        offset: Math.floor((date.getTime() - startOfWeek(startOfYear(date)).getTime()) / (7 * 24 * 60 * 60 * 1000)),
      });
    }
    return months;
  }, []);

  return (
    <div className={`p-4 ${className}`}>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-2 text-xs text-gray-600 dark:text-gray-400">
            {monthLabels.map((month, index) => (
              <div
                key={month.name}
                className="flex-none"
                style={{ marginLeft: index === 0 ? `${month.offset * 12}px` : '24px' }}
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
                      className={`w-3 h-3 rounded-sm transition-colors ${getIntensityClass(
                        day.isCompleted,
                        day.value,
                        day.isCurrentYear
                      )}`}
                      title={getTooltipText(day)}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 