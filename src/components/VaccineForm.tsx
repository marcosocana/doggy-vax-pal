import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
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
  selectedDate?: Date;
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

export function VaccineForm({ isOpen, onClose, onSubmit, vaccine, selectedDate }: VaccineFormProps) {
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
    } else if (selectedDate) {
      setFormData({
        ...defaultFormData,
        date: format(selectedDate, 'yyyy-MM-dd'),
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [vaccine, selectedDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">
              {vaccine ? 'Editar Vacuna' : 'Nueva Vacuna'}
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto max-h-[calc(90vh-120px)] pb-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">Nombre de la vacuna *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Rabia, Parvovirus..."
              required
              className="h-12"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-semibold">Fecha *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="h-12"
            />
          </div>

          {/* Vaccine Type */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Tipo de vacuna</Label>
            <Select
              value={formData.vaccine_type}
              onValueChange={(value: VaccineType) => setFormData({ ...formData, vaccine_type: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(vaccineTypeLabels) as VaccineType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {vaccineTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value: VaccineStatus) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(vaccineStatusLabels) as VaccineStatus[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    {vaccineStatusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Repeatable */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <Label htmlFor="repeatable" className="text-sm font-semibold">¿Es repetible?</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Activa si la vacuna se repite periódicamente</p>
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
            />
          </div>

          {/* Periodicity */}
          {formData.is_repeatable && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="periodicity" className="text-sm font-semibold">Cada</Label>
                <Input
                  id="periodicity"
                  type="number"
                  min="1"
                  value={formData.periodicity || ''}
                  onChange={(e) => setFormData({ ...formData, periodicity: parseInt(e.target.value) || null })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Unidad</Label>
                <Select
                  value={formData.periodicity_unit || 'years'}
                  onValueChange={(value: PeriodicityUnit) => setFormData({ ...formData, periodicity_unit: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(periodicityUnitLabels) as PeriodicityUnit[]).map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {periodicityUnitLabels[unit]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full mt-6">
            {vaccine ? 'Guardar cambios' : 'Añadir vacuna'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
