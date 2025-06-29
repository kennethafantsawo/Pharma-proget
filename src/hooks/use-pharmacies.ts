
'use client';

import { useState, useEffect, useCallback } from 'react';
import { type WeekSchedule } from '@/lib/types';
import { isDateInWeek } from '@/lib/date-utils';

const PHARMACIES_STORAGE_KEY = 'pharmaguard_pharmacies_data';

export const usePharmacies = () => {
  const [data, setData] = useState<WeekSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(-1);

  const findCurrentWeekIndex = useCallback((schedules: WeekSchedule[]) => {
    const now = new Date();
    // Set schedule update time to 7:00 AM
    const scheduleUpdateTime = new Date();
    scheduleUpdateTime.setHours(7, 0, 0, 0);

    // If it's before 7 AM, use yesterday's date to determine the week
    if (now < scheduleUpdateTime) {
      now.setDate(now.getDate() - 1);
    }

    const index = schedules.findIndex(week => isDateInWeek(now, week.semaine));
    return index !== -1 ? index : 0; // Default to first week if none match
  }, []);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        let schedules: WeekSchedule[] | null = null;
        
        // Try to load from localStorage first
        const storedData = localStorage.getItem(PHARMACIES_STORAGE_KEY);
        if (storedData) {
          schedules = JSON.parse(storedData);
        } else {
          // Fetch from public file if not in localStorage
          const response = await fetch('/pharmacies.json');
          if (!response.ok) {
            throw new Error('Failed to fetch pharmacy data');
          }
          schedules = await response.json();
          // Cache the fetched data
          if (schedules) {
            localStorage.setItem(PHARMACIES_STORAGE_KEY, JSON.stringify(schedules));
          }
        }

        if (schedules && Array.isArray(schedules)) {
          setData(schedules);
          setCurrentWeekIndex(findCurrentWeekIndex(schedules));
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [findCurrentWeekIndex]);

  const updatePharmacies = useCallback((newSchedules: WeekSchedule[]) => {
    try {
      setData(newSchedules);
      localStorage.setItem(PHARMACIES_STORAGE_KEY, JSON.stringify(newSchedules));
      setCurrentWeekIndex(findCurrentWeekIndex(newSchedules));
      setError(null);
    } catch (err) {
      setError('Failed to update and save new pharmacy data.');
      console.error(err);
    }
  }, [findCurrentWeekIndex]);

  const goToWeek = (index: number) => {
    if (index >= 0 && index < data.length) {
      setCurrentWeekIndex(index);
    }
  };

  const goToNextWeek = () => {
    if (currentWeekIndex < data.length - 1) {
      setCurrentWeekIndex(prev => prev + 1);
    }
  };

  const goToPrevWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(prev => prev - 1);
    }
  };

  return {
    data,
    loading,
    error,
    currentWeekIndex,
    currentSchedule: data[currentWeekIndex],
    updatePharmacies,
    goToWeek,
    goToNextWeek,
    goToPrevWeek,
    isFirstWeek: currentWeekIndex === 0,
    isLastWeek: currentWeekIndex === data.length - 1,
  };
};
