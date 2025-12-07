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
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
      {/* Dog info bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border-b border-border/30">
        <Button variant="ghost" size="icon" onClick={onChangeDog} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <Dog className="w-4 h-4 text-primary" />
        </div>
        <span className="font-semibold text-sm">{dog.name}</span>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate(subMonths(currentDate, 1))}
            className="h-9 w-9"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <h1 className="text-lg font-bold capitalize min-w-[140px] text-center">
            {monthYear}
          </h1>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate(addMonths(currentDate, 1))}
            className="h-9 w-9"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate(new Date())}
          className="text-primary font-semibold"
        >
          Hoy
        </Button>
      </div>
    </header>
  );
}
