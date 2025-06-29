'use client';

import { useState } from 'react';
import { Plus, CheckSquare, Hash } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateHabitDialogProps {
  onCreateHabit: (name: string, description?: string, color?: string, type?: 'checkbox' | 'number', target?: number, unit?: string) => void;
}

const HABIT_COLORS = [
  '#10b981', // emerald
  '#0ea5e9', // sky
  '#8b5cf6', // violet
  '#ef4444', // red
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

const COMMON_UNITS = [
  'minutes', 'hours', 'miles', 'kilometers', 'glasses', 'cups', 'pages', 
  'exercises', 'repetitions', 'calories', 'steps', 'pounds', 'kilograms'
];

export const CreateHabitDialog = ({ onCreateHabit }: CreateHabitDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [habitType, setHabitType] = useState<'checkbox' | 'number'>('checkbox');
  const [target, setTarget] = useState<number>(1);
  const [unit, setUnit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateHabit(
      name.trim(), 
      description.trim() || undefined, 
      selectedColor,
      habitType,
      habitType === 'number' ? target : undefined,
      habitType === 'number' ? unit.trim() || undefined : undefined
    );
    
    // Reset form
    setName('');
    setDescription('');
    setSelectedColor(HABIT_COLORS[0]);
    setHabitType('checkbox');
    setTarget(1);
    setUnit('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Habit</DialogTitle>
            <DialogDescription>
              Add a new habit to track. Choose between checkbox or number-based tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Habit Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Exercise, Read for 30 minutes..."
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your habit or add some motivation..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Habit Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={habitType === 'checkbox' ? 'default' : 'outline'}
                  onClick={() => setHabitType('checkbox')}
                  className="gap-2"
                >
                  <CheckSquare className="h-4 w-4" />
                  Checkbox
                </Button>
                <Button
                  type="button"
                  variant={habitType === 'number' ? 'default' : 'outline'}
                  onClick={() => setHabitType('number')}
                  className="gap-2"
                >
                  <Hash className="h-4 w-4" />
                  Number
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {habitType === 'checkbox' 
                  ? 'Simple complete/incomplete tracking' 
                  : 'Track quantities like miles, minutes, glasses, etc.'
                }
              </p>
            </div>

            {habitType === 'number' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="target">Daily Target *</Label>
                    <Input
                      id="target"
                      type="number"
                      min="1"
                      step="0.1"
                      value={target}
                      onChange={(e) => setTarget(parseFloat(e.target.value) || 1)}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g., miles, minutes"
                      list="common-units"
                    />
                    <datalist id="common-units">
                      {COMMON_UNITS.map(u => (
                        <option key={u} value={u} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Examples: 30 minutes, 5 miles, 8 glasses, 10 pages
                </p>
              </>
            )}
            
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {HABIT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? 'border-gray-900 dark:border-gray-100 scale-110'
                        : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create Habit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 