import { useState, useRef } from 'react';
import { Dog as DogIcon, Plus, Trash2, Camera, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dog } from '@/types/dog';
import { useDogs } from '@/hooks/useDogs';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface DogSelectorProps {
  onSelectDog: (dog: Dog) => void;
}

export function DogSelector({ onSelectDog }: DogSelectorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDogName, setNewDogName] = useState('');
  const [newDogBirthDate, setNewDogBirthDate] = useState('');
  const [newDogPassword, setNewDogPassword] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Password entry for existing dogs
  const [selectedDogForPassword, setSelectedDogForPassword] = useState<Dog | null>(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dogs, isLoading, createDog, deleteDog } = useDogs();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;

    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('dog-photos')
      .upload(fileName, photoFile);

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      toast.error('Error al subir la foto');
      return null;
    }

    const { data } = supabase.storage
      .from('dog-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleCreateDog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDogName.trim()) return;
    if (newDogPassword.length !== 4) {
      toast.error('La contraseña debe tener 4 números');
      return;
    }

    setIsUploading(true);
    
    try {
      const photoUrl = await uploadPhoto();
      
      const result = await createDog.mutateAsync({
        name: newDogName.trim(),
        birth_date: newDogBirthDate || null,
        password: newDogPassword,
        photo_url: photoUrl,
      });
      
      resetForm();
      onSelectDog(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setNewDogName('');
    setNewDogBirthDate('');
    setNewDogPassword('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowCreateForm(false);
  };

  const handleDogClick = (dog: Dog) => {
    setSelectedDogForPassword(dog);
    setEnteredPassword('');
  };

  const handlePasswordSubmit = () => {
    if (!selectedDogForPassword) return;
    
    if (enteredPassword === selectedDogForPassword.password) {
      onSelectDog(selectedDogForPassword);
      setSelectedDogForPassword(null);
      setEnteredPassword('');
    } else {
      toast.error('Contraseña incorrecta');
      setEnteredPassword('');
    }
  };

  const handleDeleteDog = (dogId: string) => {
    deleteDog.mutate(dogId);
  };

  // Password entry screen
  if (selectedDogForPassword) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden bg-primary/10 shadow-glow">
            {selectedDogForPassword.photo_url ? (
              <img 
                src={selectedDogForPassword.photo_url} 
                alt={selectedDogForPassword.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <DogIcon className="w-12 h-12 text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{selectedDogForPassword.name}</h1>
          <p className="text-muted-foreground mt-1">Introduce la contraseña</p>
        </div>

        <div className="w-full max-w-xs space-y-6 animate-slide-up">
          <div className="flex justify-center">
            <InputOTP
              maxLength={4}
              value={enteredPassword}
              onChange={(value) => {
                setEnteredPassword(value);
                if (value.length === 4) {
                  setTimeout(() => {
                    if (value === selectedDogForPassword.password) {
                      onSelectDog(selectedDogForPassword);
                      setSelectedDogForPassword(null);
                      setEnteredPassword('');
                    } else {
                      toast.error('Contraseña incorrecta');
                      setEnteredPassword('');
                    }
                  }, 200);
                }
              }}
              pattern="[0-9]*"
              inputMode="numeric"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="w-14 h-14 text-2xl" />
                <InputOTPSlot index={1} className="w-14 h-14 text-2xl" />
                <InputOTPSlot index={2} className="w-14 h-14 text-2xl" />
                <InputOTPSlot index={3} className="w-14 h-14 text-2xl" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setSelectedDogForPassword(null);
              setEnteredPassword('');
            }}
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

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
                  onClick={() => handleDogClick(dog)}
                  className="flex-1 flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50 shadow-soft hover:shadow-glow hover:border-primary/30 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-primary/10">
                    {dog.photo_url ? (
                      <img 
                        src={dog.photo_url} 
                        alt={dog.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <DogIcon className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                      {dog.name}
                      <Lock className="w-3 h-3 text-muted-foreground" />
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
            
            {/* Photo upload */}
            <div className="flex justify-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-muted-foreground" />
                )}
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground">Toca para añadir foto</p>
            
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

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Contraseña (4 números) *</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={4}
                  value={newDogPassword}
                  onChange={setNewDogPassword}
                  pattern="[0-9]*"
                  inputMode="numeric"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-12 text-xl" />
                    <InputOTPSlot index={1} className="w-12 h-12 text-xl" />
                    <InputOTPSlot index={2} className="w-12 h-12 text-xl" />
                    <InputOTPSlot index={3} className="w-12 h-12 text-xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={resetForm}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={createDog.isPending || isUploading || newDogPassword.length !== 4}
              >
                {createDog.isPending || isUploading ? 'Creando...' : 'Crear'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
