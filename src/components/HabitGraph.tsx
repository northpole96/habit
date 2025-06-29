'use client';

import { useMemo } from 'react';
import { Habit } from '@/types/habit';
import { eachDayOfInterval, format, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';

interface HabitGraphProps {
  habit: Habit;
  onCellClick?: (date: string, value: number, isCompleted: boolean) => void;
  className?: string;
  cellSize?: number; // Cell size in pixels
}

export const HabitGraph = ({ habit, onCellClick, className, cellSize = 24 }: HabitGraphProps) => {
  const graphData = useMemo(() => {
    const today = new Date();
    
    // Calculate exactly 364 days ago from today
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 363); // 364 days total (today + 363 previous days)
    
    // Create all 364 days first
    const allDays = [];
    for (let i = 0; i < 364; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
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
      
      allDays.push({
        date: currentDate,
        dateString,
        isCompleted,
        value,
        isWithinRange,
        dayOfWeek: currentDate.getDay(), // 0 = Sunday, 6 = Saturday
      });
    }
    
    // Arrange in grid: 52 weeks (columns) × 7 days (rows)
    // Today should be in bottom-right, so we need to align the grid properly
    const weeks = [];
    
    // Find what day of week today is to determine the alignment
    const todayDayOfWeek = today.getDay();  // 0 = Sunday, 6 = Saturday
    
    // Calculate how many empty cells we need at the beginning to align today at bottom-right
    const totalCells = 52 * 7; // 364 cells
    const emptyCellsAtStart = totalCells - 364;
    
    // Create the grid week by week
    for (let week = 0; week < 52; week++) {
      const weekDays = [];
      
      for (let day = 0; day < 7; day++) {
        const cellIndex = week * 7 + day;
        const dayIndex = cellIndex - emptyCellsAtStart;
        
        if (dayIndex >= 0 && dayIndex < 364) {
          weekDays.push(allDays[dayIndex]);
        } else {
          // Empty cell for alignment
          weekDays.push(null);
        }
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
    
    const months: Array<{ name: string; weekIndex: number; year: number }> = [];
    let currentMonth = -1;
    let currentMonthStartWeek = 0;
    
    graphData.forEach((week, weekIndex) => {
      const firstValidDay = week.find(day => day !== null);
      if (!firstValidDay) return;
      
      const month = firstValidDay.date.getMonth();
      
      if (month !== currentMonth) {
        // If we have a previous month, update its weekIndex to the end of that month
        if (months.length > 0) {
          months[months.length - 1].weekIndex = weekIndex - 1;
        }
        
        currentMonth = month;
        currentMonthStartWeek = weekIndex;
        months.push({
          name: format(firstValidDay.date, 'MMM'),
          weekIndex: weekIndex, // Will be updated to end week when next month starts
          year: firstValidDay.date.getFullYear(),
        });
      }
    });
    
    // Handle the last month - set it to the last week
    if (months.length > 0) {
      months[months.length - 1].weekIndex = graphData.length - 1;
    }
    
    return months;
  }, [graphData]);

    const gap = Math.max(1, Math.floor(cellSize / 12)); // Dynamic gap based on cell size
  const weekWidth = cellSize + gap;
  const dayLabelWidth = Math.max(40, cellSize * 2);

  // Calculate day label positions based on today's position
  const today = new Date();
  const todayDayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Since today is always at bottom-right (row 6), calculate which rows correspond to each day
  const getDayRow = (targetDay: number) => {
    // Formula: (13 + targetDay - todayDayOfWeek) % 7
    // This positions today at row 6 and calculates other days relative to it
    return (13 + targetDay - todayDayOfWeek) % 7;
  };
  
  const mondayRow = getDayRow(1); // Monday = 1
  const wednesdayRow = getDayRow(3); // Wednesday = 3
  const fridayRow = getDayRow(5); // Friday = 5

  return (
    <div className={`p-4 ${className}`}>
      <div className="w-full">
        {/* Month labels */}
        <div 
          className="flex mb-6 text-xs text-gray-600 dark:text-gray-400 relative" 
          style={{ marginLeft: `${dayLabelWidth}px` }}
        >
          {monthLabels.map((month, index) => (
            <div
              key={`${month.name}-${month.year}-${index}`}
              className="absolute"
              style={{ left: `${month.weekIndex * weekWidth}px` }}
            >
              {month.name}
            </div>
          ))}
        </div>
        
        {/* Day labels */}
        <div className="flex">
          <div 
            className="relative text-xs text-gray-600 dark:text-gray-400 mr-2"
            style={{ width: `${dayLabelWidth}px` }}
          >
            {/* Monday label */}
            <div 
              className="absolute flex items-center"
              style={{ 
                top: `${mondayRow * (cellSize + gap)}px`,
                height: `${cellSize}px`
              }}
            >
              Mon
            </div>
            
            {/* Wednesday label */}
            <div 
              className="absolute flex items-center"
              style={{ 
                top: `${wednesdayRow * (cellSize + gap)}px`,
                height: `${cellSize}px`
              }}
            >
              Wed
            </div>
            
            {/* Friday label */}
            <div 
              className="absolute flex items-center"
              style={{ 
                top: `${fridayRow * (cellSize + gap)}px`,
                height: `${cellSize}px`
              }}
            >
              Fri
            </div>
          </div>
          
          {/* Graph grid */}
          <div className="flex-1 flex" style={{ gap: `${gap}px` }}>
            {graphData.map((week, weekIndex) => (
              <div 
                key={weekIndex} 
                className="flex flex-col" 
                style={{ 
                  width: `${cellSize}px`,
                  gap: `${gap}px`
                }}
              >
                {week.map((day, dayIndex) => {
                  if (!day) {
                    // Empty cell for alignment
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className="rounded-sm bg-transparent"
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                        }}
                      />
                    );
                  }
                  
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`rounded-xs transition-all ${getIntensityClass(
                        day.isCompleted,
                        day.value,
                        day.isWithinRange
                      )} ${
                        day.isWithinRange && onCellClick 
                          ? 'cursor-pointer hover:ring-2 hover:ring-blue-300 hover:scale-110' 
                          : ''
                      }`}
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                      }}
                      title={getTooltipText(day)}
                      onClick={() => handleCellClick(day)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div className="flex" style={{ gap: `${gap}px` }}>
            <div 
              className="rounded-sm bg-gray-200 dark:bg-gray-700"
              style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
            ></div>
            <div 
              className="rounded-sm bg-green-200 dark:bg-green-700"
              style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
            ></div>
            <div 
              className="rounded-sm bg-green-300 dark:bg-green-600"
              style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
            ></div>
            <div 
              className="rounded-sm bg-green-400 dark:bg-green-500"
              style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
            ></div>
            <div 
              className="rounded-sm bg-green-500 dark:bg-green-400"
              style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
            ></div>
            <div 
              className="rounded-sm bg-green-600 dark:bg-green-300"
              style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
            ></div>
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
  );
}; 