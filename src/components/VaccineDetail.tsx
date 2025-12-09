import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Repeat, Trash2, Edit2, Syringe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Vaccine, vaccineTypeLabels, vaccineStatusLabels, periodicityUnitLabels } from '@/types/vaccine';
import { cn } from '@/lib/utils';

interface VaccineDetailProps {
  vaccine: Vaccine | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const statusColors = {
  administered: 'bg-vaccine-administered text-white',
  scheduled: 'bg-vaccine-scheduled text-white',
  overdue: 'bg-vaccine-overdue text-white',
};

const typeColors = {
  core: 'bg-vaccine-core',
  non_core: 'bg-vaccine-non-core',
  optional: 'bg-vaccine-optional',
  deworming: 'bg-vaccine-deworming',
  other: 'bg-vaccine-other',
};

export function VaccineDetail({ vaccine, isOpen, onClose, onEdit, onDelete }: VaccineDetailProps) {
  if (!vaccine) return null;

  const formattedDate = format(new Date(vaccine.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-3xl px-4 sm:px-6">
        <SheetHeader className="text-left pb-4 sm:pb-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={cn('p-3 rounded-2xl flex-shrink-0', typeColors[vaccine.vaccine_type])}>
              <Syringe className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg sm:text-xl font-bold mb-2 truncate">{vaccine.name}</SheetTitle>
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-semibold inline-block',
                statusColors[vaccine.status]
              )}>
                {vaccineStatusLabels[vaccine.status]}
              </span>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[calc(85vh-180px)] -mx-1 px-1">
          {/* Date */}
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted rounded-xl">
            <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p className="font-semibold capitalize text-sm sm:text-base truncate">{formattedDate}</p>
            </div>
          </div>

          {/* Description */}
          {vaccine.description && (
            <div className="p-3 sm:p-4 bg-muted rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Descripción</p>
              <p className="text-foreground text-sm sm:text-base">{vaccine.description}</p>
            </div>
          )}

          {/* Type */}
          <div className="p-3 sm:p-4 bg-muted rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Tipo de vacuna</p>
            <div className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded-full flex-shrink-0', typeColors[vaccine.vaccine_type])} />
              <p className="font-semibold text-sm sm:text-base">{vaccineTypeLabels[vaccine.vaccine_type]}</p>
            </div>
          </div>

          {/* Periodicity */}
          {vaccine.is_repeatable && vaccine.periodicity && vaccine.periodicity_unit && (
            <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted rounded-xl">
              <Repeat className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Periodicidad</p>
                <p className="font-semibold text-sm sm:text-base">
                  Cada {vaccine.periodicity} {periodicityUnitLabels[vaccine.periodicity_unit]}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 pb-2">
          <Button variant="secondary" size="lg" className="flex-1 h-12 sm:h-11 text-base touch-manipulation" onClick={onEdit}>
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="lg" className="flex-1 h-12 sm:h-11 text-base touch-manipulation">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="mx-4 max-w-[calc(100vw-2rem)]">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar vacuna?</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  Esta acción no se puede deshacer. Se eliminará permanentemente la vacuna "{vaccine.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2 sm:gap-0">
                <AlertDialogCancel className="h-12 text-base">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="h-12 text-base">Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
