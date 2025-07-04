'use client';

import { useState, useEffect } from 'react';
import { Settings, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/hooks/useSettings';
import { ThemeToggle } from '@/components/ThemeToggle';

interface SettingsDialogProps {
  children?: React.ReactNode;
}

export const SettingsDialog = ({ children }: SettingsDialogProps) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [localCellSize, setLocalCellSize] = useState(settings.cellSize);
  const [localHoverDelay, setLocalHoverDelay] = useState(settings.hoverDelay);
  const [localShowStats, setLocalShowStats] = useState(settings.showStats);
  const [open, setOpen] = useState(false);

  // Update local state when settings change
  useEffect(() => {
    setLocalCellSize(settings.cellSize);
    setLocalHoverDelay(settings.hoverDelay);
    setLocalShowStats(settings.showStats);
  }, [settings.cellSize, settings.hoverDelay, settings.showStats]);

  const handleCellSizeChange = (newSize: number) => {
    const clampedSize = Math.max(1, Math.min(42, newSize));
    setLocalCellSize(clampedSize);
    updateSettings({ cellSize: clampedSize });
  };

  const handleHoverDelayChange = (newDelay: number) => {
    const clampedDelay = Math.max(0, Math.min(2000, newDelay));
    setLocalHoverDelay(clampedDelay);
    updateSettings({ hoverDelay: clampedDelay });
  };

  const handleShowStatsToggle = () => {
    const newValue = !localShowStats;
    setLocalShowStats(newValue);
    updateSettings({ showStats: newValue });
  };

  const handleReset = () => {
    resetSettings();
    setLocalCellSize(24); // Reset to default
    setLocalHoverDelay(0); // Reset to default
    setLocalShowStats(true); // Reset to default
  };

  const triggerButton = children || (
    <Button variant="outline" size="sm">
      <Settings className="h-4 w-4 mr-2" />
      Settings
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your habit tracker experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Theme Setting */}
          <ThemeToggle />
          
          {/* Show Stats Setting */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Statistics Section
            </Label>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Show overview stats (Total Habits, Completed Today, Total Streaks)
              </div>
              <Button
                variant={localShowStats ? "default" : "outline"}
                size="sm"
                onClick={handleShowStatsToggle}
                className="min-w-[60px]"
              >
                {localShowStats ? "ON" : "OFF"}
              </Button>
            </div>
          </div>
          
          {/* Cell Size Setting */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cellSize" className="text-sm font-medium">
                Graph Cell Size
              </Label>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCellSizeChange(localCellSize - 1)}
                  disabled={localCellSize <= 1}
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono w-8 text-center">{localCellSize}</span>
                  <span className="text-sm text-muted-foreground">px</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCellSizeChange(localCellSize + 1)}
                  disabled={localCellSize >= 42}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Adjust the size of cells in your habit graphs (1-42 pixels)
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="flex items-center space-x-1 p-3 bg-muted rounded-md">
                <div className="flex space-x-1">
                  <div 
                    className="rounded-sm bg-gray-200 dark:bg-gray-700"
                    style={{ width: `${localCellSize}px`, height: `${localCellSize}px` }}
                  />
                  <div 
                    className="rounded-sm bg-green-200 dark:bg-green-700"
                    style={{ width: `${localCellSize}px`, height: `${localCellSize}px` }}
                  />
                  <div 
                    className="rounded-sm bg-green-400 dark:bg-green-500"
                    style={{ width: `${localCellSize}px`, height: `${localCellSize}px` }}
                  />
                  <div 
                    className="rounded-sm bg-green-500 dark:bg-green-400"
                    style={{ width: `${localCellSize}px`, height: `${localCellSize}px` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground ml-2">Sample cells</span>
              </div>
            </div>
          </div>

          {/* Hover Delay Setting */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hoverDelay" className="text-sm font-medium">
                Hover Tooltip Delay
              </Label>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleHoverDelayChange(localHoverDelay - 100)}
                  disabled={localHoverDelay <= 0}
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono w-12 text-center">{localHoverDelay}</span>
                  <span className="text-sm text-muted-foreground">ms</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleHoverDelayChange(localHoverDelay + 100)}
                  disabled={localHoverDelay >= 2000}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Delay before showing hover tooltips (0-2000ms). 0 = instant.
              </div>
            </div>
          </div>

          {/* Reset Section */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Reset Settings</div>
                <div className="text-xs text-muted-foreground">
                  Restore all settings to their default values
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 