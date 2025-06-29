
'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { WeekSchedule } from '@/lib/types';

interface WeekNavigatorProps {
  schedules: WeekSchedule[];
  currentWeekIndex: number;
  onWeekChange: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  isFirstWeek: boolean;
  isLastWeek: boolean;
}

export function WeekNavigator({
  schedules,
  currentWeekIndex,
  onWeekChange,
  onPrev,
  onNext,
  isFirstWeek,
  isLastWeek,
}: WeekNavigatorProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
      <div className="flex items-center gap-2">
        <Button onClick={onPrev} disabled={isFirstWeek} variant="outline" size="icon">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Semaine précédente</span>
        </Button>
        <h2 className="text-lg font-semibold text-center text-primary font-headline whitespace-nowrap min-w-[240px]">
          {schedules[currentWeekIndex]?.semaine || 'Chargement...'}
        </h2>
        <Button onClick={onNext} disabled={isLastWeek} variant="outline" size="icon">
          <ArrowRight className="h-4 w-4" />
          <span className="sr-only">Semaine suivante</span>
        </Button>
      </div>

      <div className="w-full sm:w-auto sm:min-w-[280px]">
        <Select
            value={currentWeekIndex.toString()}
            onValueChange={(value) => onWeekChange(parseInt(value, 10))}
        >
            <SelectTrigger>
                <SelectValue placeholder="Choisir une semaine" />
            </SelectTrigger>
            <SelectContent>
                {schedules.map((schedule, index) => (
                    <SelectItem key={index} value={index.toString()}>
                        {schedule.semaine}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
    </div>
  );
}
