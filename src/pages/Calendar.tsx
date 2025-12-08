import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarHeader } from '@/components/CalendarHeader';
import { CalendarGrid } from '@/components/CalendarGrid';
import { VaccineList } from '@/components/VaccineList';
import { VaccineForm } from '@/components/VaccineForm';
import { VaccineDetail } from '@/components/VaccineDetail';
import { DayVaccinesSheet } from '@/components/DayVaccinesSheet';
import { DogSelector } from '@/components/DogSelector';
import { useVaccines } from '@/hooks/useVaccines';
import { Vaccine, VaccineFormData } from '@/types/vaccine';
import { Dog } from '@/types/dog';
import { Skeleton } from '@/components/ui/skeleton';

const SELECTED_DOG_KEY = 'vacunaspet_selected_dog';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);

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

  const handleVaccineClick = (vaccine: Vaccine) => {
    setSelectedVaccine(vaccine);
    setIsDetailOpen(true);
  };

  const handleEditVaccine = () => {
    setEditingVaccine(selectedVaccine);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleDeleteVaccine = () => {
    if (selectedVaccine) {
      deleteVaccine.mutate(selectedVaccine.id);
      setIsDetailOpen(false);
      setSelectedVaccine(null);
    }
  };

  const handleFormSubmit = (data: VaccineFormData) => {
    if (editingVaccine) {
      updateVaccine.mutate({ id: editingVaccine.id, vaccine: data });
    } else {
      createVaccine.mutate(data);
    }
    setEditingVaccine(null);
    setSelectedDate(undefined);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingVaccine(null);
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
        vaccines={vaccines}
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
          onVaccineClick={handleVaccineClick}
        />
      )}

      {/* FAB */}
      <Button
        variant="floating"
        size="fab"
        onClick={() => {
          setEditingVaccine(null);
          setSelectedDate(undefined);
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
        vaccines={vaccines}
        onVaccineClick={handleVaccineClick}
      />

      {/* Form Sheet */}
      <VaccineForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        vaccine={editingVaccine}
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
