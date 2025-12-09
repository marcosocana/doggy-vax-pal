import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Plus, Syringe } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { VaccineCard } from '@/components/VaccineCard';
import { VaccineOccurrence } from '@/lib/vaccineOccurrences';

interface DayVaccinesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  occurrences: VaccineOccurrence[];
  onVaccineClick: (occurrence: VaccineOccurrence) => void;
  onAddVaccine: () => void;
}

export function DayVaccinesSheet({ 
  isOpen, 
  onClose, 
  selectedDate, 
  occurrences,
  onVaccineClick,
  onAddVaccine 
}: DayVaccinesSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto max-h-[75vh] rounded-t-3xl px-4 sm:px-6">
        <SheetHeader className="text-left pb-3 sm:pb-4">
          <SheetTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="capitalize truncate">
              {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto max-h-[calc(75vh-90px)] pb-6 -mx-1 px-1">
          {occurrences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-10">
              <Syringe className="w-14 h-14 sm:w-12 sm:h-12 mb-4 opacity-30 text-muted-foreground" />
              <p className="text-base sm:text-sm text-muted-foreground mb-5">No hay vacunas este día</p>
              <Button onClick={onAddVaccine} variant="outline" size="lg" className="gap-2 h-12 px-6 touch-manipulation">
                <Plus className="w-5 h-5" />
                Añadir vacuna
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {occurrences.map((occurrence, index) => (
                <VaccineCard 
                  key={`${occurrence.vaccine.id}-${index}`}
                  vaccine={occurrence.vaccine}
                  isRepeatedOccurrence={!occurrence.isOriginal}
                  onClick={() => {
                    onVaccineClick(occurrence);
                    onClose();
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
