import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface EditSeriesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEditSingle: () => void;
  onEditSeries: () => void;
}

export function EditSeriesDialog({ isOpen, onClose, onEditSingle, onEditSeries }: EditSeriesDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[90vw] rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Qué deseas editar?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta vacuna se repite periódicamente. Puedes editar solo este evento o toda la serie.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction onClick={onEditSeries} className="w-full">
            Editar toda la serie
          </AlertDialogAction>
          <Button onClick={onEditSingle} variant="outline" className="w-full">
            Solo este evento
          </Button>
          <AlertDialogCancel className="w-full mt-0">Cancelar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
