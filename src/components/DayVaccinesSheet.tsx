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
      <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-3xl">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto max-h-[calc(70vh-100px)] pb-6">
          {occurrences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Syringe className="w-12 h-12 mb-3 opacity-30 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">No hay vacunas este día</p>
              <Button onClick={onAddVaccine} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
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
