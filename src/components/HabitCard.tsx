/**
 * HabitCard.tsx - A comprehensive React component for displaying and managing individual habits
 * 
 * This component serves as the main UI card for displaying habit information, progress tracking,
 * statistics, and interactive elements. It supports both checkbox-type habits (binary completion)
 * and number-type habits (quantifiable values with targets).
 * 
 * Key Features:
 * - Visual habit representation with color coding
 * - Today's progress tracking and quick completion
 * - Interactive activity graph (GitHub-style heatmap)
 * - Comprehensive statistics and insights
 * - Entry editing through modal dialog  
 * - Progress visualization for number-type habits
 * - Streak tracking and completion rates
 * - Test data generation for development
 * - Habit deletion functionality
 */

'use client'; // Next.js directive to mark this as a client-side component

// React hooks for state management
import { useState } from 'react';

// Lucide React icons for visual elements throughout the card
import { 
  Trash2,       // Delete button icon (trash can)
  Hash,         // Number sign for numeric habits
  CheckSquare,  // Checkbox icon for boolean habits
  BarChart3,    // Chart icon for insights/statistics section
  Calendar,     // Calendar icon for today's progress button
  FlaskConical  // Flask icon for adding random test data (development feature)
} from 'lucide-react';

// Shadcn/ui components for consistent styling and accessibility
import { Button } from '@/components/ui/button';              // Interactive buttons with variants
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Card layout structure

// Custom types and components specific to this habit tracking application
import { Habit } from '@/types/habit';                        // TypeScript interface defining habit structure
import { HabitGraph } from './HabitGraph';                    // GitHub-style heatmap component for visualizing habit activity
import { EditHabitEntryDialog } from './EditHabitEntryDialog'; // Modal dialog for editing specific habit entries
import { useSettings } from '@/hooks/useSettings';            // Custom hook for accessing user settings (like cell size preferences)

/**
 * Props interface for the HabitCard component
 * 
 * This interface defines all the data and callback functions needed to render
 * and interact with a single habit card. The props are carefully designed to
 * separate concerns - the parent component handles data processing and state
 * management, while this component focuses on presentation and user interaction.
 */
interface HabitCardProps {
  // Core habit data - the main habit object containing name, type, color, etc.
  habit: Habit;
  
  // Today's completion status - boolean indicating if the habit was completed today
  // For checkbox habits: true if checked, false if not checked
  // For number habits: true if today's value meets or exceeds the target
  isCompletedToday: boolean;
  
  // Streak statistics - consecutive days of habit completion
  currentStreak: number;    // Current ongoing streak (resets when habit is missed)
  longestStreak: number;    // Historical best streak for motivation
  
  // Statistical data for insights and progress visualization
  average: number;          // Average value across all entries (for numbers) or completion rate (for checkboxes)
  total: number;           // Sum of all entries (meaningful for number habits)
  standardDeviation: number; // Statistical measure of value consistency (for number habits)
  todayValue: number;      // Today's specific value (0 for incomplete checkbox, actual number for numeric habits)
  totalCount: number;      // Total number of completed entries across all time
  
  // Callback functions for user interactions - these allow the parent component
  // to handle state changes while keeping this component focused on presentation
  onToggleCompletion: (habitId: string, date: string) => void;  // Toggle checkbox completion for a specific date
  onUpdateEntry: (habitId: string, date: string, value: number) => void; // Update numeric value for a specific date
  onDelete: (habitId: string) => void;                         // Delete this entire habit
  onAddRandomEntries: (habitId: string) => void;              // Development feature: populate with random test data
}

/**
 * HabitCard Component - The main functional component
 * 
 * This component renders a comprehensive card view for a single habit, including
 * all its data, statistics, and interactive elements. It manages its own local
 * state for UI interactions while delegating data changes to parent callbacks.
 */
