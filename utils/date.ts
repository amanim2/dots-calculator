import type { PatientOutcome } from '../types';

// This script relies on the jalali-moment library being available in the global scope
declare var moment: any;

const POSITIVE_SMEAR_RESULTS = ["1-9", "1+", "2+", "3+", "+1", "+2", "+3", "مثبت"];

export const isSmearPositive = (result: string): boolean => {
    if (!result) return false;
    const lowerResult = result.toLowerCase().replace(/ /g, '').replace('باسیل', '');
    return POSITIVE_SMEAR_RESULTS.some(term => lowerResult.includes(term));
}

export const getSmearResultStatus = (result: string): 'مثبت' | 'منفی' | 'در حال انتظار' => {
    const trimmedResult = result?.trim().toLowerCase() ?? '';
    if (!trimmedResult || trimmedResult === 'انجام نداده') {
        return 'در حال انتظار';
    }
    if (isSmearPositive(result)) {
        return 'مثبت';
    }
    if (trimmedResult.includes('منفی')) {
        return 'منفی';
    }
    return 'در حال انتظار';
};


export const getYearFromDate = (dateStr: string): number => {
    return moment(dateStr, 'jYYYY/jMM/jDD').jYear();
};

export const getPeriodBoundaries = (year: number) => {
    const yearStart = moment(`${year}/01/01`, 'jYYYY/jM/jD').startOf('day');
    const firstHalfEnd = moment(`${year}/06/31`, 'jYYYY/jM/jD').endOf('day');
    const secondHalfStart = moment(`${year}/07/01`, 'jYYYY/jM/jD').startOf('day');
    const yearEnd = moment(`${year}/12/${moment.jIsLeapYear(year) ? 30 : 29}`, 'jYYYY/jM/jD').endOf('day');

    return {
        firstHalf: { start: yearStart, end: firstHalfEnd },
        secondHalf: { start: secondHalfStart, end: yearEnd },
        fullYear: { start: yearStart, end: yearEnd }
    };
};

const countFridays = (start: any, end: any): number => {
    if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
        return 0;
    }
    let fridays = 0;
    let current = start.clone();
    while (current.isSameOrBefore(end)) {
        if (current.jDay() === 6) { // In jalali-moment, Friday is 6 (0=Saturday, ..., 6=Friday)
            fridays++;
        }
        current.add(1, 'day');
    }
    return fridays;
};

const calculateDaysInPeriod = (phaseStart: any, phaseEnd: any, periodStart: any, periodEnd: any): number => {
    if (!phaseStart.isValid() || !phaseEnd.isValid() || phaseStart.isAfter(phaseEnd)) return 0;

    const effectiveStart = moment.max(phaseStart, periodStart);
    const effectiveEnd = moment.min(phaseEnd, periodEnd);

    if (effectiveStart.isAfter(effectiveEnd)) {
        return 0;
    }

    return effectiveEnd.diff(effectiveStart, 'days') + 1;
};


