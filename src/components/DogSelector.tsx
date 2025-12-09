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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 safe-area-inset">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-28 h-28 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden bg-primary/10 shadow-glow">
            {selectedDogForPassword.photo_url ? (
              <img 
                src={selectedDogForPassword.photo_url} 
                alt={selectedDogForPassword.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <DogIcon className="w-14 h-14 sm:w-12 sm:h-12 text-primary" />
            )}
          </div>
          <h1 className="text-2xl sm:text-2xl font-bold text-foreground">{selectedDogForPassword.name}</h1>
          <p className="text-muted-foreground mt-1 text-base">Introduce la contraseña</p>
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
                <InputOTPSlot index={0} className="w-16 h-16 sm:w-14 sm:h-14 text-2xl" />
                <InputOTPSlot index={1} className="w-16 h-16 sm:w-14 sm:h-14 text-2xl" />
                <InputOTPSlot index={2} className="w-16 h-16 sm:w-14 sm:h-14 text-2xl" />
                <InputOTPSlot index={3} className="w-16 h-16 sm:w-14 sm:h-14 text-2xl" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            variant="secondary"
            size="lg"
            className="w-full h-12 text-base touch-manipulation"
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 safe-area-inset">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 animate-fade-in">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-glow">
          <DogIcon className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">VacunasPet</h1>
        <p className="text-muted-foreground mt-1 text-base">Elige o crea tu perrito</p>
      </div>

      {/* Dog List */}
      <div className="w-full max-w-sm space-y-3 animate-slide-up">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-base">Cargando...</div>
        ) : dogs.length === 0 && !showCreateForm ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-5 text-base">No hay perritos aún</p>
            <Button onClick={() => setShowCreateForm(true)} size="lg" className="h-12 px-6 touch-manipulation">
              <Plus className="w-5 h-5 mr-2" />
              Crear mi primer perrito
            </Button>
          </div>
        ) : (
          <>
            {dogs.map((dog, idx) => (
              <div
                key={dog.id}
                className="flex items-center gap-2 sm:gap-3 animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <button
                  onClick={() => handleDogClick(dog)}
                  className="flex-1 flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50 shadow-soft active:shadow-glow active:border-primary/30 transition-all text-left group min-h-[72px] touch-manipulation"
                >
                  <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-full flex items-center justify-center overflow-hidden bg-primary/10 flex-shrink-0">
                    {dog.photo_url ? (
                      <img 
                        src={dog.photo_url} 
                        alt={dog.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <DogIcon className="w-7 h-7 sm:w-6 sm:h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground group-active:text-primary transition-colors flex items-center gap-2 text-base">
                      <span className="truncate">{dog.name}</span>
                      <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    </h3>
                    {dog.birth_date && (
                      <p className="text-sm text-muted-foreground">
                        Nacido: {new Date(dog.birth_date).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                </button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-12 w-12 min-w-[48px] touch-manipulation">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="mx-4 max-w-[calc(100vw-2rem)]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar a {dog.name}?</AlertDialogTitle>
                      <AlertDialogDescription className="text-base">
                        Se eliminarán todas sus vacunas. Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                      <AlertDialogCancel className="h-12 text-base">Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteDog(dog.id)} className="h-12 text-base">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}

            {!showCreateForm && (
              <Button
                variant="outline"
                size="lg"
                className="w-full mt-4 h-12 text-base touch-manipulation"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Añadir otro perrito
              </Button>
            )}
          </>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateDog} className="bg-card rounded-xl p-4 sm:p-5 border border-border/50 shadow-soft space-y-4 animate-scale-in">
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
                className="w-28 h-28 sm:w-24 sm:h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border active:border-primary transition-colors touch-manipulation"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-10 h-10 sm:w-8 sm:h-8 text-muted-foreground" />
                )}
              </button>
            </div>
            <p className="text-center text-sm text-muted-foreground">Toca para añadir foto</p>
            
            <div className="space-y-1.5">
              <Label htmlFor="dogName" className="text-sm font-semibold">Nombre *</Label>
              <Input
                id="dogName"
                value={newDogName}
                onChange={(e) => setNewDogName(e.target.value)}
                placeholder="¿Cómo se llama?"
                required
                autoFocus
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dogBirth" className="text-sm font-semibold">Fecha de nacimiento</Label>
              <Input
                id="dogBirth"
                type="date"
                value={newDogBirthDate}
                onChange={(e) => setNewDogBirthDate(e.target.value)}
                className="h-12 text-base"
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
                    <InputOTPSlot index={0} className="w-14 h-14 sm:w-12 sm:h-12 text-xl" />
                    <InputOTPSlot index={1} className="w-14 h-14 sm:w-12 sm:h-12 text-xl" />
                    <InputOTPSlot index={2} className="w-14 h-14 sm:w-12 sm:h-12 text-xl" />
                    <InputOTPSlot index={3} className="w-14 h-14 sm:w-12 sm:h-12 text-xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="flex-1 h-12 text-base touch-manipulation"
                onClick={resetForm}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                size="lg"
                className="flex-1 h-12 text-base touch-manipulation" 
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
