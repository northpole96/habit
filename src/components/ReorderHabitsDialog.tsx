'use client';

import { useState } from 'react';
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Habit } from '@/types/habit';

interface ReorderHabitsDialogProps {
  habits: Habit[];
  onReorderHabits: (reorderedHabits: Habit[]) => void;
}

export const ReorderHabitsDialog = ({ habits, onReorderHabits }: ReorderHabitsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [tempHabits, setTempHabits] = useState<Habit[]>([]);

  const handleOpen = () => {
    setTempHabits([...habits]);
    setOpen(true);
  };

  const handleClose = () => {
    setTempHabits([]);
    setOpen(false);
  };

  const moveHabitUp = (index: number) => {
    if (index > 0) {
      const newHabits = [...tempHabits];
      [newHabits[index], newHabits[index - 1]] = [newHabits[index - 1], newHabits[index]];
      setTempHabits(newHabits);
    }
  };

  const moveHabitDown = (index: number) => {
    if (index < tempHabits.length - 1) {
      const newHabits = [...tempHabits];
      [newHabits[index], newHabits[index + 1]] = [newHabits[index + 1], newHabits[index]];
      setTempHabits(newHabits);
    }
  };

  const handleSave = () => {
    onReorderHabits(tempHabits);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" onClick={handleOpen}>
          <ArrowUpDown className="h-4 w-4" />
          Reorder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Reorder Habits</DialogTitle>
          <DialogDescription>
            Change the order of your habits. Use the up and down buttons to move habits to your preferred position.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {tempHabits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No habits to reorder. Create some habits first!
            </p>
          ) : (
            <div className="space-y-2">
              {tempHabits.map((habit, index) => (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  <div 
                    className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                    style={{ backgroundColor: habit.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {habit.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {habit.type === 'checkbox' ? 'Checkbox habit' : `Number habit (${habit.target}${habit.unit ? ` ${habit.unit}` : ''})`}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveHabitUp(index)}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveHabitDown(index)}
                      disabled={index === tempHabits.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={tempHabits.length === 0}>
            Save Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 