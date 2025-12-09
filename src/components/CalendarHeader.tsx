import { format, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Dog, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dog as DogType } from '@/types/dog';

interface CalendarHeaderProps {
  currentDate: Date;
  onNavigate: (date: Date) => void;
  dog: DogType;
  onChangeDog: () => void;
}

export function CalendarHeader({ currentDate, onNavigate, dog, onChangeDog }: CalendarHeaderProps) {
  const monthYear = format(currentDate, "MMMM yyyy", { locale: es });

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 safe-area-top">
      {/* Dog info bar */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-primary/5 border-b border-border/30">
        <Button variant="ghost" size="icon" onClick={onChangeDog} className="h-10 w-10 min-w-[44px] touch-manipulation">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center overflow-hidden bg-primary/10 flex-shrink-0">
          {dog.photo_url ? (
            <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
          ) : (
            <Dog className="w-5 h-5 sm:w-4 sm:h-4 text-primary" />
          )}
        </div>
        <span className="font-semibold text-sm sm:text-sm truncate">{dog.name}</span>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center gap-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate(subMonths(currentDate, 1))}
            className="h-11 w-11 min-w-[44px] touch-manipulation"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <h1 className="text-base sm:text-lg font-bold capitalize min-w-[120px] sm:min-w-[140px] text-center">
            {monthYear}
          </h1>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate(addMonths(currentDate, 1))}
            className="h-11 w-11 min-w-[44px] touch-manipulation"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate(new Date())}
          className="text-primary font-semibold h-10 px-4 min-w-[44px] touch-manipulation"
        >
          Hoy
        </Button>
      </div>
    </header>
  );
}
