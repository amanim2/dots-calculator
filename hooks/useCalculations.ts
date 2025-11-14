import { useMemo } from 'react';
import type { PatientInput, PatientRecord, PatientOutcome } from '../types';
import { calculatePatientMetrics } from '../utils/date';

export const useCalculations = (
  patientInputs: (PatientInput & { dataBatch: 'firstHalf' | 'secondHalf' })[],
  patientOutcomes: Record<string, PatientOutcome>,
  calculationDate?: string | null
): PatientRecord[] => {
  const processedData = useMemo(() => {
    if (!patientInputs || patientInputs.length === 0) {
      return [];
    }

    return patientInputs.map(patient => {
      const outcome = patientOutcomes[patient.tbId];
      const metrics = calculatePatientMetrics(patient, outcome, calculationDate);
      return {
        ...patient,
        ...metrics,
        finalOutcome: outcome,
      };
    });
  }, [patientInputs, patientOutcomes, calculationDate]);

  return processedData as PatientRecord[];
};
