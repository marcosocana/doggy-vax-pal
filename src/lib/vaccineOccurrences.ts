import { addDays, addWeeks, addMonths, addYears, isBefore, startOfDay, isAfter } from 'date-fns';
import { Vaccine, PeriodicityUnit } from '@/types/vaccine';

export interface VaccineOccurrence {
  vaccine: Vaccine;
  occurrenceDate: Date;
  isOriginal: boolean; // true if this is the original date, false if calculated
}

const MAX_YEARS_AHEAD = 10;

function addPeriod(date: Date, amount: number, unit: PeriodicityUnit): Date {
  switch (unit) {
    case 'days':
      return addDays(date, amount);
    case 'weeks':
      return addWeeks(date, amount);
    case 'months':
      return addMonths(date, amount);
    case 'years':
      return addYears(date, amount);
    default:
      return date;
  }
}

export function calculateVaccineOccurrences(vaccines: Vaccine[]): VaccineOccurrence[] {
  const occurrences: VaccineOccurrence[] = [];
  const today = startOfDay(new Date());
  const maxDate = addYears(today, MAX_YEARS_AHEAD);

  for (const vaccine of vaccines) {
    const originalDate = startOfDay(new Date(vaccine.date));
    
    // Always add the original occurrence
    occurrences.push({
      vaccine,
      occurrenceDate: originalDate,
      isOriginal: true,
    });

    // If repeatable, calculate future occurrences
    if (vaccine.is_repeatable && vaccine.periodicity && vaccine.periodicity_unit) {
      let nextDate = addPeriod(originalDate, vaccine.periodicity, vaccine.periodicity_unit);
      
      while (isBefore(nextDate, maxDate)) {
        occurrences.push({
          vaccine,
          occurrenceDate: nextDate,
          isOriginal: false,
        });
        nextDate = addPeriod(nextDate, vaccine.periodicity, vaccine.periodicity_unit);
      }
    }
  }

  return occurrences;
}

export function getOccurrencesForDay(occurrences: VaccineOccurrence[], date: Date): VaccineOccurrence[] {
  const targetDay = startOfDay(date);
  return occurrences.filter(occ => 
    startOfDay(occ.occurrenceDate).getTime() === targetDay.getTime()
  );
}

export function hasVaccinesOnDay(occurrences: VaccineOccurrence[], date: Date): boolean {
  return getOccurrencesForDay(occurrences, date).length > 0;
}
