'use client';

import { useState, useEffect } from 'react';
import { Settings, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/hooks/useSettings';

interface SettingsDialogProps {
  children?: React.ReactNode;
}

export const SettingsDialog = ({ children }: SettingsDialogProps) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [localCellSize, setLocalCellSize] = useState(settings.cellSize);
  const [open, setOpen] = useState(false);

  // Update local state when settings change
  useEffect(() => {
    setLocalCellSize(settings.cellSize);
  }, [settings.cellSize]);

  const handleCellSizeChange = (newSize: number) => {
    const clampedSize = Math.max(8, Math.min(48, newSize));
    setLocalCellSize(clampedSize);
    updateSettings({ cellSize: clampedSize });
  };

  const handleReset = () => {
    resetSettings();
    setLocalCellSize(24); // Reset to default
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
                  onClick={() => handleCellSizeChange(localCellSize - 2)}
                  disabled={localCellSize <= 8}
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
                  onClick={() => handleCellSizeChange(localCellSize + 2)}
                  disabled={localCellSize >= 48}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Adjust the size of cells in your habit graphs (8-48 pixels)
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