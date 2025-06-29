export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  type: 'checkbox' | 'number'; // Type of habit tracking
  target?: number; // Daily target for number-based habits
  unit?: string; // Unit for number-based habits (miles, glasses, minutes, etc.)
  createdAt: string;
  completedDates: string[]; // Array of ISO date strings for checkbox habits
  entries?: { date: string; value: number }[]; // Array of daily entries for number habits
}

export interface HabitCompletion {
  habitId: string;
  date: string;
  completed: boolean;
}

export interface HabitEntry {
  habitId: string;
  date: string;
  value: number;
} 