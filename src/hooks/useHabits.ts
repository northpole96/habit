'use client';

import { useState, useEffect } from 'react';
import { Habit } from '@/types/habit';

const HABITS_STORAGE_KEY = 'habit-tracker-habits';

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const loadHabits = () => {
      try {
        const savedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
        if (savedHabits) {
          const parsedHabits = JSON.parse(savedHabits);
          // Migrate old habits to new format
          const migratedHabits = parsedHabits.map((habit: any) => ({
            ...habit,
            type: habit.type || 'checkbox', // Default to checkbox for existing habits
            entries: habit.entries || [],
          }));
          setHabits(migratedHabits);
        }
      } catch (error) {
        console.error('Error loading habits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure proper hydration
    const timer = setTimeout(loadHabits, 100);
    return () => clearTimeout(timer);
  }, [isMounted]);

  const saveHabits = (newHabits: Habit[]) => {
    if (!isMounted) return;
    
    try {
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(newHabits));
      setHabits(newHabits);
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  };

  const addHabit = (
    name: string, 
    description?: string, 
    color: string = '#10b981',
    type: 'checkbox' | 'number' = 'checkbox',
    target?: number,
    unit?: string
  ) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      description,
      color,
      type,
      target,
      unit,
      createdAt: new Date().toISOString(),
      completedDates: [],
      entries: [],
    };
    
    const updatedHabits = [...habits, newHabit];
    saveHabits(updatedHabits);
  };

  const deleteHabit = (habitId: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== habitId);
    saveHabits(updatedHabits);
  };

  const toggleHabitCompletion = (habitId: string, date: string) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId && habit.type === 'checkbox') {
        const completedDates = [...habit.completedDates];
        const dateIndex = completedDates.indexOf(date);
        
        if (dateIndex > -1) {
          completedDates.splice(dateIndex, 1);
        } else {
          completedDates.push(date);
        }
        
        return { ...habit, completedDates };
      }
      return habit;
    });
    
    saveHabits(updatedHabits);
  };

  const updateHabitEntry = (habitId: string, date: string, value: number) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId && habit.type === 'number') {
        const entries = [...(habit.entries || [])];
        const existingEntryIndex = entries.findIndex(entry => entry.date === date);
        
        if (existingEntryIndex > -1) {
          if (value > 0) {
            entries[existingEntryIndex] = { date, value };
          } else {
            entries.splice(existingEntryIndex, 1);
          }
        } else if (value > 0) {
          entries.push({ date, value });
        }
        
        return { ...habit, entries };
      }
      return habit;
    });
    
    saveHabits(updatedHabits);
  };

  const getHabitStreak = (habit: Habit): number => {
    if (habit.type === 'checkbox') {
      if (habit.completedDates.length === 0) return 0;
      
      const sortedDates = habit.completedDates
        .map(date => new Date(date))
        .sort((a, b) => b.getTime() - a.getTime());
      
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const mostRecentDate = sortedDates[0];
      mostRecentDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 1) return 0;
      
      for (let i = 0; i < sortedDates.length; i++) {
        const currentDate = sortedDates[i];
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - (daysDiff + i));
        expectedDate.setHours(0, 0, 0, 0);
        
        if (currentDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    } else {
      // For number habits, count consecutive days with entries that meet the target
      if (!habit.entries || habit.entries.length === 0) return 0;
      
      const sortedEntries = habit.entries
        .filter(entry => entry.value >= (habit.target || 1))
        .map(entry => new Date(entry.date))
        .sort((a, b) => b.getTime() - a.getTime());
      
      if (sortedEntries.length === 0) return 0;
      
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const mostRecentDate = sortedEntries[0];
      mostRecentDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 1) return 0;
      
      for (let i = 0; i < sortedEntries.length; i++) {
        const currentDate = sortedEntries[i];
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - (daysDiff + i));
        expectedDate.setHours(0, 0, 0, 0);
        
        if (currentDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    }
  };

  const getLongestStreak = (habit: Habit): number => {
    if (habit.type === 'checkbox') {
      if (habit.completedDates.length === 0) return 0;
      
      const sortedDates = habit.completedDates
        .map(date => new Date(date))
        .sort((a, b) => a.getTime() - b.getTime());
      
      let longestStreak = 1;
      let currentStreak = 1;
      
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = sortedDates[i - 1];
        const currentDate = sortedDates[i];
        const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
      
      return longestStreak;
    } else {
      if (!habit.entries || habit.entries.length === 0) return 0;
      
      const successfulDates = habit.entries
        .filter(entry => entry.value >= (habit.target || 1))
        .map(entry => new Date(entry.date))
        .sort((a, b) => a.getTime() - b.getTime());
      
      if (successfulDates.length === 0) return 0;
      
      let longestStreak = 1;
      let currentStreak = 1;
      
      for (let i = 1; i < successfulDates.length; i++) {
        const prevDate = successfulDates[i - 1];
        const currentDate = successfulDates[i];
        const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
      
      return longestStreak;
    }
  };

  const getHabitAverage = (habit: Habit): number => {
    if (habit.type === 'checkbox') {
      const totalDays = Math.max(1, Math.ceil((new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
      return habit.completedDates.length / totalDays;
    } else {
      if (!habit.entries || habit.entries.length === 0) return 0;
      const total = habit.entries.reduce((sum, entry) => sum + entry.value, 0);
      return total / habit.entries.length;
    }
  };

  const getHabitTotal = (habit: Habit): number => {
    if (habit.type === 'checkbox') {
      return habit.completedDates.length;
    } else {
      if (!habit.entries || habit.entries.length === 0) return 0;
      return habit.entries.reduce((sum, entry) => sum + entry.value, 0);
    }
  };

  const getHabitStandardDeviation = (habit: Habit): number => {
    if (habit.type === 'checkbox') return 0;
    
    if (!habit.entries || habit.entries.length < 2) return 0;
    
    const average = getHabitAverage(habit);
    const variance = habit.entries.reduce((sum, entry) => {
      return sum + Math.pow(entry.value - average, 2);
    }, 0) / habit.entries.length;
    
    return Math.sqrt(variance);
  };

  const isHabitCompletedToday = (habit: Habit): boolean => {
    const today = new Date().toISOString().split('T')[0];
    
    if (habit.type === 'checkbox') {
      return habit.completedDates.includes(today);
    } else {
      const todayEntry = habit.entries?.find(entry => entry.date === today);
      return todayEntry ? todayEntry.value >= (habit.target || 1) : false;
    }
  };

  const getTodayEntry = (habit: Habit): number => {
    if (habit.type !== 'number') return 0;
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = habit.entries?.find(entry => entry.date === today);
    return todayEntry?.value || 0;
  };

  const getTotalCount = (habit: Habit): number => {
    if (habit.type === 'checkbox') {
      return habit.completedDates.length;
    } else {
      return habit.entries?.length || 0;
    }
  };

  const addRandomEntries = (habitId: string, daysBack: number = 364) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const updatedHabits = habits.map(h => {
      if (h.id !== habitId) return h;

      const today = new Date();
      const randomDates: string[] = [];
      const randomEntries: { date: string; value: number }[] = [];

      for (let i = 0; i < daysBack; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        // Skip if already has data for this date
        if (h.type === 'checkbox' && h.completedDates.includes(dateString)) continue;
        if (h.type === 'number' && h.entries?.some(entry => entry.date === dateString)) continue;

        if (h.type === 'checkbox') {
          // For checkbox habits, randomly complete about 60-80% of days
          const completionRate = 0.6 + Math.random() * 0.2; // 60-80%
          if (Math.random() < completionRate) {
            randomDates.push(dateString);
          }
        } else if (h.type === 'number') {
          // For number habits, generate realistic random values
          const target = h.target || 1;
          const baseValue = target * 0.3; // Minimum 30% of target
          const variationRange = target * 1.4; // Can go up to 140% of target
          
          // Sometimes skip days (about 20% of the time)
          if (Math.random() > 0.2) {
            const randomValue = Math.max(0, baseValue + (Math.random() * variationRange));
            // Round to reasonable decimal places
            const roundedValue = Math.round(randomValue * 100) / 100;
            randomEntries.push({ date: dateString, value: roundedValue });
          }
        }
      }

      if (h.type === 'checkbox') {
        return {
          ...h,
          completedDates: [...h.completedDates, ...randomDates].sort()
        };
      } else {
        return {
          ...h,
          entries: [...(h.entries || []), ...randomEntries].sort((a, b) => a.date.localeCompare(b.date))
        };
      }
    });

    saveHabits(updatedHabits);
  };

  const reorderHabits = (reorderedHabits: Habit[]) => {
    saveHabits(reorderedHabits);
  };

  return {
    habits,
    isLoading,
    addHabit,
    deleteHabit,
    toggleHabitCompletion,
    updateHabitEntry,
    getHabitStreak,
    getLongestStreak,
    getHabitAverage,
    getHabitTotal,
    getHabitStandardDeviation,
    isHabitCompletedToday,
    getTodayEntry,
    getTotalCount,
    addRandomEntries,
    reorderHabits,
  };
}; 