export const HabitCard = ({
  habit,
  isCompletedToday,
  currentStreak,
  longestStreak,
  average,
  total,
  standardDeviation,
  todayValue,
  totalCount,
  onToggleCompletion,
  onUpdateEntry,
  onDelete,
  onAddRandomEntries,
}: HabitCardProps) => {
  
  // ===== LOCAL STATE MANAGEMENT =====
  // These state variables manage the modal dialog for editing habit entries
  
  // Controls whether the edit entry dialog is open or closed
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Stores the date that was clicked for editing (in YYYY-MM-DD format)
  const [selectedDate, setSelectedDate] = useState('');
  
  // Stores the current value for the selected date (for pre-populating the edit form)
  const [selectedValue, setSelectedValue] = useState(0);
  
  // Stores the completion status for the selected date (for checkbox habits)
  const [selectedIsCompleted, setSelectedIsCompleted] = useState(false);
  
  // ===== HOOKS AND DERIVED DATA =====
  
  // Access user settings (like preferred cell size for the activity graph)
  const { settings } = useSettings();
  
  // Generate today's date in ISO format (YYYY-MM-DD) for date comparisons
  // This is used throughout the component to identify "today" in various calculations
  const today = new Date().toISOString().split('T')[0];
  
  // ===== EVENT HANDLERS =====
  
  /**
   * Handles clicking on any cell in the activity graph
   * Opens the edit dialog with the clicked date's information pre-populated
   * 
   * @param date - The date that was clicked (YYYY-MM-DD format)
   * @param value - The current value for that date
   * @param isCompleted - Whether that date is marked as completed
   */
  const handleCellClick = (date: string, value: number, isCompleted: boolean) => {
    setSelectedDate(date);              // Store which date was clicked
    setSelectedValue(value);            // Pre-populate the current value
    setSelectedIsCompleted(isCompleted); // Pre-populate the completion status
    setEditDialogOpen(true);            // Open the edit dialog
  };

  /**
   * Handles clicking the "Today" button
   * This is a convenience method that opens the edit dialog for today's date
   * Uses the handleCellClick function with today's data
   */
  const handleTodayClick = () => {
    handleCellClick(today, todayValue, isCompletedToday);
  };

  /**
   * Handles saving changes from the edit dialog
   * Delegates the actual data update to the parent component via callback
   * 
   * @param date - The date being updated
   * @param value - The new value to save
   */
  const handleDialogSave = (date: string, value: number) => {
    onUpdateEntry(habit.id, date, value);
  };

  /**
   * Handles toggling completion status from the edit dialog
   * Delegates the toggle operation to the parent component via callback
   * 
   * @param date - The date being toggled
   */
  const handleDialogToggle = (date: string) => {
    onToggleCompletion(habit.id, date);
  };

  // ===== CALCULATED VALUES =====
  
  // (No calculated values are currently used in the component render)

  // ===== COMPONENT RENDER =====
  return (
    <Card className="relative overflow-hidden w-fit"> {/* Main card container with relative positioning for color indicator */}
      
     
      
      {/* ===== CARD HEADER SECTION ===== */}
      {/* Contains habit name, description, type indicator, and action buttons */}
      <CardHeader className="pb-3"> {/* Reduced bottom padding for tighter layout */}
        <div className="flex items-start justify-between"> {/* Flex container: habit info on left, buttons on right */}
          
          {/* Left side: Habit information */}
          <div className="flex-1 min-w-0"> {/* Flex-grow with minimum width 0 to enable text truncation */}
            
            {/* Habit name and type icon row */}
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold truncate">{habit.name}</CardTitle>
              {/* Icon indicates habit type: checkbox for binary habits, hash for numeric habits */}
              {habit.type === 'checkbox' ? (
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Hash className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            
            {/* Optional habit description */}
            {habit.description && (
              <CardDescription className="mt-1 text-sm">
                {habit.description}
              </CardDescription>
            )}
            
            {/* Target information for numeric habits */}
            {habit.type === 'number' && (
              <div className="text-xs text-muted-foreground mt-1">
                Target: {habit.target}{habit.unit ? ` ${habit.unit}` : ''} per day
              </div>
            )}
          </div>
          
          {/* Right side: Action buttons */}
          <div className="flex gap-1">
            {/* Test data button - development feature for populating random entries */}
            <Button
              variant="ghost"                                    // Subtle styling
              size="sm"                                         // Small size to fit in header
              onClick={() => onAddRandomEntries(habit.id)}     // Trigger test data generation
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950" // Blue theme
              title="Add random test data"                     // Tooltip text
            >
              <FlaskConical className="h-4 w-4" />
            </Button>
            
            {/* Delete button - removes the entire habit */}
            <Button
              variant="ghost"                                   // Subtle styling
              size="sm"                                        // Small size to fit in header
              onClick={() => onDelete(habit.id)}              // Trigger habit deletion
              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" // Red theme for destructive action
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* ===== CARD CONTENT SECTION ===== */}
      {/* Contains all the main content: today's progress, activity graph, and insights */}
      <CardContent className="space-y-6"> {/* Consistent 24px spacing between sections */}
        
       
        

        {/* ===== ACTIVITY GRAPH SECTION ===== */}
        {/* GitHub-style heatmap showing the year's activity pattern */}
        <div className="space-y-3">
          
          {/* The actual heatmap component */}
          <HabitGraph 
            habit={habit}                           // Pass habit data for rendering
            onCellClick={handleCellClick}          // Handle clicks on individual cells
            cellSize={settings.cellSize}          // User-configurable cell size
          />
          
          {/* Today button for quick logging */}
          <div className="flex justify-end">
          <Button
            variant="outline"
            size="lg"
            onClick={handleTodayClick}
            className="w-fit"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Log Today
          </Button></div>
        </div>

        {/* ===== INSIGHTS AND STATISTICS SECTION ===== */}
        {/* Comprehensive statistics about the habit's performance */}
        <div className="space-y-3">
          {/* Section header with icon */}
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Insights</span>
          </div>
          
          {/* Statistics list - single column layout */}
          <div className="space-y-2 text-sm">
            
            {/* Longest streak - historical best for motivation */}
            <div className="flex justify-start">
              <span className="text-muted-foreground">Longest streak:</span>
              <span className="font-medium">{longestStreak} days</span>
            </div>
            
            {/* Current streak - ongoing performance */}
            <div className="flex justify-start">
              <span className="text-muted-foreground">Current streak:</span>
              <span className="font-medium">{currentStreak} days</span>
            </div>
            
            {habit.type === 'number' ? (
              // Statistics specific to numeric habits
              <>
                {/* Average value across all entries */}
                <div className="flex justify-start">
                  <span className="text-muted-foreground">Average:</span>
                  <span className="font-medium">
                    {average.toFixed(2)} {habit.unit || ''}
                  </span>
                </div>
                
                {/* Standard deviation - measure of consistency */}
                <div className="flex justify-start">
                  <span className="text-muted-foreground">Standard deviation:</span>
                  <span className="font-medium">
                    {standardDeviation.toFixed(2)} {habit.unit || ''}
                  </span>
                </div>
                
                {/* Total sum of all values */}
                <div className="flex justify-start">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">
                    {total.toFixed(2)} {habit.unit || ''}
                  </span>
                </div>
                
                {/* Entry count */}
                <div className="flex justify-start">
                  <span className="text-muted-foreground">Number of entries:</span>
                  <span className="font-medium">{totalCount}</span>
                </div>
              </>
            ) : (
              // Statistics for checkbox habits
              <div className="flex justify-start">
                <span className="text-muted-foreground">Average:</span>
                <span className="font-medium">{(average * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* ===== QUICK STATS BADGES SECTION ===== */}
        {/* Footer area with key metrics displayed as badges and icons */}
        {/* <div className="flex items-center gap-2 pt-2 border-t"> */} {/* Top border separates from insights */}
          
          {/* Current streak with flame icon */}
          {/* <div className="flex items-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" /> */} {/* Fire icon represents "hot streak" */}
            {/* <span className="text-sm font-medium">{currentStreak} day streak</span>
          </div> */}
          
          {/* Total count with target icon */}
          {/* <div className="flex items-center gap-1">
            <Target className="h-4 w-4 text-blue-500" /> */} {/* Target icon for goal achievement */}
            {/* <span className="text-sm text-muted-foreground">{totalCount} total</span>
          </div> */}
          
          {/* Completion rate badge with conditional styling */}
          {/* <Badge variant={completionRate >= 70 ? 'default' : 'secondary'}> */} {/* Green badge for good rates, gray for poor rates */}
            {/* {completionRate}% rate
          </Badge>
        </div> */}
      </CardContent>

      {/* ===== EDIT ENTRY MODAL DIALOG ===== */}
      {/* Modal dialog for editing individual habit entries */}
      {/* Positioned outside the card content so it can overlay the entire screen */}
      <EditHabitEntryDialog
        open={editDialogOpen}                    // Controls dialog visibility
        onOpenChange={setEditDialogOpen}         // Callback to close dialog
        habit={habit}                           // Habit data for context
        date={selectedDate}                     // The date being edited
        currentValue={selectedValue}            // Current value for pre-population
        isCompleted={selectedIsCompleted}       // Current completion status
        onSave={handleDialogSave}              // Callback for saving changes
        onToggleCompletion={handleDialogToggle} // Callback for toggling completion
      />
    </Card>
  );
}; 