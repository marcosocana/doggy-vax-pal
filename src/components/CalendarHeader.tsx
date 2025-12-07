import { format, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface CalendarHeaderProps {
  currentDate: Date;
  onNavigate: (date: Date) => void;
}

export function CalendarHeader({ currentDate, onNavigate }: CalendarHeaderProps) {
  const { signOut } = useAuth();
  
  const monthYear = format(currentDate, "MMMM yyyy", { locale: es });

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
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

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(new Date())}
            className="text-primary font-semibold"
          >
            Hoy
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="h-9 w-9 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
