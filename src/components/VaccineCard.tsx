import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Repeat, ChevronRight } from 'lucide-react';
import { Vaccine, vaccineTypeLabels, vaccineStatusLabels, periodicityUnitLabels } from '@/types/vaccine';
import { cn } from '@/lib/utils';

interface VaccineCardProps {
  vaccine: Vaccine;
  onClick: () => void;
  isRepeatedOccurrence?: boolean;
}

const statusColors = {
  administered: 'bg-vaccine-administered/10 border-vaccine-administered/30 text-vaccine-administered',
  scheduled: 'bg-vaccine-scheduled/10 border-vaccine-scheduled/30 text-vaccine-scheduled',
  overdue: 'bg-vaccine-overdue/10 border-vaccine-overdue/30 text-vaccine-overdue',
};

const typeColors = {
  core: 'bg-vaccine-core',
  non_core: 'bg-vaccine-non-core',
  optional: 'bg-vaccine-optional',
  deworming: 'bg-vaccine-deworming',
  other: 'bg-vaccine-other',
};

export function VaccineCard({ vaccine, onClick, isRepeatedOccurrence = false }: VaccineCardProps) {
  const formattedDate = format(new Date(vaccine.date), "d 'de' MMMM, yyyy", { locale: es });

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card rounded-xl p-3 sm:p-4 shadow-soft border border-border/50 active:shadow-glow active:border-primary/20 transition-all duration-300 animate-fade-in group min-h-[80px] touch-manipulation"
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        {/* Type indicator */}
        <div className={cn('w-1.5 sm:w-1 h-full min-h-[60px] rounded-full flex-shrink-0', typeColors[vaccine.vaccine_type])} />
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
            <h3 className="font-bold text-foreground truncate text-base">{vaccine.name}</h3>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap flex-shrink-0',
              statusColors[vaccine.status]
            )}>
              {vaccineStatusLabels[vaccine.status]}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
            <Calendar className="w-4 h-4 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 sm:py-0.5 rounded-md">
                {vaccineTypeLabels[vaccine.vaccine_type]}
              </span>
              
              {vaccine.is_repeatable && vaccine.periodicity && vaccine.periodicity_unit && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Repeat className="w-3.5 h-3.5 sm:w-3 sm:h-3 flex-shrink-0" />
                  <span>Cada {vaccine.periodicity} {periodicityUnitLabels[vaccine.periodicity_unit]}</span>
                </div>
              )}

              {isRepeatedOccurrence && (
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 sm:py-0.5 rounded-md">
                  Repetición
                </span>
              )}
            </div>
            
            <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4 text-muted-foreground group-active:text-primary group-active:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </div>
      </div>
    </button>
  );
}
