import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Vaccine, VaccineFormData } from '@/types/vaccine';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useVaccines() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: vaccines = [], isLoading, error } = useQuery({
    queryKey: ['vaccines', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('vaccines')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      return data as Vaccine[];
    },
    enabled: !!user,
  });

  const createVaccine = useMutation({
    mutationFn: async (vaccine: VaccineFormData) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('vaccines')
        .insert([{ ...vaccine, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccines'] });
      toast.success('Vacuna añadida correctamente');
    },
    onError: (error) => {
      toast.error('Error al añadir la vacuna');
      console.error(error);
    },
  });

  const updateVaccine = useMutation({
    mutationFn: async ({ id, vaccine }: { id: string; vaccine: Partial<VaccineFormData> }) => {
      const { data, error } = await supabase
        .from('vaccines')
        .update(vaccine)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccines'] });
      toast.success('Vacuna actualizada correctamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar la vacuna');
      console.error(error);
    },
  });

  const deleteVaccine = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vaccines')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccines'] });
      toast.success('Vacuna eliminada correctamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar la vacuna');
      console.error(error);
    },
  });

  return {
    vaccines,
    isLoading,
    error,
    createVaccine,
    updateVaccine,
    deleteVaccine,
  };
}
