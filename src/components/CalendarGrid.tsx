import { useMemo } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isToday,
  isPast,
  startOfDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { VaccineOccurrence, getOccurrencesForDay } from '@/lib/vaccineOccurrences';

interface CalendarGridProps {
  currentDate: Date;
  occurrences: VaccineOccurrence[];
  onDayClick: (date: Date) => void;
}

export function CalendarGrid({ currentDate, occurrences, onDayClick }: CalendarGridProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { locale: es });
    const end = endOfWeek(endOfMonth(currentDate), { locale: es });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="px-2 sm:px-4 py-2 sm:py-3">
      {/* Week days header */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[11px] sm:text-xs font-semibold text-muted-foreground py-1 sm:py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {days.map((day) => {
          const dayOccurrences = getOccurrencesForDay(occurrences, day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
          const isPastDay = isPast(startOfDay(day)) && !isTodayDate;

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={cn(
                'relative aspect-square flex flex-col items-center justify-start p-0.5 sm:p-1 rounded-lg sm:rounded-xl transition-all min-h-[44px] touch-manipulation',
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40',
                isTodayDate && 'bg-primary/10 ring-2 ring-primary',
                !isTodayDate && isCurrentMonth && dayOccurrences.length > 0 && 'bg-destructive/10',
                !isTodayDate && isCurrentMonth && dayOccurrences.length === 0 && 'active:bg-muted',
                isPastDay && isCurrentMonth && 'opacity-40',
              )}
            >
              <span className={cn(
                'text-[13px] sm:text-sm font-semibold leading-tight',
                isTodayDate && 'text-primary'
              )}>
                {format(day, 'd')}
              </span>
              
              {/* Vaccine indicators - red and prominent */}
              {dayOccurrences.length > 0 && (
                <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                  {dayOccurrences.slice(0, 3).map((occ, index) => (
                    <div
                      key={`${occ.vaccine.id}-${index}`}
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shadow-md ring-1 ring-white/50 animate-pulse bg-destructive"
                    />
                  ))}
                  {dayOccurrences.length > 3 && (
                    <span className="text-[7px] sm:text-[8px] font-bold text-destructive">+{dayOccurrences.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
