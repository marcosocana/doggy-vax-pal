import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarHeader } from '@/components/CalendarHeader';
import { CalendarGrid } from '@/components/CalendarGrid';
import { VaccineList } from '@/components/VaccineList';
import { VaccineForm } from '@/components/VaccineForm';
import { VaccineDetail } from '@/components/VaccineDetail';
import { DayVaccinesSheet } from '@/components/DayVaccinesSheet';
import { DogSelector } from '@/components/DogSelector';
import { EditSeriesDialog } from '@/components/EditSeriesDialog';
import { useVaccines } from '@/hooks/useVaccines';
import { Vaccine, VaccineFormData } from '@/types/vaccine';
import { Dog } from '@/types/dog';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateVaccineOccurrences, getOccurrencesForDay, VaccineOccurrence } from '@/lib/vaccineOccurrences';

const SELECTED_DOG_KEY = 'vacunaspet_selected_dog';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<VaccineOccurrence | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);
  const [isSeriesDialogOpen, setIsSeriesDialogOpen] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [formInitialDate, setFormInitialDate] = useState<string | undefined>(undefined);

  // Load selected dog from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SELECTED_DOG_KEY);
    if (saved) {
      try {
        setSelectedDog(JSON.parse(saved));
      } catch {
        localStorage.removeItem(SELECTED_DOG_KEY);
      }
    }
  }, []);

  const { vaccines, isLoading, createVaccine, updateVaccine, deleteVaccine } = useVaccines(selectedDog?.id ?? null);

  // Calculate all vaccine occurrences (including repeating)
  const allOccurrences = useMemo(() => calculateVaccineOccurrences(vaccines), [vaccines]);

  // Get occurrences for the selected day
  const selectedDayOccurrences = useMemo(() => {
    if (!selectedDate) return [];
    return getOccurrencesForDay(allOccurrences, selectedDate);
  }, [allOccurrences, selectedDate]);

  const handleSelectDog = (dog: Dog) => {
    setSelectedDog(dog);
    localStorage.setItem(SELECTED_DOG_KEY, JSON.stringify(dog));
  };

  const handleChangeDog = () => {
    setSelectedDog(null);
    localStorage.removeItem(SELECTED_DOG_KEY);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsDaySheetOpen(true);
  };

  const handleVaccineClick = (occurrence: VaccineOccurrence) => {
    setSelectedVaccine(occurrence.vaccine);
    setSelectedOccurrence(occurrence);
    setIsDetailOpen(true);
  };

  const handleEditVaccine = () => {
    if (!selectedVaccine || !selectedOccurrence) return;
    
    // If the vaccine is repeatable and this is not the original occurrence, ask what to edit
    if (selectedVaccine.is_repeatable && !selectedOccurrence.isOriginal) {
      setIsDetailOpen(false);
      setIsSeriesDialogOpen(true);
    } else {
      // Edit the original/single vaccine
      setEditingVaccine(selectedVaccine);
      setIsDetailOpen(false);
      setIsFormOpen(true);
    }
  };

  const handleEditSeries = () => {
    // Edit the original vaccine (affects all future occurrences)
    setEditingVaccine(selectedVaccine);
    setIsSeriesDialogOpen(false);
    setIsFormOpen(true);
  };

  const handleEditSingle = () => {
    // Create a new non-repeatable vaccine for this specific date
    if (selectedOccurrence) {
      setFormInitialDate(format(selectedOccurrence.occurrenceDate, 'yyyy-MM-dd'));
      setEditingVaccine({
        ...selectedVaccine!,
        id: '', // New vaccine
        date: format(selectedOccurrence.occurrenceDate, 'yyyy-MM-dd'),
        is_repeatable: false,
        periodicity: null,
        periodicity_unit: null,
      });
    }
    setIsSeriesDialogOpen(false);
    setIsFormOpen(true);
  };

  const handleDeleteVaccine = () => {
    if (selectedVaccine) {
      deleteVaccine.mutate(selectedVaccine.id);
      setIsDetailOpen(false);
      setSelectedVaccine(null);
      setSelectedOccurrence(null);
    }
  };

  const handleFormSubmit = (data: VaccineFormData) => {
    if (editingVaccine && editingVaccine.id) {
      updateVaccine.mutate({ id: editingVaccine.id, vaccine: data });
    } else {
      createVaccine.mutate(data);
    }
    setEditingVaccine(null);
    setFormInitialDate(undefined);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingVaccine(null);
    setFormInitialDate(undefined);
  };

  const handleAddVaccineFromDay = () => {
    if (selectedDate) {
      setFormInitialDate(format(selectedDate, 'yyyy-MM-dd'));
      setEditingVaccine(null);
      setIsDaySheetOpen(false);
      setIsFormOpen(true);
    }
  };

  // Show dog selector if no dog selected
  if (!selectedDog) {
    return <DogSelector onSelectDog={handleSelectDog} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CalendarHeader 
        currentDate={currentDate} 
        onNavigate={setCurrentDate}
        dog={selectedDog}
        onChangeDog={handleChangeDog}
      />
      
      {/* Calendar Grid */}
      <CalendarGrid 
        currentDate={currentDate} 
        occurrences={allOccurrences}
        onDayClick={handleDayClick}
      />

      {/* Divider */}
      <div className="h-2 bg-muted" />

      {/* Vaccine List */}
      {isLoading ? (
        <div className="px-4 py-6 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : (
        <VaccineList 
          currentDate={currentDate}
          vaccines={vaccines}
          onVaccineClick={(vaccine) => handleVaccineClick({ vaccine, occurrenceDate: new Date(vaccine.date), isOriginal: true })}
        />
      )}

      {/* FAB */}
      <Button
        variant="floating"
        size="fab"
        onClick={() => {
          setEditingVaccine(null);
          setFormInitialDate(undefined);
          setIsFormOpen(true);
        }}
        className="fixed bottom-6 right-6 z-20"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Day Vaccines Sheet */}
      <DayVaccinesSheet
        isOpen={isDaySheetOpen}
        onClose={() => setIsDaySheetOpen(false)}
        selectedDate={selectedDate}
        occurrences={selectedDayOccurrences}
        onVaccineClick={handleVaccineClick}
        onAddVaccine={handleAddVaccineFromDay}
      />

      {/* Edit Series Dialog */}
      <EditSeriesDialog
        isOpen={isSeriesDialogOpen}
        onClose={() => setIsSeriesDialogOpen(false)}
        onEditSingle={handleEditSingle}
        onEditSeries={handleEditSeries}
      />

      {/* Form Sheet */}
      <VaccineForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        vaccine={editingVaccine}
        initialDate={formInitialDate}
      />

      {/* Detail Sheet */}
      <VaccineDetail
        vaccine={selectedVaccine}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleEditVaccine}
        onDelete={handleDeleteVaccine}
      />
    </div>
  );
}
