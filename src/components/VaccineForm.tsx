import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  VaccineFormData, 
  Vaccine, 
  VaccineType, 
  VaccineStatus, 
  PeriodicityUnit,
  vaccineTypeLabels,
  vaccineStatusLabels,
  periodicityUnitLabels 
} from '@/types/vaccine';

interface VaccineFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VaccineFormData) => void;
  vaccine?: Vaccine | null;
  initialDate?: string;
}

const defaultFormData: VaccineFormData = {
  name: '',
  description: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  is_repeatable: false,
  periodicity: null,
  periodicity_unit: null,
  status: 'scheduled',
  vaccine_type: 'other',
};

export function VaccineForm({ isOpen, onClose, onSubmit, vaccine, initialDate }: VaccineFormProps) {
  const [formData, setFormData] = useState<VaccineFormData>(defaultFormData);

  useEffect(() => {
    if (vaccine) {
      setFormData({
        name: vaccine.name,
        description: vaccine.description || '',
        date: vaccine.date,
        is_repeatable: vaccine.is_repeatable,
        periodicity: vaccine.periodicity,
        periodicity_unit: vaccine.periodicity_unit,
        status: vaccine.status,
        vaccine_type: vaccine.vaccine_type,
      });
    } else if (initialDate) {
      setFormData({ ...defaultFormData, date: initialDate });
    } else {
      setFormData(defaultFormData);
    }
  }, [vaccine, initialDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] sm:h-[90vh] rounded-t-3xl px-4 sm:px-6">
        <SheetHeader className="text-left pb-3 sm:pb-4">
          <SheetTitle className="text-lg sm:text-xl font-bold">
            {vaccine ? 'Editar Vacuna' : 'Nueva Vacuna'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(85vh-100px)] sm:max-h-[calc(90vh-120px)] pb-6 -mx-1 px-1">
          {/* Name */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">Nombre de la vacuna *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Rabia, Parvovirus..."
              required
              className="h-12 text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Notas adicionales..."
              rows={2}
              className="text-base resize-none"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="date" className="text-sm font-semibold">Fecha *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="h-12 text-base"
            />
          </div>

          {/* Type and Status in row on mobile */}
          <div className="grid grid-cols-2 gap-3">
            {/* Vaccine Type */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm font-semibold">Tipo</Label>
              <Select
                value={formData.vaccine_type}
                onValueChange={(value: VaccineType) => setFormData({ ...formData, vaccine_type: value })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(vaccineTypeLabels) as VaccineType[]).map((type) => (
                    <SelectItem key={type} value={type} className="text-base py-3">
                      {vaccineTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-sm font-semibold">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: VaccineStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(vaccineStatusLabels) as VaccineStatus[]).map((status) => (
                    <SelectItem key={status} value={status} className="text-base py-3">
                      {vaccineStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Repeatable */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-muted rounded-xl gap-3">
            <div className="flex-1 min-w-0">
              <Label htmlFor="repeatable" className="text-sm font-semibold">¿Es repetible?</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Se repite periódicamente</p>
            </div>
            <Switch
              id="repeatable"
              checked={formData.is_repeatable}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                is_repeatable: checked,
                periodicity: checked ? 1 : null,
                periodicity_unit: checked ? 'years' : null,
              })}
              className="scale-110"
            />
          </div>

          {/* Periodicity */}
          {formData.is_repeatable && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="periodicity" className="text-sm font-semibold">Cada</Label>
                <Input
                  id="periodicity"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={formData.periodicity || ''}
                  onChange={(e) => setFormData({ ...formData, periodicity: parseInt(e.target.value) || null })}
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm font-semibold">Unidad</Label>
                <Select
                  value={formData.periodicity_unit || 'years'}
                  onValueChange={(value: PeriodicityUnit) => setFormData({ ...formData, periodicity_unit: value })}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(periodicityUnitLabels) as PeriodicityUnit[]).map((unit) => (
                      <SelectItem key={unit} value={unit} className="text-base py-3">
                        {periodicityUnitLabels[unit]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full mt-4 sm:mt-6 h-14 text-base touch-manipulation">
            {vaccine ? 'Guardar cambios' : 'Añadir vacuna'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
