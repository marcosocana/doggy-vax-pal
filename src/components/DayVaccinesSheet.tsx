import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Syringe } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { VaccineCard } from '@/components/VaccineCard';
import { Vaccine } from '@/types/vaccine';

interface DayVaccinesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  vaccines: Vaccine[];
  onVaccineClick: (vaccine: Vaccine) => void;
}

export function DayVaccinesSheet({ 
  isOpen, 
  onClose, 
  selectedDate, 
  vaccines,
  onVaccineClick 
}: DayVaccinesSheetProps) {
  const dayVaccines = selectedDate 
    ? vaccines.filter(v => isSameDay(new Date(v.date), selectedDate))
    : [];

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
          {dayVaccines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Syringe className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No hay vacunas este día</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayVaccines.map((vaccine) => (
                <VaccineCard 
                  key={vaccine.id} 
                  vaccine={vaccine} 
                  onClick={() => {
                    onVaccineClick(vaccine);
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
