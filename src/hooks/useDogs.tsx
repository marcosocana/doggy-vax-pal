import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dog, DogFormData } from '@/types/dog';
import { toast } from 'sonner';

export function useDogs() {
  const queryClient = useQueryClient();

  const { data: dogs = [], isLoading, error } = useQuery({
    queryKey: ['dogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Dog[];
    },
  });

  const createDog = useMutation({
    mutationFn: async (dog: DogFormData) => {
      const { data, error } = await supabase
        .from('dogs')
        .insert([dog])
        .select()
        .single();

      if (error) throw error;
      return data as Dog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      toast.success('¡Perrito añadido!');
    },
    onError: (error) => {
      toast.error('Error al añadir el perrito');
      console.error(error);
    },
  });

  const deleteDog = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      toast.success('Perrito eliminado');
    },
    onError: (error) => {
      toast.error('Error al eliminar');
      console.error(error);
    },
  });

  return {
    dogs,
    isLoading,
    error,
    createDog,
    deleteDog,
  };
}
