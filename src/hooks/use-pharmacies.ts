
'use client';

import { useState, useEffect, useCallback } from 'react';
import { type WeekSchedule } from '@/lib/types';
import { isDateInWeek, parseWeekString } from '@/lib/date-utils';
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
    return index; // Returns -1 if not found
  }, []);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      if (!supabase) {
        setError("Configuration Supabase manquante. Veuillez vérifier votre fichier .env.local.");
        setData([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch data from Supabase
        const { data: schedules, error: fetchError } = await supabase
            .from('weeks')
            .select('semaine, pharmacies(nom, localisation, contact1, contact2, latitude, longitude)')
            .order('semaine', { ascending: true }); // Basic sort from DB
        
        if (fetchError) {
            throw fetchError;
        }

        if (schedules && Array.isArray(schedules)) {
          // Robust sort in JS to handle date strings correctly
          const sortedSchedules = (schedules as WeekSchedule[]).sort((a, b) => {
            const dateA = parseWeekString(a.semaine);
            const dateB = parseWeekString(b.semaine);
            if (dateA && dateB) {
              return dateA.start.getTime() - dateB.start.getTime();
            }
            return a.semaine.localeCompare(b.semaine);
          });
          
          setData(sortedSchedules);
          setCurrentWeekIndex(findCurrentWeekIndex(sortedSchedules));
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Erreur détaillée dans usePharmacies:", err);
        let errorMessage = "Une erreur inconnue est survenue lors de la récupération des données. Essayez de rafraîchir la page. Si le problème persiste, votre navigateur est peut-être obsolète.";
        if (err instanceof Error) {
            errorMessage = err.message;
        } else if (typeof err === 'string') {
            errorMessage = err;
        }
        setError(errorMessage);
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
    isLastWeek: currentWeekIndex > -1 && currentWeekIndex === data.length - 1,
  };
};
