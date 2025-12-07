import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval, addYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { Syringe } from 'lucide-react';
import { Vaccine } from '@/types/vaccine';
import { VaccineCard } from './VaccineCard';

interface VaccineListProps {
  currentDate: Date;
  vaccines: Vaccine[];
  onVaccineClick: (vaccine: Vaccine) => void;
}

export function VaccineList({ currentDate, vaccines, onVaccineClick }: VaccineListProps) {
  const monthVaccines = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    return vaccines.filter(v => {
      const vaccineDate = new Date(v.date);
      return isWithinInterval(vaccineDate, { start, end });
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [currentDate, vaccines]);

  // Group by day
  const groupedVaccines = useMemo(() => {
    const groups: Record<string, Vaccine[]> = {};
    
    monthVaccines.forEach(vaccine => {
      const dateKey = format(new Date(vaccine.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(vaccine);
    });

    return Object.entries(groups).map(([date, vaccines]) => ({
      date: new Date(date),
      vaccines,
    }));
  }, [monthVaccines]);

  if (monthVaccines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Syringe className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-1">Sin vacunas este mes</h3>
        <p className="text-muted-foreground text-sm">
          Pulsa el botón + para añadir una nueva vacuna
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 space-y-6">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Vacunas de {format(currentDate, 'MMMM', { locale: es })}
      </h2>
      
      {groupedVaccines.map(({ date, vaccines }) => (
        <div key={date.toISOString()} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex flex-col items-center justify-center">
              <span className="text-xs text-primary font-bold">{format(date, 'd')}</span>
              <span className="text-[10px] text-primary uppercase">{format(date, 'EEE', { locale: es })}</span>
            </div>
            <span className="text-sm text-muted-foreground capitalize">
              {format(date, "EEEE", { locale: es })}
            </span>
          </div>
          
          <div className="space-y-3 ml-12">
            {vaccines.map((vaccine, idx) => (
              <div key={vaccine.id} style={{ animationDelay: `${idx * 50}ms` }}>
                <VaccineCard vaccine={vaccine} onClick={() => onVaccineClick(vaccine)} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
