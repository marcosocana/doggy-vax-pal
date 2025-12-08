import { useMemo } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay, 
  isToday,
  isPast,
  startOfDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Vaccine } from '@/types/vaccine';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  currentDate: Date;
  vaccines: Vaccine[];
  onDayClick: (date: Date) => void;
}

const typeColors = {
  core: 'bg-vaccine-core',
  non_core: 'bg-vaccine-non-core',
  optional: 'bg-vaccine-optional',
  deworming: 'bg-vaccine-deworming',
  other: 'bg-vaccine-other',
};

export function CalendarGrid({ currentDate, vaccines, onDayClick }: CalendarGridProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { locale: es });
    const end = endOfWeek(endOfMonth(currentDate), { locale: es });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const getVaccinesForDay = (date: Date) => {
    return vaccines.filter(v => isSameDay(new Date(v.date), date));
  };

  return (
    <div className="px-4 py-3">
      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayVaccines = getVaccinesForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
          const isPastDay = isPast(startOfDay(day)) && !isTodayDate;

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={cn(
                'relative aspect-square flex flex-col items-center justify-start p-1 rounded-xl transition-all',
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40',
                isTodayDate && 'bg-primary/10 ring-2 ring-primary',
                !isTodayDate && isCurrentMonth && 'hover:bg-muted',
                isPastDay && isCurrentMonth && 'opacity-40',
              )}
            >
              <span className={cn(
                'text-sm font-semibold',
                isTodayDate && 'text-primary'
              )}>
                {format(day, 'd')}
              </span>
              
              {/* Vaccine indicators - more prominent */}
              {dayVaccines.length > 0 && (
                <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                  {dayVaccines.slice(0, 3).map((vaccine) => (
                    <div
                      key={vaccine.id}
                      className={cn(
                        'w-2.5 h-2.5 rounded-full shadow-md ring-1 ring-white/50 animate-pulse',
                        typeColors[vaccine.vaccine_type]
                      )}
                    />
                  ))}
                  {dayVaccines.length > 3 && (
                    <span className="text-[8px] font-bold text-primary">+{dayVaccines.length - 3}</span>
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
