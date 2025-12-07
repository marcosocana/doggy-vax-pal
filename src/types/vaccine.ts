export type VaccineStatus = 'administered' | 'scheduled' | 'overdue';
export type PeriodicityUnit = 'days' | 'weeks' | 'months' | 'years';
export type VaccineType = 'core' | 'non_core' | 'optional' | 'deworming' | 'other';

export interface Vaccine {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  date: string;
  is_repeatable: boolean;
  periodicity: number | null;
  periodicity_unit: PeriodicityUnit | null;
  status: VaccineStatus;
  vaccine_type: VaccineType;
  created_at: string;
  updated_at: string;
}

export interface VaccineFormData {
  name: string;
  description: string;
  date: string;
  is_repeatable: boolean;
  periodicity: number | null;
  periodicity_unit: PeriodicityUnit | null;
  status: VaccineStatus;
  vaccine_type: VaccineType;
}

export const vaccineTypeLabels: Record<VaccineType, string> = {
  core: 'Esencial',
  non_core: 'Complementaria',
  optional: 'Opcional',
  deworming: 'Desparasitación',
  other: 'Otra',
};

export const vaccineStatusLabels: Record<VaccineStatus, string> = {
  administered: 'Administrada',
  scheduled: 'Programada',
  overdue: 'Pendiente',
};

export const periodicityUnitLabels: Record<PeriodicityUnit, string> = {
  days: 'días',
  weeks: 'semanas',
  months: 'meses',
  years: 'años',
};