export const calculatePatientMetrics = (
    patient: { treatmentStartDate: string; smearResultMonth2: string; },
    outcome?: PatientOutcome,
    calculationCutoffDate?: string | null
) => {
    const startDate = moment(patient.treatmentStartDate, 'jYYYY/jMM/jDD');
    if (!startDate.isValid()) {
        const emptyPeriod = { intensiveRequired: 0, intensiveReceived: 0, intensiveCoverage: '0.0', continuationRequired: 0, continuationReceived: 0, continuationCoverage: '0.0', totalRequired: 0, totalReceived: 0, totalCoverage: '0.0' };
        return { firstHalf: emptyPeriod, secondHalf: emptyPeriod, annual: emptyPeriod };
    }

    const outcomeDate = (outcome && outcome.date && moment(outcome.date, 'jYYYY/jMM/jDD', true).isValid())
        ? moment(outcome.date, 'jYYYY/jMM/jDD')
        : null;

    const cutoffMoment = (calculationCutoffDate && moment(calculationCutoffDate, 'jYYYY/jMM/jDD', true).isValid())
        ? moment(calculationCutoffDate, 'jYYYY/jMM/jDD')
        : null;

    const year = getYearFromDate(patient.treatmentStartDate);
    const boundaries = getPeriodBoundaries(year);

    let intensivePhaseEndDate: any;
    let continuationPhaseStartDate: any | null = null;
    let continuationPhaseEndDate: any | null = null;
    let isContinuationUnknown = false;

    if (outcomeDate) {
        intensivePhaseEndDate = outcomeDate.clone();
    } else {
        const smearStatus = getSmearResultStatus(patient.smearResultMonth2);
        isContinuationUnknown = smearStatus === 'در حال انتظار';
        const positiveSmear = smearStatus === 'مثبت';

        const intensiveDuration = positiveSmear ? 93 : 62;
        const continuationDuration = 120;

        intensivePhaseEndDate = startDate.clone().add(intensiveDuration - 1, 'days');
        
        if (!isContinuationUnknown) {
            continuationPhaseStartDate = intensivePhaseEndDate.clone().add(1, 'day');
            continuationPhaseEndDate = continuationPhaseStartDate.clone().add(continuationDuration - 1, 'days');
        }
    }

    const periods = {
        firstHalf: boundaries.firstHalf,
        secondHalf: boundaries.secondHalf,
        annual: boundaries.fullYear
    };
    
    const results: any = {};

    for (const periodName in periods) {
        const period = periods[periodName as keyof typeof periods];
        const finalPeriodEnd = cutoffMoment ? moment.min(period.end, cutoffMoment) : period.end;

        // --- Intensive phase calculation ---
        const intensiveRequired = calculateDaysInPeriod(startDate, intensivePhaseEndDate, period.start, finalPeriodEnd);
        const intensiveFridays = countFridays(moment.max(startDate, period.start), moment.min(intensivePhaseEndDate, finalPeriodEnd));
        const intensiveReceived = intensiveRequired > 0 ? intensiveRequired - intensiveFridays : 0;
        const intensiveCoverage = intensiveRequired > 0 ? ((intensiveReceived / intensiveRequired) * 100).toFixed(1) : '0.0';

        // --- Continuation phase calculation ---
        let continuationRequired: number | null = 0;
        let continuationReceived: number | null = 0;
        let continuationCoverage: string = '0.0';

        if (isContinuationUnknown) { 
            continuationRequired = null;
            continuationReceived = null;
            continuationCoverage = '-';
        } else if (continuationPhaseStartDate && continuationPhaseEndDate) {
            continuationRequired = calculateDaysInPeriod(continuationPhaseStartDate, continuationPhaseEndDate, period.start, finalPeriodEnd);
            if (continuationRequired > 0) {
                 const continuationFridays = countFridays(moment.max(continuationPhaseStartDate, period.start), moment.min(continuationPhaseEndDate, finalPeriodEnd));
                 continuationReceived = continuationRequired - continuationFridays;
                 continuationCoverage = ((continuationReceived / continuationRequired) * 100).toFixed(1);
            } else {
                 continuationRequired = 0;
                 continuationReceived = 0;
                 continuationCoverage = '0.0';
            }
        }
        
        const totalRequired = intensiveRequired + (continuationRequired || 0);
        const totalReceived = intensiveReceived + (continuationReceived || 0);
        const totalCoverage = totalRequired > 0 ? ((totalReceived / totalRequired) * 100).toFixed(1) : '0.0';

        results[periodName] = {
            intensiveRequired,
            intensiveReceived,
            intensiveCoverage,
            continuationRequired,
            continuationReceived,
            continuationCoverage,
            totalRequired,
            totalReceived,
            totalCoverage
        };
    }
    
    return results as { firstHalf: any; secondHalf: any; annual: any; };
};
