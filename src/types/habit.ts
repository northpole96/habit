export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  completedDates: string[]; // Array of ISO date strings
}

export interface HabitCompletion {
  habitId: string;
  date: string;
  completed: boolean;
} 