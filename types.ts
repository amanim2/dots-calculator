export interface PatientInput {
  tbId: string; // شماره سل
  treatmentStartDate: string; // تاریخ شروع درمان
  smearResultMonth2: string; // نتیجه اسمیر ماه دو
}

export interface CalculatedPeriod {
  intensiveRequired: number;
  intensiveReceived: number;
  intensiveCoverage: string;
  continuationRequired: number | null;
  continuationReceived: number | null;
  continuationCoverage: string;
  totalRequired: number;
  totalReceived: number;
  totalCoverage: string;
}

export type PatientOutcomeStatus = 'فوت' | 'امتناع از درمان' | 'مهاجرت';

export interface PatientOutcome {
  status: PatientOutcomeStatus;
  date: string;
}


export interface PatientRecord extends PatientInput {
  dataBatch: 'firstHalf' | 'secondHalf';
  firstHalf: CalculatedPeriod;
  secondHalf: CalculatedPeriod;
  annual: CalculatedPeriod;
  finalOutcome?: PatientOutcome;
}

export type PageView = 'firstHalf' | 'secondHalf' | 'annual';