'use client';

import { useHabits } from '@/hooks/useHabits';
import { CreateHabitDialog } from '@/components/CreateHabitDialog';
import { HabitCard } from '@/components/HabitCard';
import { TrendingUp, Target, Calendar } from 'lucide-react';

export default function HabitTracker() {
  const {
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
  } = useHabits();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your habits...</p>
        </div>
      </div>
    );
  }

  const totalHabits = habits.length;
  const completedToday = habits.filter(habit => isHabitCompletedToday(habit)).length;
  const totalStreaks = habits.reduce((sum, habit) => sum + getHabitStreak(habit), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Habit Tracker</h1>
              <p className="text-muted-foreground">
                Build consistency, track progress, and achieve your goals
              </p>
            </div>
            <CreateHabitDialog onCreateHabit={addHabit} />
          </div>
        </div>
      </div>

      {/* Stats */}
      {totalHabits > 0 && (
        <div className="border-b bg-muted/20">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Habits</p>
                  <p className="text-2xl font-semibold">{totalHabits}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-semibold">
                    {completedToday}/{totalHabits}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Streaks</p>
                  <p className="text-2xl font-semibold">{totalStreaks}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No habits yet</h2>
                <p className="text-muted-foreground mb-6">
                  Start building better habits today. Create your first habit to begin tracking your progress.
                  <br />
                  <br />
                  Choose between:
                  <br />
                  <strong>Checkbox habits</strong> - Simple complete/incomplete tracking
                  <br />
                  <strong>Number habits</strong> - Track quantities like miles, minutes, glasses, etc.
                </p>
              </div>
              <CreateHabitDialog onCreateHabit={addHabit} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isCompletedToday={isHabitCompletedToday(habit)}
                currentStreak={getHabitStreak(habit)}
                longestStreak={getLongestStreak(habit)}
                average={getHabitAverage(habit)}
                total={getHabitTotal(habit)}
                standardDeviation={getHabitStandardDeviation(habit)}
                todayValue={getTodayEntry(habit)}
                totalCount={getTotalCount(habit)}
                onToggleCompletion={toggleHabitCompletion}
                onUpdateEntry={updateHabitEntry}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/20 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Built with Next.js, Tailwind CSS, and shadcn/ui</p>
            <p className="mt-1">Track your habits, build consistency, achieve your goals 🎯</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
