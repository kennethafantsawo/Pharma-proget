
'use client';

import { useState, useEffect, useCallback } from 'react';
import { type WeekSchedule } from '@/lib/types';
import { isDateInWeek } from '@/lib/date-utils';
import { supabase } from '@/lib/supabase/client';

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

      if (!supabase) {
        setError("Configuration Supabase manquante. Veuillez créer un fichier .env.local avec les variables d'environnement nécessaires.");
        setData([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch data from Supabase instead of a JSON file
        const { data: schedules, error: fetchError } = await supabase
            .from('weeks')
            .select('semaine, pharmacies(nom, localisation, contact1, contact2)')
            .order('semaine', { ascending: true });
        
        if (fetchError) {
            throw fetchError;
        }

        if (schedules && Array.isArray(schedules)) {
          // The data from Supabase should match the WeekSchedule structure
          setData(schedules as WeekSchedule[]);
          setCurrentWeekIndex(findCurrentWeekIndex(schedules as WeekSchedule[]));
        } else {
          throw new Error('Invalid data format from Supabase');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [findCurrentWeekIndex]);

  const goToWeek = useCallback((index: number) => {
    if (index >= 0 && index < data.length) {
      setCurrentWeekIndex(index);
    }
  }, [data.length]);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < data.length) {
        return nextIndex;
      }
      return prevIndex;
    });
  }, [data.length]);

  const goToPrevWeek = useCallback(() => {
    setCurrentWeekIndex(prevIndex => {
      const prevIndexValue = prevIndex - 1;
      if (prevIndexValue >= 0) {
        return prevIndexValue;
      }
      return prevIndex;
    });
  }, []);

  return {
    data,
    loading,
    error,
    currentWeekIndex,
    currentSchedule: data[currentWeekIndex],
    goToWeek,
    goToNextWeek,
    goToPrevWeek,
    isFirstWeek: currentWeekIndex === 0,
    isLastWeek: currentWeekIndex === data.length - 1,
  };
};
