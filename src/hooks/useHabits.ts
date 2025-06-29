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
          setHabits(JSON.parse(savedHabits));
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

  const addHabit = (name: string, description?: string, color: string = '#10b981') => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      description,
      color,
      createdAt: new Date().toISOString(),
      completedDates: [],
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
      if (habit.id === habitId) {
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

  const getHabitStreak = (habit: Habit): number => {
    if (habit.completedDates.length === 0) return 0;
    
    const sortedDates = habit.completedDates
      .map(date => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if completed today or yesterday (to account for different time zones)
    const mostRecentDate = sortedDates[0];
    mostRecentDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) return 0; // Streak broken
    
    // Count consecutive days
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
  };

  const isHabitCompletedToday = (habit: Habit): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return habit.completedDates.includes(today);
  };

  return {
    habits,
    isLoading,
    addHabit,
    deleteHabit,
    toggleHabitCompletion,
    getHabitStreak,
    isHabitCompletedToday,
  };
}; 