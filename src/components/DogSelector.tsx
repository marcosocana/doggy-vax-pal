import { useState } from 'react';
import { Dog as DogIcon, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dog } from '@/types/dog';
import { useDogs } from '@/hooks/useDogs';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface DogSelectorProps {
  onSelectDog: (dog: Dog) => void;
}

export function DogSelector({ onSelectDog }: DogSelectorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDogName, setNewDogName] = useState('');
  const [newDogBirthDate, setNewDogBirthDate] = useState('');
  const { dogs, isLoading, createDog, deleteDog } = useDogs();

  const handleCreateDog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDogName.trim()) return;

    const result = await createDog.mutateAsync({
      name: newDogName.trim(),
      birth_date: newDogBirthDate || null,
    });
    
    setNewDogName('');
    setNewDogBirthDate('');
    setShowCreateForm(false);
    onSelectDog(result);
  };

  const handleDeleteDog = (dogId: string) => {
    deleteDog.mutate(dogId);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-glow">
          <DogIcon className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">VacunasPet</h1>
        <p className="text-muted-foreground mt-1">Elige o crea tu perrito</p>
      </div>

      {/* Dog List */}
      <div className="w-full max-w-sm space-y-3 animate-slide-up">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : dogs.length === 0 && !showCreateForm ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No hay perritos aún</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear mi primer perrito
            </Button>
          </div>
        ) : (
          <>
            {dogs.map((dog, idx) => (
              <div
                key={dog.id}
                className="flex items-center gap-3 animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <button
                  onClick={() => onSelectDog(dog)}
                  className="flex-1 flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50 shadow-soft hover:shadow-glow hover:border-primary/30 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <DogIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {dog.name}
                    </h3>
                    {dog.birth_date && (
                      <p className="text-xs text-muted-foreground">
                        Nacido: {new Date(dog.birth_date).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                </button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar a {dog.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Se eliminarán todas sus vacunas. Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteDog(dog.id)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}

            {!showCreateForm && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir otro perrito
              </Button>
            )}
          </>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateDog} className="bg-card rounded-xl p-5 border border-border/50 shadow-soft space-y-4 animate-scale-in">
            <h3 className="font-bold text-lg">Nuevo perrito</h3>
            
            <div className="space-y-2">
              <Label htmlFor="dogName" className="text-sm font-semibold">Nombre *</Label>
              <Input
                id="dogName"
                value={newDogName}
                onChange={(e) => setNewDogName(e.target.value)}
                placeholder="¿Cómo se llama?"
                required
                autoFocus
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dogBirth" className="text-sm font-semibold">Fecha de nacimiento</Label>
              <Input
                id="dogBirth"
                type="date"
                value={newDogBirthDate}
                onChange={(e) => setNewDogBirthDate(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewDogName('');
                  setNewDogBirthDate('');
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={createDog.isPending}>
                {createDog.isPending ? 'Creando...' : 'Crear'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
