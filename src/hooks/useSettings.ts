'use client';

import { useState, useEffect } from 'react';

interface Settings {
  cellSize: number;
  hoverDelay: number; // Delay in milliseconds for hover tooltip
  showStats: boolean; // Show/hide the statistics section
}

const DEFAULT_SETTINGS: Settings = {
  cellSize: 24,
  hoverDelay: 0, // Default no delay
  showStats: true, // Show stats section by default
};

const SETTINGS_KEY = 'habit-tracker-settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  }, [settings, isLoading]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
  };
}; 